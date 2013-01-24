/*
 *  A REALLY simple routing module capable of serving static resources and invoking
 *  handlers bound to paths.
 *
 */
var http = require('http'),
    fs = require('fs'),
    assert = require('assert'),
    mime = require('./mime');
    
var _path, routes = {};

var serveStatic = function(req, res, resourcePath) {
	//FIXEME: RV will these paths work on windows?
	//what about double slashes? 
	fs.exists(resourcePath, function(exists){
		
		if(exists) {
		    res.writeHead(200, {'Content-Type': mime(resourcePath)});
		    fs.createReadStream(resourcePath).pipe(res);
		} else {
		   res.writeHead(404,{'Content-Type':'text/plain'});
		   res.end('Could not find ' + req.url);
		}
	});
};

var handleStaticRequest = function(req, res) {
	var resourcePath;
	
	assert(_path, 'Document root must be set.  Use documentRoot(path)');
	
	if(req.url === '/') {
		resourcePath = _path + '/index.html';
	} else {
		resourcePath = _path + req.url;
	}
	
	serveStatic(req, res, resourcePath);
};

module.exports = 
{	
	/* Specifies the path to resources on disk */
	root: function(path) {
		_path = path;
		return this;
	},
	
	/* Binds a handler function to a path */
	addRoute: function(path, handler) {
		routes[path] = handler;
		return this;
	},
	
	/* Runs a handler or serves static content for the request */
	route: function(req, res) {
		if(routes[req.url]) {
			routes[req.url](req, res);
		} else {
			handleStaticRequest(req, res);
		}
	}
};