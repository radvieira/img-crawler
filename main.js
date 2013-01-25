var request = require('request'),
	htmlparser = require("htmlparser");

var getSourceWhenImage = function(element) {
	
	if(element.name === 'img' && element.attribs && element.attribs.src) {
		return 	element.attribs.src.trim();
	}
	
};

var collectImages = function(imageSrcs, elements) {
	
	var i, element, src;
	
	for(i = 0; i < elements.length; i++) {
		
		element = elements[i];
		src = getSourceWhenImage(element);
		
		if(src) {				
			imageSrcs.push(src);
		} else if(element.children) {
			collectImages(imageSrcs, element.children);			
		}

	}
	
};

var getImagesFromBody = function(body, callback) {

	var handler = new htmlparser.DefaultHandler(function (error, dom) {

		var imageSrcs = [];

		collectImages(imageSrcs, dom);								

		callback(undefined, {srcs: imageSrcs});

	});
	
	var parser = new htmlparser.Parser(handler);
	parser.parseComplete(body);

};

module.exports.crawl = function(url, callback){
	
	request(url, function(err, response, body) {

		if(!err) {

			switch(response.statusCode) {
				
				case 200: 
					
					getImagesFromBody(body, callback);

					break;
				
				case 404:

					callback('Page not found', undefined);
					
					break;
			}
			
		} else {
		
			callback();
		
		}

	});

	
	
};
	


	
