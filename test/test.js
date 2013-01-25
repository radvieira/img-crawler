var assert = require('assert'),
	http = require('http'),
	dispatcher = require('./lib/request-route'),
	fixture = require('../main'),
	path = process.env.PWD + '/test/test-responses';

http.createServer(dispatcher.root(path).route).listen(1111);

var makeURLFor = function(pageName) {
	return 'http://localhost:1111' + pageName;
};

suite('crawl', function() {
	
	test('reads nested images', function(done) {
	
		fixture.crawl(makeURLFor('/single-img-scenario.html'), function(err, data){
			
			assert.equal(1, data.srcs.length);
			assert.equal('img/yield.gif', data.srcs[0]);
			
			done();
		
		});
	
	});
	
	test('reads multiple nested images', function(done) {

		fixture.crawl(makeURLFor('/nested-img-scenario.html'), function(err, data){
			
			assert.equal(3, data.srcs.length);
			assert.equal('img/yield.gif', data.srcs[0]);
			assert.equal('img/email.png', data.srcs[1]);
			assert.equal('img/facebook-icon.png', data.srcs[2]);
			
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
		
			assert.equal(err, 'Page not found');

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
		
			assert.equal(err, 'Received an unsupported response code 500');
			
			done();
		
		});
	
	});
	
});

	
