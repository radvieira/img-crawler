var assert = require('assert'),
	jsmockito = require('jsmockito').JsMockito,
	requireMock = require('requiremock')(__filename),
	http = require('http'),
	dispatcher = require('./lib/request-route');

var img = jsmockito.mockFunction();

jsmockito.when(img)().then(function() {
	
	return function(source, path) {

		if (path) {
			
			return {
				write: function(callback) {
					callback();
				}, 
				path: function() {
					return path;
				}
			};
			
		}
		
	}
	
});


requireMock.mock('./lib/img', img);

var	fixture = requireMock('../main');
var	path = process.env.PWD + '/test/test-responses';

http.createServer(dispatcher.root(path).route).listen(1111);

var makeURLFor = function(resourcePath) {
	return 'http://localhost:1111' + resourcePath;
};

suite('crawl', function() {
	
	test('reads nested images', function(done) {
		
		fixture.crawl(makeURLFor('/single-img-scenario.html'), function(err, data){

			assert.equal(1, data.srcs.length);
			assert.equal('img/yield.gif', data.srcs[0].path());
			
			done();
		
		});
	
	});
	
	test('reads multiple nested images', function(done) {

		fixture.crawl(makeURLFor('/nested-img-scenario.html'), function(err, data){
			
			assert.equal(3, data.srcs.length);
			assert.equal('img/yield.gif', data.srcs[0].path());
			assert.equal('img/email.png', data.srcs[1].path());
			assert.equal('img/facebook-icon.png', data.srcs[2].path());
			
			done();
		
		});
	
	});
	
	test('when no image tags', function(done) {
		
		fixture.crawl(makeURLFor('/no-img-tags-scenario.html'), function(err, data) {

			assert.equal(0, data.srcs.length);
			
			done();
		});
	});
	
	test('when image tag has no source attribute', function(done) {
		
		fixture.crawl(makeURLFor('/no-img-src-scenario.html'), function(err, data) {
			
			assert.equal(0, data.srcs.length);
			
			done();			
			
		});
		
	});
	
	test('when image tag has empty source attribue', function(done) {

		fixture.crawl(makeURLFor('/empty-img-src-scenario.html'), function(err, data) {
			
			assert.equal(0, data.srcs.length);
			
			done();			
			
		});
	
	});
	
	test('when page is not found', function(done) {
	
		fixture.crawl(makeURLFor('/no-where.html'), function(err, data) {
		
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
		
		fixture.crawl(makeURLFor(resourcePath), function(err, data){
		
			assert.equal(err.message, 'Received an unsupported response code');
			assert.equal(err.http_status_code, 500);
			
			done();
		
		});
	
	});
	
	test('host connection refused', function(done) {
		var noHostURL = 'http://localhost:1/bogus';

		fixture.crawl(noHostURL, function(err, data){
			
			assert.equal(err.code, 'ECONNREFUSED');
			
			done();
			
		});
		
	});
	
	test('malformed URL', function(done) {
		fixture.crawl('amalformedurl', function(err, data) {
		
			assert.equal(err.message, 'Invalid URI "amalformedurl"');
		
			done();
		});
	});
	
});

	
