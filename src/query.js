function subnodes(node) {
	switch (node.type) {
		case 'root':
		case 'scope':
			return node.statements;

		case 'preprocessor':
			return node.guarded_statements;

		case 'function_declaration':
			return [node.body];

		case 'if_statement':
		case 'for_statement':
		case 'while_statement':
		case 'do_statement':
			var nodes = [node.body];
			if (node.elseBody)
				nodes.push(node.elseBody);
			return nodes;

		case 'declarator':
			return [node.typeAttribute];

		// TODO: rest of the subnode accessors
		default:
			return null;
	}
}

function attr(node, attr) {
	if (attr in node)
		return node[attr];
	return null;
}

// function members(node) {
// 	var list = [];
// 	for (var i in node) {
// 		if (node.hasOwnProperty(i))
// 			list.push(i);
// 	}
// 	// console.log('members()', node, list);
// 	return list;
// }

var factory = require('cssauron')({
	tag: 'type',
	id: 'id',
	children: subnodes,
	attr: attr,
	// class: members,

// , contents: 'innerText'
// , id: 'id'
// , class: 'className'
// , parent: 'parentNode'
// , children: 'childNodes'
// , attr: 'getAttribute(attr)'
});

module.exports = {
	subnodes: subnodes,
	selector: factory
}
