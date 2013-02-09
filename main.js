var request = require('request'),

	htmlparser = require('htmlparser'),
	
	img = require('./lib/img');

var webPage = function(config, onComplete) {
	
	var imgs = [],
		crawled = {
			imgs: []
		};
	
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
	
	var writeImgs = function(body) {
	
		var handler = new htmlparser.DefaultHandler(function (error, dom) {
	
			collectImages(dom);
			
			if(imgs.length) {
			
				imgs.forEach(function(img, index){
					
					img.write(config.dist, function(data){
						crawled.imgs.push(data);
						if(crawled.imgs.length === imgs.length) {
							onComplete(undefined, crawled);
						}
					});						
	
				});
				
			} else {
			
				onComplete(undefined, crawled);
				
			}
			
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