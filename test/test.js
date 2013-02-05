var assert = require('assert'),
	http = require('http'),
	dispatcher = require('./lib/request-route'),
	fixture = require('../main'),
	resourcePath = process.env.PWD + '/test/test-responses',
	testOutPath = process.env.PWD + '/test-out',
	rm = require('rimraf'),
	fs = require('fs');
	

http.createServer(dispatcher.root(resourcePath).route).listen(1111);

suite('crawl', function() {
	
	var makeConfigFor = function(resourcePath, dist) {
		return {
			url: 'http://localhost:1111' + resourcePath,
			dist: testOutPath
		};
	};
	
	var cleanTestOutput = function(done) {
		fs.exists(testOutPath, function(exists) {
			if(exists) {
				rm(testOutPath, function(err){
					done();
				});							
			} else {
				done();
			}
		});
	};
	
	teardown(function(done){
		cleanTestOutput(done);	
	});

	var assertFileOnDisk = function(path) {
		assert.ok(fs.existsSync(path), path + ' wasn\'t found');
	};
	
	test('reads nested images', function(done) {
		
		fixture.crawl(makeConfigFor('/single-img-scenario.html'), function(err, data) {

			assert.equal(1, data.imgs.length);
			
			assert.equal('img/yield.gif', data.imgs[0].src);
			assert.equal(testOutPath + '/img-yield.gif', data.imgs[0].path);			
			assertFileOnDisk(data.imgs[0].path);

			done();
		
		});
	
	});
	
	test('reads multiple nested images', function(done) {

		fixture.crawl(makeConfigFor('/nested-img-scenario.html'), function(err, data) {
		
			assert.equal(3, data.imgs.length);

			assert.equal('img/yield.gif', data.imgs[0].src);
			assert.equal(testOutPath + '/img-yield.gif', data.imgs[0].path);
			assertFileOnDisk(data.imgs[0].path);
			
			assert.equal('img/email.png', data.imgs[1].src);
			assert.equal(testOutPath + '/img-email.png', data.imgs[1].path);
			assertFileOnDisk(data.imgs[1].path);
			
			assert.equal('img/facebook-icon.png', data.imgs[2].src);
			assert.equal(testOutPath + '/img-facebook-icon.png', data.imgs[2].path);						
			assertFileOnDisk(data.imgs[2].path);
						
			done();		
		
		});
	
	});
	
	test('when no image tags', function(done) {
		
		fixture.crawl(makeConfigFor('/no-img-tags-scenario.html'), function(err, data) {

			assert.equal(0, data.imgs.length);
			
			done();
		});
	});
	
	test('when image tag has no source attribute', function(done) {
		
		fixture.crawl(makeConfigFor('/no-img-src-scenario.html'), function(err, data) {
			
			assert.equal(0, data.imgs.length);
			
			done();			
			
		});
		
	});
	
	test('when image tag has empty source attribue', function(done) {

		fixture.crawl(makeConfigFor('/empty-img-src-scenario.html'), function(err, data) {
			
			assert.equal(0, data.imgs.length);
			
			done();			
			
		});
	
	});
	
	test('when page is not found', function(done) {
	
		fixture.crawl(makeConfigFor('/no-where.html'), function(err, data) {
		
			assert.equal(err.message, 'Page not found');

			done();
		
		});
	
	});
	
	test('when server returns 500', function(done) {
	
		var resourcePath = '/send-server-error';
		
		dispatcher.addRoute(resourcePath, function(req, res){
			res.writeHead(500, {'Content-Type': 'text/html'});
			res.end();
		});
		
		fixture.crawl(makeConfigFor(resourcePath), function(err, data){
		
			assert.equal(err.message, 'Received an unsupported response code');
			assert.equal(err.http_status_code, 500);
			
			done();
		
		});
	
	});
	
	test('host connection refused', function(done) {
		var noHostURL = 'http://localhost:1/bogus';

		fixture.crawl({url: noHostURL}, function(err, data){
			
			assert.equal(err.code, 'ECONNREFUSED');
			
			done();
			
		});
		
	});
	
	test('malformed URL', function(done) {
		fixture.crawl({url: 'amalformedurl'}, function(err, data) {
		
			assert.equal(err.message, 'Invalid URI "amalformedurl"');
		
			done();
		});
	});
	
});

	
