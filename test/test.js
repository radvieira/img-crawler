var assert = require('assert'),
	http = require('http'),
	dispatcher = require('./lib/request-route'),
	fixture = require('../main'),
	resourcePath = process.env.PWD + '/test/test-responses',
	testOutPath = process.env.PWD + '/test-out',
	rm = require('rimraf'),
	fs = require('fs');
	

http.createServer(dispatcher.root(resourcePath).route).listen(1111);

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

var assertFileOnDisk = function(path) {
	assert.ok(fs.existsSync(path), path + ' wasn\'t found');
};

var assertImages = function(expected, actual) {
	
	var i,
		expectedImg,
		actualImg,
		imgs;
	
	assert.equal(expected.imgs.length, actual.imgs.length, 'Crawled wrong # of imgs');
	
	for(i = 0; i < expected.imgs.length; i++) {
		
		expectedImg = expected.imgs[i];
		
		imgs = actual.imgs.filter(function(element, index, array){
			return expectedImg.src === element.src;
		});

		assert.ok(imgs.length, 'Didn\'t find Img with src ' + expectedImg.src);
		assert.equal(expectedImg.statusCode, imgs[0].statusCode);
		assert.equal(expectedImg.success, imgs[0].success);
		assert.equal(expectedImg.path, imgs[0].path);
		
		if(expectedImg.error) {
			assert.equal(expectedImg.error.code, imgs[0].error.code);			
		}

		if(expectedImg.path && expectedImg.path.trim()) {
			assertFileOnDisk(imgs[0].path);
		}
		
	}
};

suite('crawl', function() {
		
	teardown(function(done){
		cleanTestOutput(done);	
	});
	
	test('reads nested images', function(done) {
		
		fixture.crawl(makeConfigFor('/single-img-scenario.html'), function(err, data) {

			var expected = {
				imgs: [
					{	src: 'img/yield.gif', 
						path: testOutPath + '/img/yield.gif', 
						success: true,
						statusCode: 200
					}
				]
			};
			
			assertImages(expected, data);

			done();
		
		});
	
	});
	
	test('reads multiple nested images', function(done) {

		fixture.crawl(makeConfigFor('/nested-img-scenario.html'), function(err, data) {

			var expected = {
				imgs: [
					{
						src: 'img/yield.gif', 
						path: testOutPath + '/img/yield.gif',
						success: true,
						statusCode: 200
					},
					{	
						src: 'img/email.png', 
						path: testOutPath + '/img/email.png',
						success: true,
						statusCode: 200						
					},
					{	
						src: 'img/facebook-icon.png', 
						path: testOutPath + '/img/facebook-icon.png',
						success: true,
						statusCode: 200						
					}					
				]
			};
			
			assertImages(expected, data);
						
			done();		
		
		});
	
	});
	
	test('when image src begings with "/" in path', function(done) {
		
		fixture.crawl(makeConfigFor('/img-beginning-with-slash.html'), function(err, data) {
			
			var expected = {
				imgs: [
					{
						src: '/img/yield.gif', 
						path: testOutPath + '/img/yield.gif',
						success: true,
						statusCode: 200						
					}
				]
			};
			
			assert.ok(!err, 'Didn\'t expect to receive ' + err);
			assertImages(expected, data);

			done();
					
		});
		
	});
	
	test('when image has absolute URL', function(done){

		fixture.crawl(makeConfigFor('/img-with-absolute-url.html'), function(err, data) {
			var expected = {
				imgs: [
					{
						src: 'http://localhost:1111/img/yield.gif', 
						path: testOutPath + '/localhost/img/yield.gif',
						success: true,
						statusCode: 200						
					}
				]
			};
			
			assert.ok(!err, 'Didn\'t expect to receive ' + err);
			assertImages(expected, data);
			
			done();
			
		});
		
	});

	test('when image url is up a level', function(done) {

		fixture.crawl(makeConfigFor('/a-directory/imgs-up-a-level.html'), function(err, data) {
			var expected = {
				imgs: [{
					src: '../img/email.png',
					path: testOutPath + '/img/email.png',
					success: true,
					statusCode: 200					
				}]
			};

			assert.ok(!err, 'Didn\'t expect to receive ' + err);
			assertImages(expected, data);

			done();
		});
	
	});
	
	test('when image url is up 2 levels', function(done) {

		fixture.crawl(makeConfigFor('/a-directory/b-directory/imgs-up-2-levels.html'), function(err, data) {
			var expected = {
				imgs: [{
					src: '../../img/email.png',
					path: testOutPath + '/img/email.png',
					success: true,
					statusCode: 200					
				}]
			};

			assert.ok(!err, 'Didn\'t expect to receive ' + err);
			assertImages(expected, data);

			done();
		});
	
	});	
	
	test('when image url is broken', function(done) {
	
		fixture.crawl(makeConfigFor('/img-url-to-no-where.html'), function(err, data) {
		
			var expected = {
				imgs: [{
					src: 'img/not-found.gif',
					success: false,
					statusCode: 404
				}]
			}
		
			assert.ok(!err, 'Didn\'t expect to receive ' + err);
			assertImages(expected, data);
			
			done();
		
		});
	
	});	
	
	test('when no image tags', function(done) {
		
		fixture.crawl(makeConfigFor('/no-img-tags-scenario.html'), function(err, data) {

			assertImages({imgs: []}, data);
			
			done();
		});
	});
	
	test('when image tag has no source attribute', function(done) {
		
		fixture.crawl(makeConfigFor('/no-img-src-scenario.html'), function(err, data) {
			
			assertImages({imgs: []}, data);
			
			done();			
			
		});
		
	});
	
	test('when image tag has empty source attribue', function(done) {

		fixture.crawl(makeConfigFor('/empty-img-src-scenario.html'), function(err, data) {
			
			assertImages({imgs: []}, data);
			
			done();			
			
		});
	
	});
	
	test('when invalid img uri', function(done) {
	
		fixture.crawl(makeConfigFor('/invalid-img-uri.html'), function(err, data) {
		
			var expected = {
				imgs: [{
						src: 'http://localhost:invalid-img-uri.html/yield.gif',
						success: false,
						error: {code: "ECONNREFUSED"}
				}]	
			};

			assert.ok(!err, 'Didn\'t expect to receive ' + err);
			assertImages(expected, data);
		
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

	
