var fixture = require('../lib/mkdir-p'),
	assert = require('assert'),
	fs = require('fs'),
	rm = require('rimraf');

suite('mkdir', function() {

	var paths = [];
	
	teardown(function(){
		paths.forEach(function(element, index, array){
			fs.exists(element, function(exists){
				if(exists) {
					rm(element, function(err){
						if(err) {
							console.log('Error when tearing down mkdir tests ' + err);
						}
					});
				}
			});

		});
	});

	test('creates directory when doesn\'t exist', function(done) {
	
		var path = 'a';
		paths.push(path);
		
		fixture(path, function() {
		
			fs.exists(path, function(exists){
				assert.ok(exists, path + ' doesn\'t exist');
				done();
			});

		});
	
	});
	
	test('create directory when exists', function(done) {
		var path = 'b';		
		paths.push(path);

		fs.mkdir(path, function(){
			fixture(path, function() {
		
				fs.exists(path, function(exists){
					assert.ok(exists, path + ' doesn\'t exist');
					done();
				});

			});				
		});
				
	});

	test('creates nested directories when they don\'t exist', function(done){
		var path = 'a/b/c';
		paths.push(path);
		
		fixture(path, function(){
			fs.exists(path, function(exists){
				assert.ok(exists, path + ' doesn\'t exist');
				done();
			});		
		});
	});
	
	test('no doen\'t have write permissions', function(done){
		//expecting writing to / will fail (i.e, not running as root);
		var path = '/a/b/c';
		paths.push(path);
		
		fixture(path, function(err){
		
			assert.ok(err, 'Expected a failure');
			assert.equal('EACCES', err.code);
			done();		
		});	
	});
	
	test('undefined path', function(done) {
		fixture(undefined, function(err) {
			assert.ok(err, 'Expected a failure');
			assert.equal('Path is required', err.message);
			done();
		});
	});
	
	test('empty path', function(done) {
		fixture('', function(err) {
			assert.ok(err, 'Expected a failure');
			assert.equal('Path is required', err.message);
			done();
		});
	});
	
	test('blank path', function(done) {
		fixture(' ', function(err) {
			assert.ok(err, 'Expected a failure');
			assert.equal('Path is required', err.message);
			done();
		});
	});	

});