var test = require('tape')
var exec = require('child_process').exec

test('function', function (t) {
  var truth = [
    '#### `apple(self, parameter=10, another=1000)`',
    'Example docstring.',
    '- **`paramter`** `int` `optional` `default = 10`',
    '   Description of parameter.',
    'Includes multiple lines.',
    'A lot of multiple lines.',
    '- **`another`** `int` `optional` `default = 1000`',
    '   Another description.',
    '#### `pear(self, parameter=10)`',
    'More docstring.',
    '- **`paramter`** `int` `optional` `default = 10`',
    '   Description of parameter'
  ]
  exec('./index.js example.py', function (err, stdout, stderr) {
    if (err) console.log(err)
    t.equal(stdout.split('\n').join(''), truth.join(''))
    t.end()
  })
})

test('class', function (t) {
  var truth = [
    '## Animals',
    '#### `cow(parameter=10, another=1000)`',
    'Example docstring.',
    '- **`paramter`** `int` `optional` `default = 10`',
    '   Description of parameter.',
    'Includes multiple lines.',
    '- **`another`** `int` `optional` `default = 1000`',
    '   Another description.',
    '#### `pig(parameter=10)`',
    'More docstring.',
    '- **`paramter`** `int` `optional` `default = 10`',
    '   Description of parameter'
  ]
  exec('./index.js example.py -c Animals', function (err, stdout, stderr) {
    if (err) console.log(err)
    t.equal(stdout.split('\n').join(''), truth.join(''))
    t.end()
  })
})
