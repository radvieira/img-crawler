var request = require('request'),
	fs = require('morefs');
	
var normalizeImgPath = function(dir, imgPath) {
	return dir + '/' + imgPath.replace('/', '-');
};

var makeURI = function(url, imgPath) {
	return url.protocol + '//' + url.hostname + ':' + url.port + '/' + imgPath; 
};

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

module.exports = function(host, imgPath){

	var url;
	
	if(imgPath) {
		
		url = require('url').parse(host);
		
		return {
			write: function(dir, onComplete) {
					var uri = makeURI(url, imgPath);

					request(uri).on('response', function(response) {
						var writeTo;
						if(response.statusCode === 200) {
							writeTo = normalizeImgPath(dir, imgPath);
							this.pipe(createWriteStream(imgPath, writeTo, onComplete));
						}
					
					});
			}
			
		}
		
	}

};