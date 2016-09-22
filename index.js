var parser = require('./src/parser');
var tree = require('./src/tree');

function parse(source) {
	var ast = parser.parse(source);
	tree.buildSync(ast);
	return ast;
}

module.exports = {
	parse: parse,
	string: require('./src/string'),
	query: require('./src/query'),
	mod: require('./src/mod'),
	wrap: require('./src/wrap')
};
