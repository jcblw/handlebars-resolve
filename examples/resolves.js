function hbsResolve() {
	try {
		this['./views/qux'] = require('./views/qux');
	} catch(e) {
		throw Error('module "./views/qux" not found from "templates/another.hbs" 3:2');
	}
	try {
		this['./views/baz'] = require('./views/baz');
	} catch(e) {
		throw Error('module "./views/baz" not found from "templates/another.hbs" 5:4');
	}
	try {
		this['./views/foo'] = require('./views/foo');
	} catch(e) {
		throw Error('module "./views/foo" not found from "templates/index.hbs" 3:2');
	}
	try {
		this['./views/bar'] = require('./views/bar');
	} catch(e) {
		throw Error('module "./views/bar" not found from "templates/index.hbs" 5:4');
	}
	try {
		this['../views/quxz'] = require('../views/quxz');
	} catch(e) {
		throw Error('module "../views/quxz" not found from "a file" 1:2');
	}
}
hbsResolve.call(module.exports);