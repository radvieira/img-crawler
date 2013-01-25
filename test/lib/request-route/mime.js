/*
 *	A module for determining the content type of a resource.
 */
module.exports = function(resourcePath) {
    var contentType;

	if(/\.js$/.test(resourcePath)) {
		contentType = 'text/javascript';
	} else if(/\.html/.test(resourcePath)) {
		contentType = 'text/html';
	} else if(/\.json/.test(resourcePath)) {
		contentType = 'application/json';
	} else {
		contentType = 'text/plain';
	}
	
	return contentType;
};