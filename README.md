<h1>img-crawler</h1>
<a href="https://travis-ci.org/radvieira/img-crawler">
	<img src="https://travis-ci.org/radvieira/img-crawler.png" />
</a>
<p>A Node module for downloading images to disk from a given URL.</p>
<h2>Installation</h2>
<pre>
    <code>npm install img-crawler</code>
</pre>
<h2>Running the tests</h2>
<p>From the module directory run:</p>
<pre>
    <code>npm test</code>
</pre>
<p>Without npm:</p>
<pre>
    <code>make test</code>
</pre>
<h2>Usage</h2>
<p>Download imgs from 'pearljam.com' and write them to the 'pj-imgs' directory.  
The dir will be created if not found and resolved to an absolute path.
</p>
<pre><code>
     var crawler = require('img-crawler');
          
     var opts = {
         url: 'http://pearljam.com',
         dist: 'pj-imgs'
     };
     
     crawler.crawl(opts, function(err, data) {
         console.log('Downloaded %d from %s', data.imgs.length, opts.url);
     });    
    </code>
</pre>
<h3>The callback</h3>
<p>Keeping inline with node convention the callback first accepts an error object 
followed by data representing the downloaded images.  The err object will be provided
if loading the web page fails.  Failures are reported in the img responses.
</p>
<p>Here's an example of a response:</p>
<pre>
    <code>{
        imgs: [
            {
                src: 'img/a-img.png', 
                statusCode: 200,
                success: true,
                path: '/Users/radvieira/my-imgs/img/a-img.png'
            },
            {
                src: 'img/another-img.png', 
                statusCode: 404,
                success: false
            }            
        ]
    }
    </code>
</pre>
<p>In this case the first image was downloaded and written to disk while the other failed.
Notice how there is no path attribute for the failed download.
</p>
