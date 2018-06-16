#! /usr/bin/env node
const trending          = require( 'trending-github' )
const term              = require( 'terminal-kit' ).terminal
const ora               = require( 'ora' )
const spinner           = ora( 'Loading repos...' )
const opn               = require( 'opn' )
const stripAnsi         = require( 'strip-ansi' )
const fs                = require( 'fs' )
const path              = require( 'path' )
const dayjs             = require( 'dayjs' )

// variables
let items               = []
let opnopt              = {} // app: 'firefox' / app: 'google-chrome'
let D                   = dayjs().format('YYYYMMDD')
let cachedir            = path.join(__dirname, '../cache/')
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
    defaultValue: 'starsToday',
    description: 'Sort repositories [ \'starsToday\', \'stars\', \'forks\' ], default to starsToday.'
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
  },
  {
    name: 'clearcache',
    type: Boolean,
    description: 'Delete all previous cache files.'
  },
  {
    name: 'version',
    alias: 'v',
    type: Boolean,
    description: 'Get the version.'
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
if ( options.version ) {
  v = require('../package.json').version
  console.log('gTrend version ' + v + '\nhttps://github.com/ponsfrilus/gtrend/releases/')
  process.exit()
}
if ( ![ 'daily', 'weekly', 'monthly' ].includes(options.timespan) ) {
  console.log(usage)
  console.log('\n'+term.str.red('!!! Time span should be one of \'daily\', \'weekly\' or \'monthly\' !!!')+'\n')
  process.exit()
}
if ( ![ 'starsToday', 'stars', 'forks' ].includes(options.sort) ) {
  console.log(usage)
  console.log('\n'+term.str.red('!!! Sort option should be one of \'default\', \'stars\' or \'forks\' !!!')+'\n')
  process.exit()
}
if (options.browser) {
  opnopt.app = options.browser
}

filecache += options.timespan + '_' + options.sort + ((typeof options.language === 'undefined') ? '' : '_' + options.language)
const filepath = path.join(cachedir + filecache)

if ( options.clearcache ) {
  for ( const file of fs.readdirSync(cachedir) ) {
    if ( file.substr(0, 7) == '_gtrend' ) {
      fs.unlink( path.join(cachedir, file) , err => {
        if (err) throw err
      })
    }
  }
  process.exit()
}

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

let opt = {
  leftPadding: '  ',
  selectedLeftPadding: '▸ ',
  submittedLeftPadding: '▹  ',
  continueOnSubmit: true,
  itemMaxWidth: 80,
  selectedStyle: term.dim.darkColor(1).bgGray,
  y: 9,
}

function display(repos) {
  // tailing returned data
  repos = repos.slice( 0, options.num )
  i = 0
  repos.forEach( (e) => {
    i++
    let entry1 = leftPad( term.str.bold(i), ' ', 2 ) + '. '
    entry1 += leftPad( term.str.bold(e.stars) + '☆ ', ' ', 7 ) + ''
    entry1 += rightPad( term.str.bold(e.forks) + '⑂ ', ' ', 6 ) + ''
    entry1 += term.str.cyan.bold(e.name)
    entry1 += ' (' + term.str.blue.bold('@'+e.author) + ( ( e.language == '' ) ? ')': '/' + term.str.blue.bold(e.language) + ')' )
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
    try {
      fromCache = JSON.parse( fs.readFileSync(filepath, 'utf8') )
    } catch(error) {
      return false
    }
    return fromCache
  } else {
    return false
  }
}

spinner.start()
if ( ( repos = readCache(filepath) ) && !options.nocache ) {
  if (repos && repos.length) {
    spinner.succeed( 'Repos loaded from cache' )
    display(repos)
  } else {
    spinner.fail( 'Repos not loaded' )
    console.log( 'Please try with the `--nocache` option to renew cache.' )
  }
} else {
  trending(options.timespan, options.language)
    .then(
      function (repos) {
        // sorting things up
        repos.sort((a, b) => b[options.sort] - a[options.sort] )
        if (repos && repos.length) {
          spinner.succeed( 'Repos loaded' )
          writeCache(repos)
          display(repos)
        } else {
          spinner.fail( 'Repos not loaded, please try again.' )
        }
      }
    )
}
