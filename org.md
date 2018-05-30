# About
  * I want to get a way to get the github's trending repositories info in my
    terminal

# Tips
  * When adding  
    ```
    "bin": {
      "gtrend": "bin/cli.js"
    },
    ```  
    in package.json, use `npm link` to make the command `gtrend` available system wide.

# Lookup

## Framework
  * https://oclif.io/
  * http://vorpal.js.org/
  * https://github.com/node-js-libs/cli
  * https://github.com/crcn-archive/celeri
  * https://github.com/flatiron/prompt

## Parsing args
  * https://github.com/mattallty/Caporal.js
  * https://github.com/esatterwhite/node-seeli
  * https://www.npmjs.com/package/docopt
  * https://github.com/felixSchl/neodoc
  * https://www.npmjs.com/package/commander
  * https://github.com/npm/nopt
  * https://github.com/substack/node-optimist

## Moving / Parse result
  * https://www.npmjs.com/package/terminal-kit
  * https://www.npmjs.com/package/inquirer

## Coloring terminal output
  * https://www.npmjs.com/package/chalk
  * https://www.npmjs.com/package/colors / https://github.com/Marak/colors.js
  * https://github.com/TooTallNate/ansi.js
  * https://github.com/substack/node-charm
  * https://github.com/tj/node-term-css

## Spinners
  * https://github.com/sindresorhus/ora

## Tables
  * https://www.npmjs.com/package/tty-table
  * https://github.com/jamestalmage/cli-table2
  * https://github.com/Automattic/cli-table

# Links & resources
  * [5 entertaining things you can find with the GitHub Search API](https://gist.github.com/jasonrudolph/6065289#file-02-lonely-users-md)
  * [Building command line tools with Node.js](https://developer.atlassian.com/blog/2015/11/scripting-with-node/)
  * https://www.sitepoint.com/javascript-command-line-interface-cli-node-js/
  * https://x-team.com/blog/a-guide-to-creating-a-nodejs-command/
  * https://blog.npmjs.org/post/118810260230/building-a-simple-command-line-tool-with-npm
  * https://github.com/ecrmnn/trending-github/blob/master/src/index.js
  * https://blog.risingstack.com/terminal-guide-for-nodejs/

## Man page
https://gist.github.com/eiri/6630762
```bash
$ npm install marked-man -g
$ marked-man MAN.md > doc/gtrend.1
```

Now add into package.json

```json
"man" :[ "./doc/gtrend.1" ]
```

...and link current working code into Node's path

```bash
$ npm link
$ man gtrend
```

# /tmp
  chalk — colorizes the output
  clear — clears the terminal screen
  clui — draws command-line tables, gauges and spinners
  figlet — creates ASCII art from text
  inquirer — creates interactive command-line user interface
  minimist — parses argument options
  configstore — easily loads and saves config without you having to think about where and how.
https://github.com/mtharrison/hackernews/blob/master/index.js

const tl          = require('terminal-link'); https://www.npmjs.com/package/terminal-link No emoji
