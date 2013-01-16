var program = require('commander'),
	
program.validate = function() {
		
	if(!program.source) {
		console.log('Can\'t crawl for images without a source.');
		process.exit();
	}
	
};

program
	.option('-s, --source [url]', 'The site to crawlExample, http://github.com')
	.option('-p, --path [path]', 'The location to place the images')
	.parse(process.argv)
	.validate();


console.log('Crawling ' + program.source + ' for images');
console.log('Going to place images in ' + program.path);