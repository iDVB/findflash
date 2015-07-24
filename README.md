findflash
=========

Simple Node commandline tool that spiders domains finding and logging any DOM reference to things that hint at the use of Flash. It excepts either a single domain or a list of them in 

## Why?
Flash has been getting into [a bit of trouble of late](http://www.rt.com/usa/273925-firefox-blocks-adobe-flash/). Many of us have clients with Flash sprinkled throughout their site with banners, videos, ads etc. We're left wondering just where ARE we using flash so we can start decommissioning its usage. 

## What does it test for?
- CLASS with "flash" (any occurance)
- ID with "flash" (any occurance)
- VALUE with ".swf" (any occurance)
- DATA with ".swf" (any occurance)

## Dependencies
Bascially the only dependency is that you have some type of build tool. VS C++, Xcode or Python. Since this uses the [node-gyp](https://goo.gl/0pjwaO) to build.
- node-gyp ([please see docs](https://goo.gl/0pjwaO))


## Install
With *npm* do:
`npm install -g findflash`

***There is no need to clone this repo. The package is registered on npm.***

## Usage
`findflash http://www.mysite.com`

or

`findflash ./test/sites.csv`

## Logfile Output
The log files will output into the directory that you run the tool.
Each log file should output named [thehostname].log


## Coming Soon
- cli params for overiding log output path
- Resource searching (js, json, swfobject.js)
- Dynamic Video Modal Detection
