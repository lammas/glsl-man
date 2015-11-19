var test = require('tape');
var path = require('path');
var fs   = require('fs');
var util = require('util');

var parser = require('../index');

function inspect(o) {
	console.log(util.inspect(o, { depth: null }));
}

test('Preprocess: #define', function(t) {
	var ast;
	var source = '#define FOO 1\n';
	t.throws(ast = parser.parse(source), 'Parsed successfully');
	var generated = parser.string(ast);
	t.equal(generated, source, 'Generated code matches');
	t.end();
});

test('Preprocess: #undef', function(t) {
	var ast;
	var source = '#undef FOO\n';
	t.throws(ast = parser.parse(source), 'Parsed successfully');
	var generated = parser.string(ast);
	t.equal(generated, source, 'Generated code matches');
	t.end();
});

test('Preprocess: #ifdef', function(t) {
	var ast;
	var source = '#ifdef GL_ES\nprecision highp vec3;\n#endif\n';
	t.throws(ast = parser.parse(source), 'Parsed successfully');
	var generated = parser.string(ast);
	t.equal(generated, source, 'Generated code matches');
	t.end();
});

test('Preprocess: #ifndef', function(t) {
	var ast;
	var source = '#ifndef GL_ES\nprecision mediump vec3;\n#endif\n';
	t.throws(ast = parser.parse(source), 'Parsed successfully');
	var generated = parser.string(ast);
	t.equal(generated, source, 'Generated code matches');
	t.end();
});

test('Preprocess: #if-else', function(t) {
	var ast;
	var source = '#ifdef FOO\nconst float foo = 1.0;\n#else\nconst float foo = 0.5;\n#endif\n';
	t.throws(ast = parser.parse(source), '#ifdef - Parsed successfully');
	var generated = parser.string(ast);
	t.equal(generated, source, '#ifdef - Generated code matches');

	source = '#if FOO == 1\nconst float foo = 1.0;\n#else\nconst float foo = 0.5;\n#endif\n';
	t.throws(ast = parser.parse(source), '#if - Parsed successfully');
	generated = parser.string(ast);
	t.equal(generated, source, '#if - Generated code matches');
	t.end();
});

test('Preprocess: #if-elif-else', function(t) {
	var ast;
	var source = '#if FOO == 1\nconst float foo = 1.0;\n#elif FOO == 2\nconst float foo = 1.0;\n#else\nconst float foo = 0.0;\n#endif\n';
	t.throws(ast = parser.parse(source), 'Parsed successfully');
	var generated = parser.string(ast);
	t.equal(generated, source, 'Generated code matches');
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
		t.throws(ast = parser.parse(source), name + ' - Parsed successfully');
		var generated = parser.string(ast);
		t.equal(generated, source, name + ' - Generated code matches');
	}
	t.end();
});

test('Precision', function(t) {
	var ast;
	var source = 'precision highp float;\n';
	t.throws(ast = parser.parse(source), 'Parsed successfully');
	var generated = parser.string(ast);
	t.equal(generated, source, 'Generated code matches');
	t.end();
});

test('Attributes, Uniforms, Varyings', function(t) {
	var sources = {
		'Attributes': 'attribute vec3 position;\n',
		'Uniforms': 'uniform mat4 projection;\n',
		'Varyings': 'varying vec2 uv0;\n',
	};
	var ast;
	for (var name in sources) {
		var source = sources[name];
		t.throws(ast = parser.parse(source), name + ' - Parsed successfully');
		var generated = parser.string(ast);
		t.equal(generated, source, name + ' - Generated code matches');
	}
	t.end();
});

test('Nested expressions', function(t) {
	var ast;
	var source = 'float a = (-x - zmin) / (zmax - zmin);\n';
	t.throws(ast = parser.parse(source), 'Parsed successfully');
	var generated = parser.string(ast);
	t.equal(generated, source, 'Generated code matches');
	t.end();
});

test('Ternary expression', function(t) {
	var ast;
	var source = 'float a = b ? 1.0 : 0.0;\n';
	t.throws(ast = parser.parse(source), 'Parsed successfully');
	var generated = parser.string(ast);
	t.equal(generated, source, 'Generated code matches');
	t.end();
});

test('if', function(t) {
	var ast;
	var source = 'void main() {\n\tif (a < 0.5) {\n\t\ta /= 4.0;\n\t}\n}\n';
	t.throws(ast = parser.parse(source), 'Parsed successfully');
	var generated = parser.string(ast);
	t.equal(generated, source, 'Generated code matches');
	t.end();
});

test('if-else', function(t) {
	var ast;
	var source = 'void main() {\n\tif (a < 0.5) {\n\t\ta *= 4.0;\n\t}\n\telseif (a > 0.5) {\n\t\ta /= 2.0;\n\t}\n\telse {\n\t\ta = 0.0;\n\t}\n}\n';
	t.throws(ast = parser.parse(source), 'Parsed successfully');
	var generated = parser.string(ast);
	t.equal(generated, source, 'Generated code matches');
	t.end();
});

