# [Handlebars Resolve](../index.js "go to original file")

this is the main export

* @param options {Object} - the options object to configure what files are exported
  * @param options.files {String|Array} - a string or array of handlebar files that is to be parsed
  * @param options.outputFile {String} - a path to output require statements to. If no path is given the output will be piped to stdout.
  * @param options.view {String} - the helper that is referancing the path to resolve.
  * @param options.basePath {String} - a path to the base of the files that will be referance. If the referance is &quot;foo&quot; from the templates but the file is referanced is located at &quot;./views/foo&quot; this would be &quot;./views/&quot;
  * @param options.cwd {String} - the cwd of the referances to be made. Defaults to `process.cwd()`


## readFile

this is pretty much a alias of `fs.readFile` that addes utf8 encoding

* @param file {String} - path to a file
* @param callback {Function} - a function to callback with results


## createResolveFile

this will loop through "resolvable paths" and writes out statments to a Writeable Stream

* @param ws {Object} - a writable stream
* @param files {Array} - an array to referances that came from Handlebars templates


## mapFilePromise

wraps readFile and returns a promise.

* @param file {String} - a path to a file to be read.
* @returns promise {Object} - a promise for the read file


## findStatements

a method to filter out Handlebars ast to helpers

* @param node {Object} - a node ast for Handlebars
* @returns isHelper {Boolean} - is true if is a helper


## findPathOriginal

will filter out helpers to the helper specified in main export options

* @param helperName {string} - the helper name
* @returns findPathOriginalIterator {Function} - a function for a filter method to iterate over.


## mapPathResolve

will map over a list of node and return an array with a relative path the module referanced based off main exports options path options.

* @param options {Objects} - the same object as main exports options
* @param files {Array} - Array of files being iterator over
* @param index {Number} - The index of the current file.
* @returns mapPathResolveIterator {Function} - a function for a map method to iterate over.
-@returns fileArray {Array} - start location of statement, relative path to module, handlebars file found in.


## findHelpers

this method combines a few methods to find helpers from files filter them down and find modules referanced in Handlebars files.

* @param options {Objects} - same as main exports options object
* @returns findHelpersIterator {Function} - function to call with list of files
  * @returns fileStatements {Array} - a vertex that contains array of helper paths


## resolveFile

will create a resolve file out of all the files read.

* @param options {Objects} - same as main exports options object
* @returns resolveFileIterator {Function} - function to call with list of files


## parseFiles

is a pipe line for reading, parsing, filtering, writing data.

* @param options {Objects} - same as main exports options object