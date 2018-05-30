#! /usr/bin/env node
const trending          = require( 'trending-github' )
const term              = require( 'terminal-kit' ).terminal
const ora               = require( 'ora' )
const spinner           = ora( 'Loading repos' )
const opn               = require( 'opn' )
const stripAnsi         = require( 'strip-ansi' )

// variables
let items = []
let opnopt = {} // app: 'firefox' / app: 'google-chrome'

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
  }
]
const options = cliArgs(optionDefinitions)
const usage   = cliUsage([
  {
    header: 'Typical Example',
    content: 'gtrend -l javascript'
  },
  {
    header: 'Full Example',
    content: 'gtrend -n 15 -t monthly -l ruby -s stars'
  },
  {
    header: 'Options',
    optionList: optionDefinitions
  },
  {
    header: 'Info',
    content: 'Project home: {underline https://github.com/ponsfrilus/gtrend}\n' +
             'Project issues: {underline https://github.com/ponsfrilus/gtrend/issues}\n' +
             'Project author: {underline https://github.com/ponsfrilus}'
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

console.log(options)
//process.exit()

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
//term( 'The terminal size is %dx%d' , term.width , term.height ) ;

let opt = {
  leftPadding: '  ',
  selectedLeftPadding: '▸ ',
  submittedLeftPadding: '▹  ',
  continueOnSubmit: true,
  itemMaxWidth: 80,
  y: 9,
}

trending(options.timespan, options.language)
  .then( spinner.start() )
  .then(
    function (repos) {
      spinner.succeed()
      return repos
    }
  )
  .then(function (repos) {
    // sorting things up
    repos.sort((a, b) => b[options.sort] - a[options.sort] )
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

    var menu = term.singleColumnMenu( items , opt ) ;
    menu.on( 'submit' , data => {
      term.saveCursor() ;
      term.restoreCursor() ;
      menu.cancel() ;
      opn( repos[data.selectedIndex]['href'], opnopt)
    })
  })
