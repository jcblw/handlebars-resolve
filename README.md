# Handlebars Resolve

Sometimes you wanna make super cool [Handlebars](http://handlebarsjs.com) helpers that reference  external js files to build advanced templates. This is super easy on server side javascript code all you have to do is make a reference, and it works. On a client that is not so simple. If your using something like [browserify](http://browserify.org/), your bundle of javascript files will not contain the files referanced inside of your templates. This module intends to help that out.

Handlebars Resolve will parse and find all paths inside of a template file and create a file that will referance the file as well as allow access to that file inside of your helpers.
