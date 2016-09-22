function find(node) {
	var parent = node.parent;
	var index = parent.statements.indexOf(node);
	if (index < 0) {
		throw new Error('node not found on parent statements');
	}
	return {
		index: index,
		statements: parent.statements
	};
}


function remove(node) {
	var findRes = find(node);
	findRes.statements.splice(findRes.index, 1);
}


function replace(node, newNode) {
	var findRes = find(node);
	var spliceIndex = findRes.index;
	var spliceLength = 1;
	if (Array.isArray(newNode)) {
		var args = [spliceIndex, spliceLength].concat(newNode);
		findRes.statements.splice.apply(findRes.statements, args);
	} else {
		findRes.statements.splice(spliceIndex, spliceLength, newNode);
	}
}


function add(node, newNode, after) {
	var findRes = find(node);
	var spliceIndex = findRes.index;
	if (after) {
		spliceIndex++;
	}
	var spliceLength = 0;
	if (Array.isArray(newNode)) {
		var args = [spliceIndex, spliceLength].concat(newNode);
		findRes.statements.splice.apply(findRes.statements, args);
	} else {
		findRes.statements.splice(spliceIndex, spliceLength, newNode);
	}
}


function addBefore(node, newNode) {
	return add(node, newNode, false);
}


function addAfter(node, newNode) {
	return add(node, newNode, true);
}


module.exports = {
	find: find,
	remove: remove,
	add: add,
	addAfter: addAfter,
	addBefore: addBefore,
	replace: replace
};
