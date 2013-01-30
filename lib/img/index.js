var request = require('request'),
	fs = require('fs');
	
module.exports = function(host, imgPath){

	var url;

	if(imgPath) {
		
		url = require('url').parse(host);
		
		return {
			
			write: function(onComplete) {
			
				var uri = url.protocol + '//' + url.hostname + ':' + url.port + '/' + imgPath,
					
					fileName = imgPath.replace('/', '-');
	
	
				var stream = fs.createWriteStream(fileName);
				
				request(uri).on('end', onComplete).pipe(stream);
				
			},
			
			path: function() {
				return imgPath;
			}
			
		}
		
	}

};