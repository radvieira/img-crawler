var request = require('request'),

	htmlparser = require("htmlparser"),
	
	fs = require('fs');

var webPage = function(source, onComplete) {
	
	var imageURLs = [],
		
		url = require('url').parse(source);
	
	var getSourceWhenImage = function(element) {
		
		if(element.name === 'img' && element.attribs && element.attribs.src) {
			return 	element.attribs.src.trim();
		}
		
	};
	
	var collectImages = function(elements) {

		var i, element, src;
		
		for(i = 0; i < elements.length; i++) {
			
			element = elements[i];
			src = getSourceWhenImage(element);
			
			if(src) {				
				imageURLs.push(src);
			} else if(element.children) {
				collectImages(element.children);			
			}
	
		}
		
	};
	
	var write = function() {

		if(imageURLs.length) {
		
			imageURLs.forEach(function(element, index, array){
				
				var uri = url.protocol + '//' + url.hostname + ':' + url.port + '/' + element,
					fileName = element.replace('/', '-');
	
				request(uri).pipe(fs.createWriteStream(fileName));									
					
				if(index === imageURLs.length-1) {
				
					onComplete(undefined, {srcs: imageURLs});					
				
				}
				
			});
			
		} else {
		
			onComplete(undefined, {srcs: imageURLs});
			
		}
		
	}
	
	var getImageSourcesFromBody = function(body) {
	
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
				
				getImageSourcesFromBody(body);
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
	
		request(source, onPageLoaded);		
	
	};

	return {
	
		crawl: function() {
			
			loadWebPage();
			
		}
	
	};

};

module.exports.crawl = function(url, callback){

	webPage(url, callback).crawl();

};