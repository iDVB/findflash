#!/usr/bin/env node

var path    = require('path');
var url     = require('url');
var pkg     = require( path.join(__dirname, 'package.json') );
var crawler = require('crawler');
var winston = require('winston');
var program = require('commander');
var csv     = require('csv-parse');
var fs      = require('fs');
var Rx      = require('rx');
var RxNode  = require('rx-node');

program
  .version(pkg.version).parse(process.argv);

if (!program.args.length) {
    winston.error('Please specify the url, or local path to csv of urls to crawl.');
    return false;
}

var arg = program.args[0];
var crawlerStream;
var argStream = Rx.Observable.just(arg)
    .concatMap(getUrlsFromString)//.last()
    .concatMap(getCrawlerStream)
    .subscribe(); 

// Get a Stream that handled the domain crawl
function getCrawlerStream(crawlURL) {
    var crawlerStream = Rx.Observable.create(function (observer) {
        var sitemap = [];
        var siteURL = url.parse(crawlURL);
        winston.add(winston.transports.File, { 
            filename: siteURL.hostname + '.log',
            formatter: customFileFormatter,
            json: false
        });
        winston.log('info', '------------------------------------------------------');
        winston.log('info', 'CRAWL DOMAIN - START: ', siteURL.href);
        winston.log('info', '------------------------------------------------------');

        var c = new crawler({
            maxConnections: 10,
            skipDuplicates: true,
            callback: function (error, result, $) {
                if (error) observer.onError();
                if (!$) return true;
                if (getFileObject(result.uri).ext == 'pdf') return true
                //if (result.caseless.dict['content-type'] != 'text/html; charset=utf-8') return true;

                var resultURL = url.parse(result.uri);
                var formattedURL = resultURL.href.replace(resultURL.protocol+'//'+resultURL.hostname, '');

                winston.log('info', ' CRAWLING PAGE: ', formattedURL);

                // Test for CLASS
                $('[class*="flash"]').each(function () {
                    winston.log('info', "   CLASS: '"+ $(this).attr('class')+"'");
                });

                // Test for ID
                $('[id*="flash"]').each(function () {
                    winston.log('info', "   ID: '"+ $(this).attr('id')+"'");
                });

                // Test for VALUE=SWF
                $('[value*=".swf"]').each(function () {
                    winston.log('info', "   VALUE: '"+ $(this).attr('value')+"'");
                });

                // Test for DATA=SWF
                $('[data*=".swf"]').each(function () {
                    winston.log('info', "   DATA: '"+ $(this).attr('data')+"'");
                });

                $('a[href!=""][href!="#"]').each(function () {
                    var href = $(this).attr('href');
                    var absLink = url.resolve(siteURL.href, $(this).attr('href'));
                    var target = {
                      href: absLink,          // make it absolute
                      url: url.parse(absLink) // parsed url
                    };

                    if (target.url.host == siteURL.host && sitemap.indexOf(target.href) == -1) {
                      sitemap.push(target.href);
                      c.queue(target.href);
                    }
                });
            },
            onDrain: function() {

                // var pool = c.pool
                // pool.drain(function(){pool.destroyAllNow();});
                winston.log('info', '------------------------------------------------------');
                winston.log('info', 'CRAWL DOMAIN - FINISHED:', siteURL.href);
                winston.log('info', '------------------------------------------------------');
                winston.remove(winston.transports.File);

                observer.onNext();
                observer.onCompleted();
                //process.exit(0);
            }
        });
        c.queue(siteURL.href);
    });

    return crawlerStream;
};

// Test if this is a CSV or URL and returns a Promise with Array of URLs
function getUrlsFromString(stringPath){
    if (stringPath.indexOf('.csv') > -1) {
        return RxNode.fromReadableStream(fs.createReadStream(stringPath).pipe(csv({columns: true})))
            .filter(function(columns){ // Make sure the fields have something in them
                if (columns.URLs) return true;
            })
            .map(function(columns){ // Map to actual URLs
                return columns.URLs;
            });
    }
    else {
        return Rx.Observable.just(stringPath);
    }
}

// Get file details of as a custom object
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

// Custom Log File Formatter
function customFileFormatter(options) {
    return (undefined !== options.message ? options.message : '') +
    (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
}
