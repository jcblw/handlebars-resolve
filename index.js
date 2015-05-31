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
function createResolveFile(ws, files) {
  var requires = files.map(function(file) {
      return (
          '\ttry {\n' +
            '\t\tthis[\'' + file[1] + '\'] = require(\'' + file[1] + '\');\n' +
          '\t} catch(e) {\n' +
            '\t\tthrow Error(\'module "' +
            file[1] +
            '" not found from "' +
            file[2] +
            '" ' +
            file[0].line +
            ':' +
            file[0].column +
            '\');\n' +
          '\t}\n'
      );
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
      resolve([file, Handlebars.parse(content)]);
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
function mapPathResolve(options, files, index) {
  return function mapPathResolveIterator(node) {
    var
      fileName = files[index][0],
      absPath = path.resolve(options.basePath,  node.params[0].value),
      relPath = './' +   path.relative(options.cwd || process.cwd(), absPath);
    return [node.loc.start, relPath, fileName];
  };
};

var findHelpers =
module.exports._findHelpers =
function findHelpers(options) {
  return function findHelpersIterator(files) {
    var fileStatements = files.map(function(file, index){
      var statements = file[1].body
        .filter(findStatements)
        .filter(findPathOriginal(options.helper))
        .map(mapPathResolve(options, files, index));

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
    files.forEach(function(file, index){
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
