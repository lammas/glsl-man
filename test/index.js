'use strict';

var util = require('util');
var glsl = require('../index');

var Common = {
	inspect: function(o) {
		console.log(util.inspect(o, { depth: null }));
	},

	parseTest: function(t, source, message) {
		var msg = '';
		if (message) {
			msg = message + ' - ';
		}

		var ast;
		t.doesNotThrow(function() {
			ast = glsl.parse(source);
		}, msg + 'Parsing OK');

		var generated = glsl.string(ast);
		t.equal(generated, source, msg + 'Generated code OK');

		return ast; // for inspection
	},

	parseTestMinified: function(t, source, message) {
		var msg = '';
		if (message) {
			msg = message + ' - ';
		}

		var ast;
		t.doesNotThrow(function() {
			ast = glsl.parse(source);
		}, msg + 'Parsing OK');

		var generated = glsl.string(ast, {
			tab: '',
			space: '',
			newline: ''
		});
		t.equal(generated, source, msg + 'Generated code OK');

		return ast; // for inspection
	}
};

require('./test_preprocessor')(Common);
require('./test_glsl')(Common);
require('./test_files')(Common);
require('./test_mod')(Common);
