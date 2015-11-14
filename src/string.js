var util = require('util');

var output = [];


module.exports = function(node) {
	console.log(util.inspect(node, { depth: null }));

	output.length = 0;
	deparse(node);
	return output.join('');
}

var types = {
	'root': deparse_root,
	'type': deparse_type,
	'identifier': deparse_identifier,
	'operator': deparse_operator,
	'parameter': deparse_parameter,
	'function_declaration': deparse_function,
	'function_call': deparse_function_call,
	'scope': deparse_scope,
	'declarator': deparse_declarator,
	'declarator_item': deparse_declarator_item,
	'expression': deparse_expression,
	'binary': deparse_binary,
	'postfix': deparse_postfix,
	'field_selector': deparse_field_selector,

	'float': deparse_float,
};

var COMMA = ', ';

function token(s) {
	output.push(s);
}


function deparse(node) {
	console.log('deparse: ', node.type);
	var fn = types[node.type];
	if (!fn) {
		return console.warn('Warning: Encountered an AST node that has no generator:', node.type);
		//throw "Error: Unimplemented AST node: " + node.type;
	}
	return fn(node);
}

function list(a, separator) {
	for (var i=0; i<a.length; i++) {
		deparse(a[i]);
		if (separator && i < a.length-1)
			token(separator);
	}
}

function deparse_root(node) {
	list(node.statements);
}

function deparse_type(node) {
	token(node.name);
}

function deparse_identifier(node) {
	token(node.name);
}

function deparse_operator(node) {
	token(node.operator);
}

function deparse_declarator(node) {
	deparse(node.typeAttribute);
	token(' ');
	list(node.declarators, COMMA);
	token(';');
}

function deparse_declarator_item(node) {
	deparse(node.name);
	if ('initializer' in node) {
		token(' ');
		token('=');
		token(' ');
		deparse(node.initializer);
	}
}

function deparse_expression(node) {
	deparse(node.expression);
}

function deparse_binary(node) {
	deparse(node.left);
	token(' ');
	deparse(node.operator);
	token(' ');
	deparse(node.right);
	token(';');
}

function deparse_parameter(node) {
	token(node.type_name);
	token(' ');
	token(node.name);
}

function deparse_function(node) {
	deparse(node.returnType);
	token(' ');
	token(node.name);
	token('(');
	list(node.parameters, COMMA);
	token(')');
	deparse(node.body);
}

function deparse_function_call(node) {
	token(node.function_name);
	token('(');
	list(node.parameters, COMMA);
	token(')');
}

function deparse_scope(node) {
	token('{');
	list(node.statements);
	token('}');
}

function deparse_postfix(node) {
	deparse(node.expression);
	deparse(node.operator);
}

function deparse_field_selector(node) {
	token('.');
	token(node.selection);
}

function deparse_float(node) {
	token(node.value);
	if (node.value % 1 == 0)
		token('.0');
}