test('for', function(t) {
	var ast;
	var source = 'void main() {\n\tint sum = 0;\n\tfor (int i = 0; i < 4; i++) {\n\t\tsum++;\n\t}\n}\n';
	t.throws(ast = parser.parse(source), 'Parsed successfully');
	var generated = parser.string(ast);
	t.equal(generated, source, 'Generated code matches');
	t.end();
});

test('while', function(t) {
	var ast;
	var source = 'void main() {\n\tint sum = 10;\n\twhile (sum > 0) {\n\t\t--sum;\n\t}\n}\n';
	t.throws(ast = parser.parse(source), 'Parsed successfully');
	var generated = parser.string(ast);
	t.equal(generated, source, 'Generated code matches');
	t.end();
});

test('do-while', function(t) {
	var ast;
	var source = 'void main() {\n\tint sum = 10;\n\tdo {\n\t\t--sum;\n\t} while (sum > 0);\n}\n';
	t.throws(ast = parser.parse(source), 'Parsed successfully');
	var generated = parser.string(ast);
	t.equal(generated, source, 'Generated code matches');
	t.end();
});

test('continue', function(t) {
	var ast;
	var source = 'void main() {\n\tint sum = 0;\n\tfor (int i = 0; i < 4; i++) {\n\t\tcontinue;\n\t}\n}\n';
	t.throws(ast = parser.parse(source), 'Parsed successfully');
	var generated = parser.string(ast);
	t.equal(generated, source, 'Generated code matches');
	t.end();
});

test('break', function(t) {
	var ast;
	var source = 'void main() {\n\tint sum = 0;\n\tfor (int i = 0; i < 4; i++) {\n\t\tbreak;\n\t}\n}\n';
	t.throws(ast = parser.parse(source), 'Parsed successfully');
	var generated = parser.string(ast);
	t.equal(generated, source, 'Generated code matches');
	t.end();
});

test('discard', function(t) {
	var ast;
	var source = 'void main() {\n\tdiscard;\n}\n';
	t.throws(ast = parser.parse(source), 'Parsed successfully');
	var generated = parser.string(ast);
	t.equal(generated, source, 'Generated code matches');
	t.end();
});

test('return', function(t) {
	var ast;
	var source = 'float f() {\n\treturn 0.5;\n}\n';
	t.throws(ast = parser.parse(source), 'Parsed successfully');
	var generated = parser.string(ast);
	t.equal(generated, source, 'Generated code matches');
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
		t.throws(ast = parser.parse(source), name + ' - Parsed successfully');
		var generated = parser.string(ast);
		t.equal(generated, source, name + ' - Generated code matches');
	}
	t.end();
});

test('in, out, inout', function(t) {
	var ast;
	var source = 'float f(const in vec3 a, out vec3 b, inout float c) {\n\tb = a * vec3(c);\n\treturn c * 0.5;\n}\n';
	t.throws(ast = parser.parse(source), 'Parsed successfully');
	var generated = parser.string(ast);
	t.equal(generated, source, 'Generated code matches');
	t.end();
});

test('simple.glsl', function(t) {
	var file = path.join(__dirname, 'simple.glsl');
	var source = fs.readFileSync(file).toString();
	var ast;
	t.throws(ast = parser.parse(source), 'Parsed successfully');
	var generated = parser.string(ast);
	t.equal(generated, source, 'Generated code matches');
	t.end();
});

test('test.glsl', function(t) {
	var file = path.join(__dirname, 'test.glsl');
	var source = fs.readFileSync(file).toString();
	var ast;
	t.throws(ast = parser.parse(source), 'Parsed successfully');
	var generated = parser.string(ast);
	t.equal(generated, source, 'Generated code matches');
	t.end();
});

test('diffuse.frag', function(t) {
	var file = path.join(__dirname, 'diffuse.frag');
	var source = fs.readFileSync(file).toString();
	var ast;
	t.throws(ast = parser.parse(source), 'Parsed successfully');
	var generated = parser.string(ast);
	t.equal(generated, source, 'Generated code matches');
	t.end();
});

test('test.glsl', function(t) {
	var file = path.join(__dirname, 'test.glsl');
	var source = fs.readFileSync(file).toString();
	var ast;
	t.throws(ast = parser.parse(source), 'Parsed successfully');
	//inspect(ast);

	var generated = parser.string(ast);
	t.equal(generated, source, 'Generated code matches');

	var selector = parser.query.selector('declarator[typeAttribute] > type[qualifier=attribute]');
	var attributes = parser.query.all(ast, selector);
	t.equal(attributes.length, 3, 'Found all 3 attributes');
	for (var i=0; i<attributes.length; i++)
		t.equal(attributes[i].qualifier, 'attribute', 'Found node is attribute');
	t.end();
});
