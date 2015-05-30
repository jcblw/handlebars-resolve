var
  Handlebars = require('handlebars'),
  glob = require('glob'),
  fs = require('fs'),
  Promise = require('bluebird'),
  path = require('path'),
  inspect = require('util').inspect;


function getFiles(files, callback) {
  glob(files, callback);
}

function readFile(file, callback) {
  fs.readFile(file, 'utf8', function(err, content) {
    if (err) {
      return callback(err);
    }
    callback(null, content);
  });
}

function createResolveFile(ws, files, callback) {
  var requires = files.map(function(file) {
      return '\tthis[\'' + file + '\'] = require("' + file + '");\n';
    });
  ws.write(requires.join(''));
}

function mapFilePromise(file) {
  return new Promise(function(resolve, reject) {
    readFile(file, function(err, content) {
      if (err) {
        return reject(err);
      }
      resolve(Handlebars.parse(content));
    });
  });
}

function findStatements(node) {
  var type = node.type;
  return type === 'MustacheStatement' || type === 'BlockStatement';
}

function findPathOriginal(helperName) {
  return function findPathOriginalIterator(node) {
    return node.path.original === helperName;
  };
}

function mapPathResolve(base) {
  return function mapPathResolveIterator(node) {
    var absPath = path.resolve(base +  node.params[0].value);
    return './' + path.relative(process.cwd(), absPath);
  };
}

function findHelpers(options) {
  return function findHelpersIterator(ast) {
    var fileStatements = ast.map(function(doc){
      var statements = doc.body
        .filter(findStatements)
        .filter(findPathOriginal(options.helper))
        .map(mapPathResolve(options.basePath));

      return statements;
    });
    return fileStatements;
  };
}

function resolveFile(options) {
  return function(files) {
    var ws = options.outputFile ? fs.createWriteStream(options.outputFile) : process.stdout;
    ws.write('function hbsResolve() {\n');
    files.forEach(function(file){
      createResolveFile(ws, file, function(err, files) {
        if (err) {
          throw err; // need to do something better with this
        }
      });
    });
    ws.write('}\nhbsResolve.call(module.exports);');
  };
}

function parseFiles(options) {
  var promises = options.files.map(mapFilePromise);
  Promise.all(promises)
    .then(findHelpers(options))
    .then(resolveFile(options));
}

module.exports = function(options) {

  if (Array.isArray(options.files)) {
    return parseFiles(options);
  }
  getFiles(options.files, function(err, files) {
    if (err) {
      throw err;
    }
    options.files = files;
    parseFiles(options);
  });
};
