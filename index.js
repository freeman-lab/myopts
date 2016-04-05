#! /usr/bin/env node

var fs = require('fs')
var chalk = require('chalk')
var minimist = require('minimist')
var flatten = require('lodash.flatten')
var findindex = require('lodash.findindex')

var argv = minimist(process.argv.slice(2), {
  alias: {
    c: 'classname',
    o: 'output',
    t: 'title',
    s: 'sort',
    h: 'help'
  },
  default: {
    sort: 'true'
  }
})

var usage = `
usage:
  myops <source> -o <output> -c <classname>

options:
  --classname, -c     name of class
  --output, -o        name of output file
  --title, -t         title for result
  --sort, -s          sort functions by name [true]
  --help, -h          show this help message
`

if (argv.help) {
  console.log(usage)
  process.exit()
}

var source = argv._[0]

if (!source) {
  console.log(usage)
  process.exit()
}

var contents = String(fs.readFileSync(source)).split('\n')
var classname = argv.classname
var title = argv.title ? argv.title : null
var output = argv.output
var sort = argv.sort === 'true'

var ind, tab, indent
if (classname) {
  ind = findindex(contents, function (line) {
    return line.indexOf('class ' + classname) > -1
  })
  indent = 2
  tab = '    '
} else {
  ind = 0
  indent = 1
  tab = ''
}

var results = []
var start, line, previous, cond1, cond2, signature, docstring, i, j, k

if (ind < 0) {
  warning('no content parsed, try a different class name?')
  process.exit()
}

for (i = ind; i < contents.length; i++) {
  line = contents[i]
  previous = (i > 0) ? contents[i - 1] : contents[i]
  cond1 = line.indexOf(tab + 'def') === 0
  cond2 = line.indexOf(tab + 'def _') === -1 && previous.indexOf(tab + '@') === -1
  if (cond1 && cond2) {
    signature = line.slice(indent * 4, line.length)
    signature = signature.slice(0, signature.length - 1)
    if (classname) {
      signature = signature.replace('self, ', '')
      signature = signature.replace('self', '')
    }
    for (j = i + 2; j < contents.length; j++) {
      if (contents[j].indexOf(tab + tab + '"""') > -1) break
    }
    docstring = contents.slice(i + 2, j)
    docstring = docstring.map(function (line) {
      return line.slice(indent * 4, line.length)
    }).filter(function (line) {
      return (line !== '----------' && line !== 'Parameters')
    }).map(function (line) {
      if (line.indexOf('    ') === 0) return line.slice(4, line.length)
      else return line
    }).map(function (line) {
      if (line.indexOf(' : ') > -1) {
        start = line.indexOf(' : ')
        line = '- **`' + line.slice(0, start) + '`**' + ' ' + '`' +
          line.slice(start + 1, line.length).split(', ').join('` `') + '`' + '\n'
        line = line.replace('`: ', '`')
        return line
      } else {
        return line
      }
    })
    for (k = 0; k < docstring.length; k++) {
      if (docstring[k].indexOf('-') === 0) {
        docstring[k + 1] = '   ' + docstring[k + 1]
      }
    }
    results.push({
      signature: signature,
      docstring: docstring
    })
  }
}

if (sort) {
  results = results.sort(function (a, b) {
    return a.signature.localeCompare(b.signature)
  })
}

if (results.length === 0) {
  warning('no content parsed, maybe you need a class name?')
  process.exit()
}

var final = []
results.forEach(function (func) {
  final.push(['', '#### `' + func.signature + '`', ''])
  final.push(func.docstring)
})

var flattened = flatten(final)
flattened = flattened.slice(1, flattened.length)
if (title) flattened = ['## ' + title, ''].concat(flattened)

if (output) fs.writeFileSync(output, flattened.join('\n'))
else console.log(flattened.join('\n'))

function warning (msg) {
  console.log('[' + chalk.yellow('warning') + '] ' + msg)
}
