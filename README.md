# findflash
Simple Node Script to Spider a domain finding and logging any DOM reference to things that point to Flash Player.

Flash has been getting into [a bit of trouble of late](http://www.rt.com/usa/273925-firefox-blocks-adobe-flash/). Many of us have clients with Flash sprinkled throughout their site with banners, videos, ads etc. We're left wondering just where ARE we using flash so we can start decommissioning its usage. 

Here are the tests that are run:
- CLASS with "flash" in them
- ID with "flash" in them
- VALUE with ".swf" in them
- DATA with ".swf" in them


## Install
`npm install -g findflash`

*** - There is no need to clone the repo.

## Usage
`findflash http://www.mysite.com`

or

`findflash ./test/sites.csv`

## Logfile Output
The log files will output into the directory that you run the tool.
Each log file should output named [thehostname].log

