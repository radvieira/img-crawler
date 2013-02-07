var fs = require('fs');

var splitPath = function(path) {
	return path.split("/").filter(function(el) {
		return el.trim();
	});
};

var mkdirs = function(path, onComplete) {
	
	var dirs = splitPath(path);
	
	var mkdir = function(pos, root) {
	
		var current = root + dirs[pos];

		var completeOrNext = function() {
			if(pos === dirs.length-1) {
				onComplete();
			} else {
				mkdir(pos + 1, current + '/');
			}		
		};

		fs.exists(current, function(exists){
			if(!exists) {
				fs.mkdir(current, function(err){
					if(err) {
						onComplete(err);
					} else {				
						completeOrNext();
					}
				});
			} else {
				completeOrNext();		
			}
		});		
	
	};
	
	mkdir(0, path.indexOf('/') === 0 ? '/' : '');
};

module.exports = function(path, onComplete) {
	
	if(!(path && path.trim())) {
		onComplete(new Error('Path is required'));
	} else {
		mkdirs(path, onComplete);
	}

};