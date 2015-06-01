var
  test = require('tap').test,
  fs = require('fs'),
  Promise = require('bluebird'),
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
  var ws = fs.createWriteStream('./test/_createResolveFile.log');
  t.equals(typeof hbsResolve._createResolveFile, 'function', '_createResolveFile is a function');
  hbsResolve._createResolveFile(ws,[[{line: 'baz', column: 'qux'}, 'foo', 'bar']]);
  ws.end();
  fs.readFile('./test/_createResolveFile.log', 'utf8', function(err, content) {
    t.equals(err, null, 'no error is present');
    t.equals(content.match(/this\[\'foo\'\] \= require\(\'foo\'\)/).length, 1, 'the proper require statement is present in file');
    t.equals(content.match(/module \"foo\" not found from \"bar\" baz\:qux/).length, 1, 'the proper error statement is present in file');
    // clean up file
    fs.unlinkSync('./test/_createResolveFile.log');
    t.end();
  });
});

test('the _mapFilePromise method', function(t) {
  t.equals(typeof hbsResolve._mapFilePromise, 'function', '_mapFilePromise is a function');
  var promise = hbsResolve._mapFilePromise('./test/templates/index.hbs');
  t.equals(promise instanceof Promise, true, 'the return from the method is a promise');
  promise
    .then(function(file) {
      var
        fileName = file[0],
        ast = file[1];

      t.equals(typeof fileName, 'string', 'file name is a string');
      t.equals(fileName, './test/templates/index.hbs', 'file name correct');
      t.equals(typeof ast, 'object', 'ast is an object');
      t.end();
    });
});

test('the _findStatements method', function(t) {
  t.equals(typeof hbsResolve._findStatements, 'function', '_findStatements is a function');
  t.equals(hbsResolve._findStatements({type: 'foo'}), false, 'this node is not a statement');
  t.equals(hbsResolve._findStatements({type: 'MustacheStatement'}), true, 'this node is a statement');
  t.equals(hbsResolve._findStatements({type: 'BlockStatement'}), true, 'this node is a statement');
  t.end();
});

test('the _mapPathResolve method', function(t) {
  t.equals(typeof hbsResolve._mapPathResolve, 'function', '_mapPathResolve is a function');
  t.equals(typeof hbsResolve._mapPathResolve(), 'function', '_mapPathResolve returns a function');
  var
    options = { basePath: 'foo' },
    files = [['bar']],
    node = {loc:{start:'baz'}, params:[{value:'qux'}]},
    fn = hbsResolve._mapPathResolve(options, files, 0);
    result = fn(node);

  t.equals(result[0], 'baz', 'The first item in the results is the node location start');
  t.equals(result[1], './foo/qux', 'The second iten in the results is a resolved path from the base path and the node param value');
  t.equals(result[2], 'bar', 'The last item in the results is the value of the files index');
  t.end();
});

test('the _findHelpers method', function(t) {
  t.equals(typeof hbsResolve._findHelpers, 'function', '_findHelpers is a function');
  t.equals(typeof hbsResolve._findHelpers(), 'function', '_findHelpers returns a function');
  // var
  //   options = { basePath: 'foo' },
  //   files = [['bar']],
  //   node = {loc:{start:'baz'}, params:[{value:'qux'}]},
  //   fn = hbsResolve._findHelpers(options, files, 0);
  //   result = fn(node);
  //
  // hbsResolve._findHelpers(options)
  t.end();
});
