var request = require('request'),

	fs = require('fs');

module.exports = function(host, imgPath){

	var url;
	
	if(imgPath) {
		
		url = require('url').parse(host);
		
		return {
			
			write: function(dir, onComplete) {
			
				var uri = url.protocol + '//' + url.hostname + ':' + url.port + '/' + imgPath;
					
				var writeTo = dir + '/' + imgPath.replace('/', '-');
				
				var writeToDisk = function() {
					
					var stream = fs.createWriteStream(writeTo);

					stream.on('close', function(){
						onComplete({
							src: imgPath,
							path: writeTo
						});							
					});
					
					request(uri).on('response', function(response) {
						if(response.statusCode === 200) {
							this.pipe(stream);
						}
					});
					
				};
			
				fs.exists(dir, function(exists) {
					if(!exists) {
						fs.mkdir(dir, function() {
							writeToDisk();
						});
					} else {
						writeToDisk();
					}
				});
	
			}
			
		}
		
	}

};