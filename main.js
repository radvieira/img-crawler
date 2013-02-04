var request = require('request'),

	fs = require('fs'),

	htmlparser = require("htmlparser");

var img = function(host, imgPath){

	var url;

	if(imgPath) {
		
		url = require('url').parse(host);
		
		return {
			
			write: function(dir, onComplete) {
			
				var uri = url.protocol + '//' + url.hostname + ':' + url.port + '/' + imgPath,
					
					fileName = dir + '/' + imgPath.replace('/', '-');
	
				fs.exists(dir, function(exists) {
					if(!exists) {
						fs.mkdir(dir, function() {
							onComplete();						
						});
					} else {
						onComplete();
					}
// 					console.log(exists);
					
// 					var stream = fs.createWriteStream(fileName);
// 					onComplete();
// 					request(uri).on('end', onComplete).pipe(stream);					
				});
	

				
			},
			
			path: function() {
				return imgPath;
			}
			
		}
		
	}

};

var webPage = function(config, onComplete) {
	
	var imgs = [];
	
	var getImg = function(element) {
		
		if(element.name === 'img' && element.attribs && element.attribs.src) {
			return img(config.url, element.attribs.src.trim());

		}
		
	};
	
	var collectImages = function(elements) {

		var i, element, img;
		
		for(i = 0; i < elements.length; i++) {
			
			element = elements[i];
			img = getImg(element);

			if(img) {
				imgs.push(img);
			} else if(element.children) {
				collectImages(element.children);			
			}
	
		}
		
	};
	
	var onImgWriteComplete = function(isAllWritingComplete) {

		return function() {
			
			if(isAllWritingComplete) {
			
				onComplete(undefined, {srcs: imgs});
				
			}
			
		};
		
	};
	
	var write = function() {

		if(imgs.length) {
		
			imgs.forEach(function(img, index){
				
				var isImgWritingComplete = index === imgs.length-1; 	
				img.write(config.dist, onImgWriteComplete(isImgWritingComplete));						

			});
			
		} else {
		
			onComplete(undefined, {srcs: imgs});
			
		}
		
	};
	
	var writeImgs = function(body) {
	
		var handler = new htmlparser.DefaultHandler(function (error, dom) {
	
			collectImages(dom);
			write();
			
		});
		
		new htmlparser.Parser(handler).parseComplete(body);
	
	};
	
	var handlePageResponse = function(response, body) {
		
		var err;
		
		switch(response.statusCode) {
			
			case 200: 
				
				writeImgs(body);
				break;
			
			case 404:
				
				onComplete(new Error('Page not found'));
				break;
				
			default:
				
				err = new Error('Received an unsupported response code');
				err.http_status_code = response.statusCode;
				onComplete(err);
				
		}
		
	};
	
	var onPageLoaded = function(err, response, body) {
					
		if(!err) {
		
			handlePageResponse(response, body);
			
		} else {

			onComplete(err);
		
		}
			
	};
	
	var loadWebPage = function() {
	
		request(config, onPageLoaded);		
	
	};

	return {
	
		crawl: function() {
			
			loadWebPage();
			
		}
	
	};

};

module.exports.crawl = function(config, callback){

	webPage(config, callback).crawl();

};