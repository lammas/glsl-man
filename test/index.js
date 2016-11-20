'use strict';

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
	}
};

require('./test_preprocessor')(Common);
require('./test_glsl')(Common);
require('./test_files')(Common);
require('./test_mod')(Common);
