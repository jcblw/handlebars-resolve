# Handlebars Resolve

[![Greenkeeper badge](https://badges.greenkeeper.io/jcblw/handlebars-resolve.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/jcblw/handlebars-resolve.svg?branch=master)](https://travis-ci.org/jcblw/handlebars-resolve)

Sometimes you wanna make super cool [Handlebars](http://handlebarsjs.com) helpers that reference  external js files to build advanced templates. This is super easy on server side javascript code all you have to do is make a reference, and it works. On a client that is not so simple. If your using something like [browserify](http://browserify.org/), your bundle of javascript files will not contain the files referanced inside of your templates. This module intends to help that out.

Handlebars Resolve will parse and find all paths inside of a template file and create a file that will referance the file as well as allow access to that file inside of your helpers.

## Usage

make sure its installed.

```javascript
var hbsResolve = require('handlebars-resolve');

hbsResolve({
  files: './templates/*.hbs',
  helper: 'view',
  outputFile: './resolves.js',
  basePath: './views/'
});
```

> This is a fairly new repo, if you find a bug report it.
