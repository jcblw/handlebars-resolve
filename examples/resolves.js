function hbsResolve() {
	this['./views/qux'] = require("./views/qux");
	this['./views/baz'] = require("./views/baz");
	this['./views/foo'] = require("./views/foo");
	this['./views/bar'] = require("./views/bar");
}
hbsResolve.call(module.exports);