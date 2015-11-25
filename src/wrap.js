var parser = require('./parser');
var tree = require('./tree');

module.exports = function(node) {
	var ast = parser.parse(''); // Creates empty root scope
	if (node)
		ast.statements.push(node);
	return tree.buildSync(ast);
};
