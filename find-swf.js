

var Crawler = require("crawler");
var url = require('url');
var winston = require('winston');
winston.level = 'debug';

//var siteURL = url.parse('http://www.salix.com/');
var sitemap = [];

if (!process.argv[2]) {
	winston.log('info', 'Please provide URL as second arg.');
	//console.log('Please provide URL as second arg.');
	return false;
};

var siteURL = url.parse(process.argv[2]);
winston.add(winston.transports.File, { filename: siteURL.hostname + '.log' });

winston.log('info', 'Searching Site: ', siteURL.href);
//console.log('Searching Site: ', siteURL.href);

var c = new Crawler({
    maxConnections: 10,
    skipDuplicates: true,
    callback: function (error, result, $) {
    		if (error) console.log(error);
    		if (getFileObject(result.uri).ext == 'pdf') return true
    		if (result.caseless.dict['content-type'] != 'text/html; charset=utf-8') return true;

    		// Test for CLASS
    		$('[class*="flash"]').each(function () {
    			winston.log('info', "FLASH!!!! - ", "class='"+ $(this).attr('class')+"'", result.uri);
    		});

    		// Test for ID
    		$('[id*="flash"]').each(function () {
    			winston.log('info', "FLASH!!!! - ", "id='"+ $(this).attr('id')+"'", result.uri);
    		});

    		// Test for VALUE=SWF
    		$('[value*=".swf"]').each(function () {
    			winston.log('info', "FLASH!!!! - ", "value='"+ $(this).attr('value')+"'", result.uri);
    		});

    		// Test for DATA=SWF
    		$('[data*=".swf"]').each(function () {
    			winston.log('info', "FLASH!!!! - ", "data='"+ $(this).attr('data')+"'", result.uri);
    		});





        $('a[href!=""][href!="#"]').each(function () {
        	var href = $(this).attr('href');
			    var absLink = url.resolve(siteURL.href, $(this).attr('href'));
			    var target = {
			      href: absLink,          // make it absolute
			      url: url.parse(absLink) // parsed url
			    };

			    if (target.url.host == siteURL.host && sitemap.indexOf(target.href) == -1) {
			    	//console.log(target.href, sitemap.indexOf(target.href), sitemap.length);
			      //console.log("Adding "+ target.href);
			      sitemap.push(target.href);
			      c.queue(target.href);
			    }
			    else {
			      //console.log("Ommiting "+ target.href +" (not in "+ siteURL.host +")");
			    }

			  });

    },
    onDrain: function() {
    	console.log('FIN!');
    	sitemap.forEach(function(link){
    		//console.log(link);
    	});
    	process.exit();
    }
});

function getFileObject(baseurl) {
	var pathname = url.parse(baseurl).pathname;
	var filename = pathname.substring(pathname.lastIndexOf('/')+1);
	var fileobject = {
		fullname: filename,
		name: filename.substring(0,filename.lastIndexOf('.')),
		ext: filename.substring(filename.lastIndexOf('.')+1)
	};
	
	return fileobject;
}

function isBlacklistedFile(baseurl) {

}

c.queue(siteURL.href);