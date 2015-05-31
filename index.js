var
  Handlebars = require('handlebars'),
  glob = require('glob'),
  fs = require('fs'),
  Promise = require('bluebird'),
  path = require('path'),
  inspect = require('util').inspect;


/*
  Handlebars Resolve
  ===================
  this is the main export

  - @param options {Object} - the options object to configure what files are exported
    - @param options.files {String|Array} - a string or array of handlebar files that is to be parsed
    - @param options.outputFile {String} - a path to output require statements to. If no path is given the output will be piped to stdout.
    - @param options.view {String} - the helper that is referancing the path to resolve.
    - @param options.basePath {String} - a path to the base of the files that will be referance. If the referance is "foo" from the templates but the file is referanced is located at "./views/foo" this would be "./views/"
    - @param options.cwd {String} - the cwd of the referances to be made. Defaults to `process.cwd()`

*/

module.exports = function(options) {
  if (Array.isArray(options.files)) {
    return parseFiles(options);
  }
  glob(options.files, function(err, files) {
    if (err) {
      throw err;
    }
    options.files = files;
    parseFiles(options);
  });
};

/*
  readFile
  ----------
  this is pretty much a alias of `fs.readFile` that addes utf8 encoding

  - @param file {String} - path to a file
  - @param callback {Function} - a function to callback with results
*/

var readFile =
module.exports._readFile =
function readFile(file, callback) {
  fs.readFile(file, 'utf8', callback);
};

/*
  createResolveFile
  ----------
  this will loop through "resolvable paths" and writes out statments to a Writeable Stream

  - @param ws {Object} - a writable stream
  - @param files {Array} - an array to referances that came from Handlebars templates
*/

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

/*
  mapFilePromise
  ---------------
  wraps readFile and returns a promise.

  - @param file {String} - a path to a file to be read.
  - @returns promise {Object} - a promise for the read file
*/

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

/*
  findStatements
  ---------------
  a method to filter out Handlebars ast to helpers

  - @param node {Object} - a node ast for Handlebars
  - @returns isHelper {Boolean} - is true if is a helper
*/

var findStatements =
module.exports._findStatements =
function findStatements(node) {
  var type = node.type;
  return type === 'MustacheStatement' || type === 'BlockStatement';
};

/*
  findPathOriginal
  ---------------
  will filter out helpers to the helper specified in main export options

  - @param helperName {string} - the helper name
  - @returns findPathOriginalIterator {Function} - a function for a filter method to iterate over.
*/

var findPathOriginal =
module.exports._filePathOriginal =
function findPathOriginal(helperName) {
  return function findPathOriginalIterator(node) {
    return node.path.original === helperName;
  };
};

/*
  mapPathResolve
  ---------------
  will map over a list of node and return an array with a relative path the module referanced based off main exports options path options.

  - @param options {Objects} - the same object as main exports options
  - @param files {Array} - Array of files being iterator over
  - @param index {Number} - The index of the current file.
  - @returns mapPathResolveIterator {Function} - a function for a map method to iterate over.
    -@returns fileArray {Array} - start location of statement, relative path to module, handlebars file found in.
*/

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

/*
  findHelpers
  ---------------
  this method combines a few methods to find helpers from files filter them down and find modules referanced in Handlebars files.

  - @param options {Objects} - same as main exports options object
  - @returns findHelpersIterator {Function} - function to call with list of files
    - @returns fileStatements {Array} - a vertex that contains array of helper paths
*/

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

/*
  resolveFile
  ---------------
  will create a resolve file out of all the files read.

  - @param options {Objects} - same as main exports options object
  - @returns resolveFileIterator {Function} - function to call with list of files
*/

var resolveFile =
module.exports._resolveFile =
function resolveFile(options) {
  return function resolveFileIterator(files) {
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

/*
  parseFiles
  ---------------
  is a pipe line for reading, parsing, filtering, writing data.

  - @param options {Objects} - same as main exports options object
*/

var parseFiles =
module.exports._parseFiles =
function parseFiles(options) {
  var promises = options.files.map(mapFilePromise);
  Promise.all(promises)
    .then(findHelpers(options))
    .then(resolveFile(options));
};
