module.exports = function(node) {
	switch (node.type) {
		case 'root':
		case 'scope':
			return node.statements;

		case 'preprocessor':
			if (node.guarded_statements)
				return node.guarded_statements;
			return null;

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
			return [node.typeAttribute].concat(node.declarators);

		case 'declarator_item':
			return [node.name];

		// TODO: rest of the subnode accessors
		default:
			return null;
	}
};
