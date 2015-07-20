#!/usr/bin/env node

var path = require('path');
var url = require('url');
var pkg = require( path.join(__dirname, 'package.json') );
var Crawler = require('crawler');
var winston = require('winston');
var program = require('commander');

program
  .version(pkg.version)
  .parse(process.argv);

if (!program.args.length) {
    winston.error('Please specify the url to crawl.');
    return false;
}

var sitemap = [];
var siteURL = url.parse(program.args[0]);
winston.add(winston.transports.File, { 
    filename: siteURL.hostname + '.log',
    formatter: customFileFormatter,
    json: false
});

var c = new Crawler({
    maxConnections: 10,
    skipDuplicates: true,
    callback: function (error, result, $) {
        if (error) console.log(error);
        if (getFileObject(result.uri).ext == 'pdf') return true
        if (result.caseless.dict['content-type'] != 'text/html; charset=utf-8') return true;

        var resultURL = url.parse(result.uri);
        var formattedURL = resultURL.href.replace(resultURL.protocol+'//'+resultURL.hostname, '');

        // Test for CLASS
        $('[class*="flash"]').each(function () {
            winston.log('info', "CLASS='"+ $(this).attr('class')+"'", formattedURL);
        });

        // Test for ID
        $('[id*="flash"]').each(function () {
            winston.log('info', "ID='"+ $(this).attr('id')+"'", formattedURL);
        });

        // Test for VALUE=SWF
        $('[value*=".swf"]').each(function () {
            winston.log('info', "VALUE='"+ $(this).attr('value')+"'", formattedURL);
        });

        // Test for DATA=SWF
        $('[data*=".swf"]').each(function () {
            winston.log('info', "DATA='"+ $(this).attr('data')+"'", formattedURL);
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
c.queue(siteURL.href);


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

function customFileFormatter(options) {
    return (undefined !== options.message ? options.message : '') +
    (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
}

winston.log('info', 'Crawling for Flash at: ', siteURL.href);

