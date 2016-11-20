'use strict';

var test = require('tape');

var glsl = require('../index');

module.exports = function(Common) {

	test('Precision', function(t) {
		var source = 'precision highp float;\n';
		Common.parseTest(t, source);
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
		Common.parseTest(t, source);
		t.end();
	});

	test('Nested expressions', function(t) {
		var source = 'float a = (-x - zmin) / (zmax - zmin);\n';
		Common.parseTest(t, source);
		t.end();
	});

	test('Ternary expression', function(t) {
		var source = 'float a = b ? 1.0 : 0.0;\n';
		Common.parseTest(t, source);
		t.end();
	});

	test('if', function(t) {
		var source = 'void main() {\n\tif (a < 0.5) {\n\t\ta /= 4.0;\n\t}\n}\n';
		Common.parseTest(t, source);
		t.end();
	});

	test('if-else', function(t) {
		var source = 'void main() {\n\tif (a < 0.5) {\n\t\ta *= 4.0;\n\t}\n\telse if (a > 0.5) {\n\t\ta /= 2.0;\n\t}\n\telse {\n\t\ta = 0.0;\n\t}\n}\n';
		Common.parseTest(t, source);
		t.end();
	});

	test('for', function(t) {
		var source = 'void main() {\n\tint sum = 0;\n\tfor (int i = 0; i < 4; i++) {\n\t\tsum++;\n\t}\n}\n';
		Common.parseTest(t, source);
		t.end();
	});

	test('while', function(t) {
		var source = 'void main() {\n\tint sum = 10;\n\twhile (sum > 0) {\n\t\t--sum;\n\t}\n}\n';
		Common.parseTest(t, source);
		t.end();
	});

	test('do-while', function(t) {
		var source = 'void main() {\n\tint sum = 10;\n\tdo {\n\t\t--sum;\n\t} while (sum > 0);\n}\n';
		Common.parseTest(t, source);
		t.end();
	});

	test('continue', function(t) {
		var source = 'void main() {\n\tint sum = 0;\n\tfor (int i = 0; i < 4; i++) {\n\t\tcontinue;\n\t}\n}\n';
		Common.parseTest(t, source);
		t.end();
	});

	test('break', function(t) {
		var source = 'void main() {\n\tint sum = 0;\n\tfor (int i = 0; i < 4; i++) {\n\t\tbreak;\n\t}\n}\n';
		Common.parseTest(t, source);
		t.end();
	});

	test('discard', function(t) {
		var source = 'void main() {\n\tdiscard;\n}\n';
		Common.parseTest(t, source);
		t.end();
	});

	test('return', function(t) {
		var source = 'float f() {\n\treturn 0.5;\n}\n';
		Common.parseTest(t, source);
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
		Common.parseTest(t, source);
		t.end();
	});

	test('Minification', function(t) {
		const src = `
		void main() {
			int a = 1;
			int b = 2;
			int c = 0;

			if (a < b)
				c = a;
			else
				c = b;
		}`;

		const ast = glsl.parse(src);
		const str = glsl.string(ast, {tab:'', space:'', newline:''});
		t.equals(str, 'void main(){int a=1;int b=2;int c=0;if(a<b)c=a;else c=b;}', 'Generated code OK');
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

	test('Float constants', function(t) {
		Common.parseTest(t, 'float f = 1.0;\n', 'Value: 1.0');
		Common.parseTest(t, 'float f = 2.321;\n', 'Value: 2.321');
		Common.parseTest(t, 'float f = -2.321;\n', 'Value: -2.321');
		Common.parseTest(t, 'float f = 1.23e-9;\n', 'Value: 1.23e-9');
		Common.parseTest(t, 'float f = -1.23e-9;\n', 'Value: -1.23e-9');
		Common.parseTest(t, 'float f = 2e-9;\n', 'Value: 2e-9');
		Common.parseTest(t, 'float f = -2e-9;\n', 'Value: -2e-9');
		t.end();
	});
};
