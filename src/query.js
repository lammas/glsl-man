var subnodes = require('./subnodes');

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
	parent : 'parent',
	attr: attr,
	// class: members,
	// contents: 'name'
});

function all(node, selector, matches) {
	if (!matches)
		matches = [];
	if (selector(node))
		matches.push(node);

	var children = subnodes(node);
	if (children) {
		for (var i=0; i<children.length; i++) {
			all(children[i], selector, matches);
		}
	}

	return matches;
}

function first(node, selector) {
	if (selector(node))
		return node;

	for (var i=0; i<node.children.length; i++) {
		var selected = first(node.children[i], selector);
		if (selected !== false)
			return selected;
	}
	return false;
}

function children(node, selector) {
	var matches = [];
	for (var i=0; i<node.children.length; i++) {
		var child = node.children[i];
		if (selector(child))
			matches.push(child);
	}
	return matches;
}

function firstChild(node, selector) {
	for (var i=0; i<node.children.length; i++) {
		var child = node.children[i];
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

