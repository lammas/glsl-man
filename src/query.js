var subnodes = require('./subnodes');

function attr(node, attr) {
	if (attr in node)
		return node[attr];
	return null;
}

var factory = require('cssauron')({
	tag: 'type',
	id: 'id',
	children: subnodes,
	parent : 'parent',
	attr: attr
});

function all(node, selector, matches) {
	if (!matches)
		matches = [];
	if (selector(node))
		matches.push(node);

	var nodes = subnodes(node);
	if (nodes) {
		for (var i=0; i<nodes.length; i++) {
			all(nodes[i], selector, matches);
		}
	}

	return matches;
}

function first(node, selector) {
	if (selector(node))
		return node;

	var nodes = subnodes(node);
	if (nodes) {
		for (var i=0; i<nodes.length; i++) {
			var selected = first(nodes[i], selector);
			if (selected !== false)
				return selected;
		}
	}
	return false;
}

function children(node, selector, matches) {
	if (!matches)
		matches = [];
	var nodes = subnodes(node);
	if (!nodes)
		return matches;
	for (var i=0; i<nodes.length; i++) {
		var child = nodes[i];
		if (selector(child))
			matches.push(child);
	}
	return matches;
}

function firstChild(node, selector) {
	var nodes = subnodes(node);
	if (!nodes)
		return null;
	for (var i=0; i<nodes.length; i++) {
		var child = nodes[i];
		if (selector(child))
			return child;
	}
	return null;
}

module.exports = {
	subnodes: subnodes,
	selector: factory,
	all: all,
	first: first,
	children: children,
	firstChild: firstChild
};
