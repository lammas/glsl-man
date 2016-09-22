var test = require('tape');
var path = require('path');
var fs   = require('fs');
var util = require('util');

var glsl = require('../index');

function inspect(o) {
	console.log(util.inspect(o, { depth: null }));
}


function parseTest(t, source) {
	var ast;
	t.doesNotThrow(function() {
		ast = glsl.parse(source);
	}, 'Parsing OK');
	var generated = glsl.string(ast);
	t.equal(generated, source, 'Generated code OK');
}


test('Preprocess: #define', function(t) {
	var ast;
	var source = '#define FOO 1\n';
	parseTest(t, source);

	source = '#define FEATURE_ENABLED\n';
	parseTest(t, source);
	t.end();
});

test('Preprocess: #undef', function(t) {
	var source = '#undef FOO\n';
	parseTest(t, source);
	t.end();
});

test('Preprocess: #ifdef', function(t) {
	var source = '#ifdef GL_ES\nprecision highp vec3;\n#endif\n';
	parseTest(t, source);
	t.end();
});

test('Preprocess: #ifndef', function(t) {
	var source = '#ifndef GL_ES\nprecision mediump vec3;\n#endif\n';
	parseTest(t, source);
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
	parseTest(t, source);
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

test('Precision', function(t) {
	var source = 'precision highp float;\n';
	parseTest(t, source);
	t.end();
});

test('Attributes, Uniforms, Varyings', function(t) {
	var sources = {
		'Attribute': 'attribute vec3 position;\n',
		'Uniform': 'uniform mat4 projection;\n',
		'Uniform with precision': 'uniform mediump vec3 scale;\n',
		'Varying': 'varying vec2 uv0;\n',
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

test('$ in identifier (template var)', function(t) {
	var source = 'void main() {\n\tint sum = 10 + $templateVar;\n}\n';
	parseTest(t, source);
	t.end();
});

test('Nested expressions', function(t) {
	var source = 'float a = (-x - zmin) / (zmax - zmin);\n';
	parseTest(t, source);
	t.end();
});

test('Ternary expression', function(t) {
	var source = 'float a = b ? 1.0 : 0.0;\n';
	parseTest(t, source);
	t.end();
});

test('if', function(t) {
	var source = 'void main() {\n\tif (a < 0.5) {\n\t\ta /= 4.0;\n\t}\n}\n';
	parseTest(t, source);
	t.end();
});

test('if-else', function(t) {
	var source = 'void main() {\n\tif (a < 0.5) {\n\t\ta *= 4.0;\n\t}\n\telse if (a > 0.5) {\n\t\ta /= 2.0;\n\t}\n\telse {\n\t\ta = 0.0;\n\t}\n}\n';
	parseTest(t, source);
	t.end();
});

test('for', function(t) {
	var source = 'void main() {\n\tint sum = 0;\n\tfor (int i = 0; i < 4; i++) {\n\t\tsum++;\n\t}\n}\n';
	parseTest(t, source);
	t.end();
});

test('while', function(t) {
	var source = 'void main() {\n\tint sum = 10;\n\twhile (sum > 0) {\n\t\t--sum;\n\t}\n}\n';
	parseTest(t, source);
	t.end();
});

test('do-while', function(t) {
	var source = 'void main() {\n\tint sum = 10;\n\tdo {\n\t\t--sum;\n\t} while (sum > 0);\n}\n';
	parseTest(t, source);
	t.end();
});

test('continue', function(t) {
	var source = 'void main() {\n\tint sum = 0;\n\tfor (int i = 0; i < 4; i++) {\n\t\tcontinue;\n\t}\n}\n';
	parseTest(t, source);
	t.end();
});

test('break', function(t) {
	var source = 'void main() {\n\tint sum = 0;\n\tfor (int i = 0; i < 4; i++) {\n\t\tbreak;\n\t}\n}\n';
	parseTest(t, source);
	t.end();
});

test('discard', function(t) {
	var source = 'void main() {\n\tdiscard;\n}\n';
	parseTest(t, source);
	t.end();
});

test('return', function(t) {
	var source = 'float f() {\n\treturn 0.5;\n}\n';
	parseTest(t, source);
	t.end();
});

test('Literals', function(t) {
	var sources = {
		'bool': 'bool n = true;\n',
		'bool': 'bool n = false;\n',
		'int': 'int n = 42;\n',
		'float': 'float n = 0.2;\n',
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

test('in, out, inout', function(t) {
	var source = 'float f(const in vec3 a, out vec3 b, inout float c) {\n\tb = a * vec3(c);\n\treturn c * 0.5;\n}\n';
	parseTest(t, source);
	t.end();
});

test('simple.glsl', function(t) {
	var file = path.join(__dirname, 'simple.glsl');
	var source = fs.readFileSync(file).toString();
	parseTest(t, source);
	t.end();
});

test('test.glsl', function(t) {
	var file = path.join(__dirname, 'test.glsl');
	var source = fs.readFileSync(file).toString();
	parseTest(t, source);
	t.end();
});

test('diffuse.frag', function(t) {
	var file = path.join(__dirname, 'diffuse.frag');
	var source = fs.readFileSync(file).toString();
	parseTest(t, source);
	t.end();
});

test('test.glsl', function(t) {
	var file = path.join(__dirname, 'test.glsl');
	var source = fs.readFileSync(file).toString();
	var ast;
	t.doesNotThrow(function() {
		ast = glsl.parse(source);
	}, 'Parsing OK');

	var generated = glsl.string(ast);
	t.equal(generated, source, 'Generated code OK');

	var selector = glsl.query.selector('declarator[typeAttribute] > type[qualifier=attribute]');
	var attributes = glsl.query.all(ast, selector);
	t.equal(attributes.length, 3, 'Found all 3 attributes');
	for (var i=0; i<attributes.length; i++) {
		t.equal(attributes[i].qualifier, 'attribute', 'Found node is attribute');

		// Tests .wrap()
		var node = attributes[i].parent;
		var withoutTerminator = glsl.string(node);
		var withTerminator = glsl.string(glsl.wrap(node));
		t.equal(withTerminator, withoutTerminator + ';\n', 'Wrapping works as expected');
	}
	t.end();
});

test('Negative int/float constant parsing', function(t) {
	var file = path.join(__dirname, 'float_const.glsl');
	var source = fs.readFileSync(file).toString();
	var ast;
	t.doesNotThrow(function() {
		ast = glsl.parse(source);
	}, 'Parsing OK');
	t.end();
});

test('Implied scope', function(t) {
	var file = path.join(__dirname, 'scope.glsl');
	var source = fs.readFileSync(file).toString();
	parseTest(t, source);
	t.end();
});

test('Arrays', function(t) {
	var file = path.join(__dirname, 'array.glsl');
	var source = fs.readFileSync(file).toString();
	parseTest(t, source);
	t.end();
});

test('Minification with defines', function(t) {
	var source = '#define SOMEVALUE 1\nuniform vec3 color;';
	var ast;
	t.doesNotThrow(function() {
		ast = glsl.parse(source);
	}, 'Parsing OK');

	var generated = glsl.string(ast, {
		tab: '',
		space: '',
		newline: ''
	});
	t.equal(generated, source, 'Generated code OK');

	t.end();
});
