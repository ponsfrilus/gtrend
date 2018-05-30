#! /usr/bin/env node
const trending    = require( 'trending-github' )
const term        = require( 'terminal-kit' ).terminal
const ora         = require( 'ora' )
const spinner     = ora( 'Loading repos' )
const opn         = require( 'opn' )
const stripAnsi   = require( 'strip-ansi' ) ;
//https://stackoverflow.com/a/36247412/960623
const leftPad  = (s, c, n) =>{ s = s.toString(); c = c.toString(); return stripAnsi(s).length > n ? s : c.repeat(n - stripAnsi(s).length) + s; }
const rightPad = (s, c, n) =>{ s = s.toString(); c = c.toString(); return stripAnsi(s).length > n ? s : s + c.repeat(n - stripAnsi(s).length); }

let freq = 'daily'
let prog = ''
let list = 10
let items = []
let opnopt = { wait: false } // {app: 'firefox'}

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

var opt = {
  leftPadding: '  ',
  selectedLeftPadding: '▸ ',
  submittedLeftPadding: '▹  ',
  continueOnSubmit: true,
  itemMaxWidth: 80,
  y: 9,
}

trending(freq, prog)
  .then( spinner.start() )
  .then(
    function (repos) {
      spinner.succeed()
      return repos
    }
  )
  .then(function (repos) {
    repos = repos.slice( 0, list )
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
