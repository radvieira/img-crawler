var request = require('request'),
	fs = require('morefs'),
	path = require('path'),
	url = require('url');
	
var createWriteStream = function(imgPath, writeTo, onComplete) {
	
	var stream = fs.createWriteStream(writeTo);
	
	stream.on('close', function(){
		onComplete({
			src: imgPath,
			path: writeTo
		});
	});
	
	return stream;
};

var makeURI = function(host, src) {
	
	var srcURL = url.parse(src),
		hostURL,
		uri;

	if(srcURL.hostname) {
		uri = srcURL.href;
	} else {
		hostURL = url.parse(host);
		uri = hostURL.protocol + '//' + hostURL.host + '/' + src;
	}
	
	return uri;
};

var makeDiskPath = function(dir, src) {
	
	var url = require('url').parse(src),
		diskPath;
	
	if(url.hostname) {
		diskPath = url.hostname + '/' + url.path;
	} else {
		diskPath = src; 
	}
	
	return path.normalize(dir + '/' + diskPath);
};

module.exports = function(host, imgPath){

	var uri;

	if(imgPath) {
		
		uri = makeURI(host, imgPath);
		
		return {
			write: function(dir, onComplete) {

				request(uri).on('response', function(response) {
					
					var writeTo;
					
					if(response.statusCode === 200) {
					
						writeTo = makeDiskPath(dir, imgPath);
						this.pipe(createWriteStream(imgPath, writeTo, onComplete));
						
					}
				
				});
			}
			
		}
		
	}

};