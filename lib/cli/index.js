var program = require('commander'),
	crawler = require('../../main'),
	validator = require('validator');

var onCrawlUrl = function(url) {
	crawler.crawl(url, function(err, imgs) {
		if(err) {
			console.error(err);
		} else {
			console.log(imgs);
		}
		
	});
};

module.exports = function() {
	program
		.version("0.0.1")
		.usage('[options]')
		.option('-u, --url [url]', 'A site to crawl')
		.parse(process.argv);

		if(program.url) {
			try {
				validator.check(program.url).isUrl();
				onCrawlUrl(program.url);
			} catch(e) {
				console.error(e.message);
			}
		} else {
			program.help();
		}
};