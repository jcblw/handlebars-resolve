var
  test = require('tap').test,
  fs = require('fs'),
  hbsResolve = require('..');

test('the _readFile method', function(t) {
  t.equals(typeof hbsResolve._readFile, 'function', '_readFiles is a function');
  hbsResolve._readFile('test/templates/index.hbs', function(err, file) {
    t.equals(err, null, 'error is not present');
    t.equals(typeof file, 'string', 'file content is a string');
    t.end();
  });
});

test('the _createResolveFile method', function(t) {
  // var ws = fs.createWriteStream();
  t.equals(typeof hbsResolve._createResolveFile, 'function', '_createResolveFile is a function');
  // hbsResolve._createResolveFile(ws)
  t.end();
});
