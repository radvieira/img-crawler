var assert = require('assert'),
	http = require('http'),
	dispatcher = require('./lib/dispatcher'),
	fixture = require('../main'),
	path = process.env.PWD + '/test/test-responses';

http.createServer(dispatcher.root(path).route).listen(1111);

var makeURLFor = function(pageName) {
	return 'http://localhost:1111/' + pageName;
};

suite('crawl', function() {
	
	test('reads nested images', function(done) {
	
		fixture.crawl(makeURLFor('single-img-scenario.html'), function(data){
			
			assert.equal(1, data.srcs.length);
			assert.equal('img/yield.gif', data.srcs[0]);
			
			done();
		
		});
	
	});
	
	test('reads multiple nested images', function(done) {

		fixture.crawl(makeURLFor('nested-img-scenario.html'), function(data){
			
			assert.equal(3, data.srcs.length);
			assert.equal('img/yield.gif', data.srcs[0]);
			assert.equal('img/email.png', data.srcs[1]);
			assert.equal('img/facebook-icon.png', data.srcs[2]);
			
			done();
		
		});
	
	});
	
	test('when no image tags', function(done) {
		
		fixture.crawl(makeURLFor('no-img-scenario.html'), function(data) {
			
			assert.equal(0, data.srcs.length);
			
			done();
		});
	});
	
	test('when image tag has no source attribute', function(done) {
		
		fixture.crawl(makeURLFor('no-img-src-scenario.html'), function(data) {
			
			assert.equal(0, data.srcs.length);
			
			done();			
			
		});
		
	});
	
	test('when image tag has empty source attribue', function(done) {

		fixture.crawl(makeURLFor('empty-img-src-scenario.html'), function(data) {
			
			assert.equal(0, data.srcs.length);
			
			done();			
			
		});
	
	});
	
});

	
