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

	test('Sequence expressions', function(t) {
		var source = `float b(vec3 e, vec3 x, float v) {
	float n = 1.0;
	v *= 10.6;
	float t = 0.16 / v, y = 2.0 * v;
	for (int i = 0; i < 5; ++i)
		n -= ((y - l(e + (x * y)).x) * t), y += v, t *= 0.5;
	return clamp(n, 0.0, 1.0);
}
`;
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

	test('Minification with ifdef-endif', function(t) {
		var source = '#ifdef MAGIC\nconst float magicValue=4.2;\n#endif\n';
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

	test('Minification with ifdef-else-endif', function(t) {
		var source = '#ifdef MAGIC\nconst float magicValue=4.2;\n#else\nconst float magicValue=0.0;\n#endif\n';
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

	test('Structs', function(t) {
		var source = `struct Value {
	vec3 position;
	vec3 normal;
};
`;
		Common.parseTest(t, source, 'Struct');

		var source = `struct Value {
	vec3 position;
	vec3 normal;
} variableName;
`;
		Common.parseTest(t, source, 'Struct with variable name');

		var source = `struct Value {
	vec3 position;
	vec3 normal;
} var1, var2, var3;
`;
		Common.parseTest(t, source, 'Struct with multiple variable names');
		t.end();
	});

	test('Unary operator after return', function(t) {
		var source = 'float test(){return -pow(1,2);}';
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

	test('Parens with postfix operator', function(t) {
		var source = 'void main(){global=(viewinvmat*vec4(local,1.0)).xyz;}';
		Common.parseTestMinified(t, source);
		t.end();
	});

	test('Parens with ternary operator', function(t) {
		var source = 'int quick_floor(float x){return int(x)-(x<0.0?1:0);}';
		Common.parseTestMinified(t, source);
		t.end();
	});

	test('Unary operator parens', function(t) {
		var source = 'void f(){return -((lumaNW+lumaNE)-(lumaSW+lumaSE));}';
		Common.parseTestMinified(t, source);

		var source = 'void f(){return -(-sth);}';
		Common.parseTestMinified(t, source);
		t.end();
	});

	test('if with empty body', function(t) {
		var source = 'void main(){if(misttype==1.0);else fac=sqrt(fac);}';
		Common.parseTestMinified(t, source, 'if');

		var source = 'void main(){if(misttype==1.0);else;}';
		Common.parseTestMinified(t, source, 'if-else');

		var source = 'void main(){if(misttype==1.0);else if(misttype==0.0);else;}';
		Common.parseTestMinified(t, source, 'if-else if-else');

		t.end();
	});

	test('for with empty body', function(t) {
		var source = 'void main(){for(int i=0;i<5;++i);}';
		Common.parseTestMinified(t, source);
		t.end();
	});

	test('while with empty body', function(t) {
		var source = 'void main(){while(1);}';
		Common.parseTestMinified(t, source);
		t.end();
	});

	test('Array size in function parameters', function(t) {
		var source = 'void test(vec3 test1[4],out vec3 test2[4]){}';
		Common.parseTestMinified(t, source);
		t.end();
	});

	test('Basic types', function(t) {
		var sources = [
			'bool a;',
			'int a;',
			'uint a;',
			'float a;',
			'double a;',
		];
		for (var i=0; i<sources.length; ++i) {
			Common.parseTestMinified(t, sources[i], sources[i]);
		}
		t.end();
	});

	test('Vector types', function(t) {
		var sources = [
			'vec2 v;',
			'bvec2 v;',
			'ivec2 v;',
			'uvec2 v;',
			'dvec2 v;',

			'vec3 v;',
			'bvec3 v;',
			'ivec3 v;',
			'uvec3 v;',
			'dvec3 v;',

			'vec4 v;',
			'bvec4 v;',
			'ivec4 v;',
			'uvec4 v;',
			'dvec4 v;',
		];
		for (var i=0; i<sources.length; ++i) {
			Common.parseTestMinified(t, sources[i], sources[i]);
		}
		t.end();
	});

	test('Matrix types', function(t) {
		var sources = [
			'mat2 m;',
			'mat3 m;',
			'mat4 m;',

			'dmat2 m;',
			'dmat3 m;',
			'dmat4 m;',

			'mat2x2 m;',
			'mat2x3 m;',
			'mat2x4 m;',
			'dmat2x2 m;',
			'dmat2x3 m;',
			'dmat2x4 m;',

			'mat3x2 m;',
			'mat3x3 m;',
			'mat3x4 m;',
			'dmat3x2 m;',
			'dmat3x3 m;',
			'dmat3x4 m;',

			'mat4x2 m;',
			'mat4x3 m;',
			'mat4x4 m;',
			'dmat4x2 m;',
			'dmat4x3 m;',
			'dmat4x4 m;',
		];
		for (var i=0; i<sources.length; ++i) {
			Common.parseTestMinified(t, sources[i], sources[i]);
		}
		t.end();
	});

	test('Sampler types', function(t) {
		var sources = [
			'sampler1D s;',
			'usampler1D s;',
			'isampler1D s;',
			'sampler1DArray s;',
			'usampler1DArray s;',
			'isampler1DArray s;',

			'sampler2D s;',
			'usampler2D s;',
			'isampler2D s;',
			'sampler2DArray s;',
			'usampler2DArray s;',
			'isampler2DArray s;',

			'sampler3D s;',
			'usampler3D s;',
			'isampler3D s;',
			// Currently not described at https://www.khronos.org/opengl/wiki/Sampler_(GLSL)
			// 'sampler3DArray s;',
			// 'usampler3DArray s;',
			// 'isampler3DArray s;',

			'samplerCube s;',
			'usamplerCube s;',
			'isamplerCube s;',
			'samplerCubeArray s;',
			'usamplerCubeArray s;',
			'isamplerCubeArray s;',

			'samplerBuffer s;',
			'usamplerBuffer s;',
			'isamplerBuffer s;',

			'sampler2DRect s;',
			'usampler2DRect s;',
			'isampler2DRect s;',

			'sampler2DMS s;',
			'usampler2DMS s;',
			'isampler2DMS s;',
			'sampler2DMSArray s;',
			'usampler2DMSArray s;',
			'isampler2DMSArray s;',


			'sampler1DShadow s;',
			'sampler2DShadow s;',
			'samplerCubeShadow s;',
			'sampler2DRectShadow s;',
			'sampler1DArrayShadow s;',
			'sampler2DArrayShadow s;',
			'samplerCubeArrayShadow s;',
		];

		for (var i=0; i<sources.length; ++i) {
			Common.parseTestMinified(t, sources[i], sources[i]);
		}
		t.end();
	});

	test('Type suffixes', function(t) {
		var sources = [
			'int a=4;',
			'int a=0xffffffff;',
			'int a=0123;',
			'uint a=3u;',
			'uint a=0xffffffffU;',
			'uint a=0123u;',
			'uint a=0xbeefu;',
			'float a=0.5;',
			'float a=0.5f;',
			'float a=0.5F;',
			'double a=0.5lf;',
			'double a=0.5LF;',
		];
		for (var i=0; i<sources.length; ++i) {
			Common.parseTestMinified(t, sources[i], sources[i]);
		}
		t.end();
	});

	test('Custom types', function(t) {
		Common.parseTest(t, '#define VEC3 vec3\nVEC3 foobar;\n', 'defined');
		Common.parseTest(t, '#include foobar.glsl;\nFoobar foo;\n', 'included');
		t.end();
	});
};
