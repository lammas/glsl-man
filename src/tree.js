var subnodes = require('./subnodes');
var traversal = require('tree-traversal');

function build(node, done) {
	traversal.depth(node, {
		subnodesAccessor: function(node) {
			var list = subnodes(node);
			if (!list)
				return [];
			for (var i=0; i<list.length; i++)
				list[i].parent = node;
			return list;
		},
		onComplete: function(rootNode) {
			done(rootNode);
		}
	});
	return node;
}

function buildSync(node) {
	traversal.depthSync(node, {
		subnodesAccessor: function(node) {
			var list = subnodes(node);
			if (!list)
				return [];
			for (var i=0; i<list.length; i++)
				list[i].parent = node;
			return list;
		}
	});
	return node;
}

module.exports = {
	build: build,
	buildSync: buildSync
};
