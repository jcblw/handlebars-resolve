var
  Handlebars = require('handlebars'),
  glob = require('glob'),
  fs = require('fs'),
  Promise = require('bluebird'),
  path = require('path'),
  inspect = require('util').inspect;


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

var  getFiles =
module.exports._getFiles =
function getFiles(files, callback) {
  glob(files, callback);
};

var readFile =
module.exports._readFile =
function readFile(file, callback) {
  fs.readFile(file, 'utf8', function(err, content) {
    if (err) {
      return callback(err);
    }
    callback(null, content);
  });
};

var createResolveFile =
module.exports._createResolveFile =
function createResolveFile(ws, files, callback) {
  var requires = files.map(function(file) {
      return '\tthis[\'' + file + '\'] = require("' + file + '");\n';
    });
  ws.write(requires.join(''));
};

var mapFilePromise =
module.exports._mapFilePromise =
function mapFilePromise(file) {
  return new Promise(function(resolve, reject) {
    readFile(file, function(err, content) {
      if (err) {
        return reject(err);
      }
      resolve(Handlebars.parse(content));
    });
  });
};

var findStatements =
module.exports._findStatements =
function findStatements(node) {
  var type = node.type;
  return type === 'MustacheStatement' || type === 'BlockStatement';
};

var findPathOriginal =
module.exports._filePathOriginal =
function findPathOriginal(helperName) {
  return function findPathOriginalIterator(node) {
    return node.path.original === helperName;
  };
};

var mapPathResolve =
module.exports._mapPathResolve =
function mapPathResolve(base) {
  return function mapPathResolveIterator(node) {
    var absPath = path.resolve(base +  node.params[0].value);
    return './' +   path.relative(process.cwd(), absPath);
  };
};

var findHelpers =
module.exports._findHelpers =
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
};

var resolveFile =
module.exports._createResolveFile =
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
};

var parseFiles =
module.exports._parseFiles =
function parseFiles(options) {
  var promises = options.files.map(mapFilePromise);
  Promise.all(promises)
    .then(findHelpers(options))
    .then(resolveFile(options));
};
