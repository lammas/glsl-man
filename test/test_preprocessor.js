'use strict';

var test = require('tape');

var glsl = require('../index');

module.exports = function(Common) {
	test('Preprocess: #define', function(t) {
		var ast;
		var source = '#define FOO 1\n';
		Common.parseTest(t, source);

		source = '#define FEATURE_ENABLED\n';
		Common.parseTest(t, source);
		t.end();
	});

	test('Preprocess: #undef', function(t) {
		var source = '#undef FOO\n';
		Common.parseTest(t, source);
		t.end();
	});

	test('Preprocess: #ifdef', function(t) {
		var source = '#ifdef GL_ES\nprecision highp vec3;\n#endif\n';
		Common.parseTest(t, source);
		t.end();
	});

	test('Preprocess: #ifndef', function(t) {
		var source = '#ifndef GL_ES\nprecision mediump vec3;\n#endif\n';
		Common.parseTest(t, source);
		t.end();
	});

	test('Preprocess: #if-else', function(t) {
		var ast;
		var source = '#ifdef FOO\nconst float foo = 1.0;\n#else\nconst float foo = 0.5;\n#endif\n';
		t.doesNotThrow(function() {
			ast = glsl.parse(source);
		}, '#ifdef - Parsed successfully');
		var generated = glsl.string(ast);
		t.equal(generated, source, '#ifdef - Generated code OK');

		source = '#if FOO == 1\nconst float foo = 1.0;\n#else\nconst float foo = 0.5;\n#endif\n';
		t.doesNotThrow(function() {
			ast = glsl.parse(source);
		}, '#if - Parsed successfully');
		generated = glsl.string(ast);
		t.equal(generated, source, '#if - Generated code OK');
		t.end();
	});

	test('Preprocess: #if-elif-else', function(t) {
		var source = '#if FOO == 1\nconst float foo = 1.0;\n#elif FOO == 2\nconst float foo = 1.0;\n#else\nconst float foo = 0.0;\n#endif\n';
		Common.parseTest(t, source);
		t.end();
	});

	test('Preprocess: #version, #pragma, #extension, #error, #line, #include', function(t) {
		var sources = {
			'#version': '#version 150\n',
			'#pragma': '#pragma glslify: noise = require(glsl-noise/simplex/2d)\n',
			'#extension': '#extension GL_EXT_draw_buffers : require\n',
			'#error': '#error "Compile error"\n',
			'#line': '#line 10\n',
			'#include': '#include "common/constants.glsl"\n'
		};
		var ast;
		for (var name in sources) {
			var source = sources[name];
			t.doesNotThrow(function() {
				ast = glsl.parse(source);
			}, name + ' - Parsed successfully');
			var generated = glsl.string(ast);
			t.equal(generated, source, name + ' - Generated code OK');
		}
		t.end();
	});
};
