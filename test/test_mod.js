'use strict';

var test = require('tape');

var glsl = require('../index');

module.exports = function (Common) {
	test('mod.remove', function(t) {
		var source = '#include source2;\n';

		var ast;
		t.doesNotThrow(function() {
			ast = glsl.parse(source);
		}, 'Parsing OK');

		var includeNode = ast.statements[0];
		t.doesNotThrow(function() {
			glsl.mod.remove(includeNode);
		}, 'Remove');

		t.equal(glsl.string(ast), '');
		t.end();
	});

	test('mod.replace', function(t) {
		var source = '#include source2;\n';
		var source2 = 'void add(float x) {\n\treturn x + y;\n}\n';

		var ast;
		var ast2;
		t.doesNotThrow(function() {
			ast = glsl.parse(source);
			ast2 = glsl.parse(source2);
		}, 'Parsing OK');

		var includeNode = ast.statements[0];
		t.doesNotThrow(function() {
			glsl.mod.replace(includeNode, ast2);
		}, 'Replace');

		t.equal(glsl.string(ast), source2);
		t.end();
	});

	test('mod.add', function(t) {
		var source = '#include source2;\n';
		var source2 = 'uniform mat4 view;\n';

		var ast;
		var ast2;
		t.doesNotThrow(function() {
			ast = glsl.parse(source);
			ast2 = glsl.parse(source2);
		}, 'Parsing OK');

		var includeNode = ast.statements[0];
		t.doesNotThrow(function() {
			glsl.mod.addBefore(includeNode, ast2);
		}, 'Add before');

		t.doesNotThrow(function() {
			glsl.mod.addAfter(includeNode, ast2);
		}, 'Add after');

		t.equal(glsl.string(ast), source2 + source + source2);
		t.end();
	});
};
