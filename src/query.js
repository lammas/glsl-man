var subnodes = require('./subnodes');
//var traversal = require('tree-traversal');

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

// , contents: 'innerText'
// , id: 'id'
// , class: 'className'
// , parent: 'parentNode'
// , children: 'childNodes'
// , attr: 'getAttribute(attr)'
});

function any(node, selector, matches) {
	if (!matches)
		matches = [];
	if (selector(node))
		matches.push(node);

	var children = subnodes(node);
	if (children) {
		for (var i=0; i<children.length; i++) {
			any(children[i], selector, matches);
		}
	}

	return matches;
}

module.exports = {
	subnodes: subnodes,
	selector: factory,
	any: any,
}

