module.exports = function(node) {
	var subnodes = [];
	for (var param in node) {
		if (!node.hasOwnProperty(param) || node[param] === null)
			continue;
		if (param == 'parent')
			continue;

		if (node[param] instanceof Array) {
			subnodes = subnodes.concat(node[param]);
		}
		else if (node[param]._isNode) {
			subnodes.push(node[param]);
		}
	}
	return subnodes;
};
