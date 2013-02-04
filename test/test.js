var assert = require('assert'),
	http = require('http'),
	dispatcher = require('./lib/request-route'),
	fixture = require('../main'),
	resourcePath = process.env.PWD + '/test/test-responses',
	testOutPath = process.env.PWD + '/test-out',
	fs = require('fs');
	

http.createServer(dispatcher.root(resourcePath).route).listen(1111);

suite('crawl', function() {

	var makeURLFor = function(resourcePath) {
		return 'http://localhost:1111' + resourcePath;
	};
	
	var makeConfigFor = function(resourcePath, dist) {
		return {
			url: makeURLFor(resourcePath),
			dist: testOutPath
		};
	};
	
	var cleanTestOutput = function(done) {
		fs.exists(testOutPath, function(exists) {
			if(exists) {
				fs.rmdir(testOutPath, function(err){					
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
	
	test('reads nested images', function(done) {
		
		fixture.crawl(makeConfigFor('/single-img-scenario.html'), function(err, data) {
		
			assert.equal(1, data.srcs.length);
			assert.equal('img/yield.gif', data.srcs[0].path());
			
			done();		
		
		});
	
	});
	
	test('reads multiple nested images', function(done) {

		fixture.crawl(makeConfigFor('/nested-img-scenario.html'), function(err, data) {
		
			assert.equal(3, data.srcs.length);
			assert.equal('img/yield.gif', data.srcs[0].path());
			assert.equal('img/email.png', data.srcs[1].path());
			assert.equal('img/facebook-icon.png', data.srcs[2].path());			
			
			done();		
		
		});
	
	});
	
	test('when no image tags', function(done) {
		
		fixture.crawl(makeConfigFor('/no-img-tags-scenario.html'), function(err, data) {

			assert.equal(0, data.srcs.length);
			
			done();
		});
	});
	
	test('when image tag has no source attribute', function(done) {
		
		fixture.crawl(makeConfigFor('/no-img-src-scenario.html'), function(err, data) {
			
			assert.equal(0, data.srcs.length);
			
			done();			
			
		});
		
	});
	
	test('when image tag has empty source attribue', function(done) {

		fixture.crawl(makeConfigFor('/empty-img-src-scenario.html'), function(err, data) {
			
			assert.equal(0, data.srcs.length);
			
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

	
