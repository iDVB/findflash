
var Crawler = require("simplecrawler");
var cheerio = require('cheerio');
var Url     = require('url');

var siteURL = "https://www.ruconest.com";
var sitemap = [];
var siteURLObj = Url.parse(siteURL);
var myCrawler = new Crawler(siteURLObj.hostname);

//myCrawler.interval = 500; // Ten seconds
//myCrawler.timeout = 100000;
myCrawler.maxConcurrency = 1;
myCrawler.maxDepth = 1;
myCrawler.downloadUnsupported = false;
myCrawler.initialProtocol = 'https'; //need to add a check for this
//myCrawler.ignoreInvalidSSL = true;

// myCrawler.addFetchCondition(function(parsedURL) {
//     if (parsedURL.path.match(/\.(css|jpg|gif|pdf|docx|js|png|ico|json|woff|ttf|woff2|otf|svg|eot|mp4|mp3|m4v|mov|avi|ogg|swf|ogv)/i)) {
//         console.log("KILLED!",parsedURL.path);
//         return false;
//     }

//     return true;
// });


myCrawler.on('fetchstart', function(queueItem , requestOptions){
	 console.log("fetchstart: ", queueItem.url);
});

myCrawler.on('fetchclienterror', function(queueItem, errorData){
	 console.log("fetchclienterror: ", queueItem.url, errorData);
});

myCrawler.on('fetchtimeout', function(queueItem, crawlerTimeoutValue){
	 console.log("fetchtimeout: ", queueItem.url, crawlerTimeoutValue);
});

myCrawler.on('fetcherror', function(queueItem, response){
	 console.log("fetcherror: ", queueItem.url, response);
});

myCrawler.on('fetchredirect', function(queueItem, parsedURL){
	 console.log("fetchredirect: ", queueItem.url);
});

myCrawler.on('fetchdataerror', function(queueItem, response){
	 console.log("fetchdataerror: ", queueItem.url, response);
});

myCrawler.on('fetch404', function(queueItem){
	 console.log("fetch404: ", queueItem.url);
});

myCrawler.on('queueerror', function(errorData, URLData){
	 console.log("queueerror: ", errorData, URLData);
});

myCrawler.on('discoverycomplete', function(queueItem, resources){
	 console.log("discoverycomplete: ", queueItem.url);
});

myCrawler.on('queueadd', function(queueItem){
	 console.log("queueadd: ", queueItem.url);
});

myCrawler.on('queueduplicate', function(URLData){
	 console.log("queueduplicate: ", URLData);
});

myCrawler.on('queueerror', function(errorData , URLData){
	 console.log("queueerror: ", errorData);
});

myCrawler.on('gziperror', function(queueItem, error, resourceData){
	 console.log("gziperror: ", queueItem.url);
});



// myCrawler.discoverResources = function(buf, queueItem) {
//     $ = cheerio.load(buf);

//     $('a[href!=""][href!="#"]').each(function () {
    	
// 			var href = $(this).attr('href');
// 			console.log('mydiscoverResources: ', href);

//       var target = {
//         href: Url.resolve(siteURL.href, href),          // make it absolute
//         url: Url.parse(href) // parsed url
//       };

//       if (target.url.host == siteURL.host && sitemap.indexOf(target.href) == -1) {
//         sitemap.push(target.href);
//         myCrawler.queueURL(target.href, queueItem);
//       }

// 		});
// };





myCrawler.on('fetchcomplete', function(queueItem, responseBuffer, response){
	 console.log("FETCHCOMPLETE!: %s (%d bytes)", queueItem.url, responseBuffer.length);
   console.log("It was a resource of type %s", response.headers['content-type']);
});

myCrawler.on('complete', function(){
	console.log('FIN!');
	console.log("The maximum request latency was %dms.", myCrawler.queue.max("requestLatency"));
	console.log("The minimum download time was %dms.", myCrawler.queue.min("downloadTime"));
	console.log("The average resource size received is %d bytes.", myCrawler.queue.avg("actualDataSize"));

   //myCrawler.stop();
});

myCrawler.start();