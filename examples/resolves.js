function hbsResolve() {
	this['/Users/jlowe/dev/libs/handlebars-dependency-resolve/examples/views/qux'] = require("/Users/jlowe/dev/libs/handlebars-dependency-resolve/examples/views/qux");
	this['/Users/jlowe/dev/libs/handlebars-dependency-resolve/examples/views/baz'] = require("/Users/jlowe/dev/libs/handlebars-dependency-resolve/examples/views/baz");
	this['/Users/jlowe/dev/libs/handlebars-dependency-resolve/examples/views/foo'] = require("/Users/jlowe/dev/libs/handlebars-dependency-resolve/examples/views/foo");
	this['/Users/jlowe/dev/libs/handlebars-dependency-resolve/examples/views/bar'] = require("/Users/jlowe/dev/libs/handlebars-dependency-resolve/examples/views/bar");
}
hbsResolve.call(module.exports);