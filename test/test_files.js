'use strict';

var test = require('tape');
var path = require('path');
var fs = require('fs');

var glsl = require('../index');

module.exports = function (Common) {
	test('Negative int/float constant parsing', function(t) {
		var file = path.join(__dirname, 'float_const.glsl');
		var source = fs.readFileSync(file).toString();
		Common.parseTest(t, source);
		t.end();
	});

	test('Implied scope', function(t) {
		var file = path.join(__dirname, 'scope.glsl');
		var source = fs.readFileSync(file).toString();
		Common.parseTest(t, source);
		t.end();
	});

	test('Arrays', function(t) {
		var file = path.join(__dirname, 'array.glsl');
		var source = fs.readFileSync(file).toString();
		Common.parseTest(t, source);
		t.end();
	});

	test('simple.glsl', function(t) {
		var file = path.join(__dirname, 'simple.glsl');
		var source = fs.readFileSync(file).toString();
		Common.parseTest(t, source);
		t.end();
	});

	test('test.glsl', function(t) {
		var file = path.join(__dirname, 'test.glsl');
		var source = fs.readFileSync(file).toString();
		Common.parseTest(t, source);
		t.end();
	});

	test('diffuse.frag', function(t) {
		var file = path.join(__dirname, 'diffuse.frag');
		var source = fs.readFileSync(file).toString();
		Common.parseTest(t, source);
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
};
