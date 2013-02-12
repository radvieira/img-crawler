var request = require('request'),
	fs = require('morefs'),
	path = require('path'),
	url = require('url');
	
var createWriteStream = function(img, writeTo, onComplete) {
	
	var stream = fs.createWriteStream(writeTo);
	
	stream.on('close', function(){
		img.path = writeTo;
		onComplete(img);
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

var makeImg = function(imgPath, response) {
	
	var img = {src: imgPath, statusCode: response.statusCode};
	img.success = (img.statusCode === 200);
	
	return img;
};

module.exports = function(host, imgPath){

	var uri;

	if(imgPath) {
		
		uri = makeURI(host, imgPath);
		
		return {
			write: function(dir, onComplete) {

				request(uri).on('response', function(response) {
					
					var writeTo,
						img = makeImg(imgPath, response);
					
					if(img.success) {				
					
						writeTo = makeDiskPath(dir, imgPath);
						this.pipe(createWriteStream(img, writeTo, onComplete));
						
					} else {
						onComplete(img);
					}
				
				});
			}
			
		}
		
	}

};