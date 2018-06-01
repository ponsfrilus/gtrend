#! /usr/bin/env node
const trending          = require( 'trending-github' )
const term              = require( 'terminal-kit' ).terminal
const ora               = require( 'ora' )
const spinner           = ora( 'Loading repos...' )
const opn               = require( 'opn' )
const stripAnsi         = require( 'strip-ansi' )
const fs                = require('fs')
const path              = require('path')
const dayjs             = require('dayjs')
// variables
let items               = []
let opnopt              = {} // app: 'firefox' / app: 'google-chrome'
let D                   = dayjs().format('YYYYMMDD')
let filecache           = '_gtrend_' + D + '_'


// CLI and validate args
const cliArgs           = require('command-line-args')
const cliUsage          = require('command-line-usage')
const optionDefinitions = [
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'Display this usage guide.'
  },
  {
    name: 'num',
    alias: 'n',
    type: Number,
    description: 'Number of items to display, default to 10.',
    defaultValue: 10
  },
  {
    name: 'timespan',
    alias: 't',
    type: String,
    defaultOption: true,
    defaultValue: 'daily',
    description: 'Time span of repositories [ \'daily\', \'weekly\', \'monthly\' ], default to daily.'
  },
  {
    name: 'sort',
    alias: 's',
    type: String,
    defaultValue: 'starstoday',
    description: 'Sort repositories [ \'starstoday\', \'stars\', \'forks\' ], default to starstoday.'
  },
  {
    name: 'language',
    alias: 'l',
    type: String,
    description: 'Specify a language, e.g. JavaScript, default to all.'
  },
  {
    name: 'browser',
    alias: 'b',
    type: String,
    description: 'Specify a browser, e.g. firefox or google-chrome.'
  },
  {
    name: 'nocache',
    type: Boolean,
    description: '(re)Load repo from GitHub, renewing cache.'
  }
]
const options           = cliArgs( optionDefinitions )
const usage             = cliUsage([
  {
    header: 'Usage',
    content: 'gtrend [OPTIONS]'
  },
  {
    header: 'Example',
    content: 'gtrend -n 15 -t monthly -l JavaScript -s stars -b firefox'
  },
  {
    header: 'Options',
    optionList: optionDefinitions
  },
  {
    header: 'Info',
    content: 'Home: {underline https://github.com/ponsfrilus/gtrend}\n' +
             'Issue: {underline https://github.com/ponsfrilus/gtrend/issues}\n' +
             'Author: {underline https://github.com/ponsfrilus}'
  }
])
if ( options.help ) {
  console.log(usage)
  process.exit()
}
if ( ![ 'daily', 'weekly', 'monthly' ].includes(options.timespan) ) {
  console.log(usage)
  console.log('\n'+term.str.red('!!! Time span should be one of \'daily\', \'weekly\' or \'monthly\' !!!')+'\n')
  process.exit()
}
if ( ![ 'starstoday', 'stars', 'forks' ].includes(options.sort) ) {
  console.log(usage)
  console.log('\n'+term.str.red('!!! Sort option should be one of \'default\', \'stars\' or \'forks\' !!!')+'\n')
  process.exit()
}
if (options.browser) {
  opnopt.app = options.browser
}
filecache += options.timespan + '_' + options.sort + ((typeof options.language === 'undefined') ? '' : '_' + options.language)
const filepath = path.join(__dirname, '../cache/' + filecache)

//https://stackoverflow.com/a/36247412/960623
const leftPad  = (s, c, n) =>{ s = s.toString(); c = c.toString(); return stripAnsi(s).length > n ? s : c.repeat(n - stripAnsi(s).length) + s; }
const rightPad = (s, c, n) =>{ s = s.toString(); c = c.toString(); return stripAnsi(s).length > n ? s : s + c.repeat(n - stripAnsi(s).length); }


// Define exits
function terminate() {
  term.grabInput( false )
  term.clear()
  setTimeout( function() { process.exit() } , 100 )
}
term.on( 'key' , function( name , matches , data ) {
  if ( name === 'CTRL_C' ) { terminate() }
  if ( name === 'q' ) { terminate() }
  if ( name === 'ESCAPE' ) { terminate() }
})

term.clear()
// Banner
term.cyan(
  '                           __                       __\n'    +
  '                    .-----|  |_.----.-----.-----.--|  |\n'   +
  '                    |  _  |   _|   _|  -__|     |  _  |\n'   +
  '                    \\___  |____|__| \\_____|__|__|_____|\n' +
  '                    |____/ github trending repositories\n'   +
  '\n' )

// debug
//term( 'The terminal size is %dx%d' , term.width , term.height )

let opt = {
  leftPadding: '  ',
  selectedLeftPadding: '▸ ',
  submittedLeftPadding: '▹  ',
  continueOnSubmit: true,
  itemMaxWidth: 80,
  y: 9,
}

function display(repos) {
  // tailing returned data
  repos = repos.slice( 0, options.num )
  i = 0
  repos.forEach( (e) => {
    i++
    let entry1 = leftPad( i, ' ', 2 ) + '. '
    entry1 += leftPad( e.stars + '☆ ', ' ', 7 ) + ''
    entry1 += rightPad( e.forks + '⑂ ', ' ', 6 ) + ''
    entry1 += e.name
    entry1 += ' (@' + e.author + ( ( e.language == '' ) ? ')': '/' + e.language + ')' )
    entry1 = rightPad( entry1, ' ', 80 )
    let entry2 = e.description || ''
    items.push( entry1 + entry2 )
  })

  var menu = term.singleColumnMenu( items , opt )
  menu.on( 'submit' , data => {
    term.saveCursor()
    term.restoreCursor()
    menu.cancel()
    opn( repos[data.selectedIndex]['href'], opnopt )
  })
}

// Save all repo to a file
function writeCache(repos) {
  fs.writeFile(filepath,
    JSON.stringify(repos, null, 2),
    (err) => { if (err) throw err }
  )
}

// Read requests in a file if possible
function readCache(filepath) {
  if (fs.existsSync(filepath)) {
    return JSON.parse( fs.readFileSync(filepath, 'utf8') )
  } else {
    return false
  }
}

spinner.start()
if ( ( repos = readCache(filepath) ) && !options.nocache ) {
  spinner.succeed( 'Repos loaded from cache' )
  display(repos)
} else {
  trending(options.timespan, options.language)
    .then(
      function (repos) {
        spinner.succeed( 'Repos loaded' )
        // sorting things up
        repos.sort((a, b) => b[options.sort] - a[options.sort] )
        writeCache(repos)
        display(repos)
      }
    )
}
