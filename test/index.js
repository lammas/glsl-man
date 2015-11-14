var test = require('tape');
var path = require('path');
var fs   = require('fs');
var util = require('util');

var parser = require('../index');

//var file = path.join(__dirname, 'test.glsl');
var file = path.join(__dirname, 'simple.glsl');

test('Source to AST', function(t) {
	var source = fs.readFileSync(file).toString();
	var ast = parser.parse(source);
	t.notEqual(ast, null, 'Parser returned something');
	//console.log(util.inspect(ast, { depth: null }));
	t.end();
});

test('AST to source', function(t) {
	var source = fs.readFileSync(file).toString();
	var ast = parser.parse(source);
	t.notEqual(ast, null, 'Parser returned something');

	var src = parser.string(ast);
	console.log('OUTPUT:\n');
	console.log(src);
	//console.log(util.inspect(ast, { depth: null }));
	t.end();
});

