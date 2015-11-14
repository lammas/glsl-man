var Whitespace = require('./whitespace');
var util = require('util');

var output = [];
var whitespace = null;

module.exports = function(node, options) {
	// console.log(util.inspect(node, { depth: null }));

	output.length = 0;
	whitespace = new Whitespace(options, token);
	generate(node);
	whitespace = null;
	return output.join('');
}

var types = {
	'root': gen_root,
	'type': gen_type,
	'preprocessor': gen_preprocessor,
	'identifier': gen_identifier,
	'operator': gen_operator,
	'parameter': gen_parameter,
	'function_declaration': gen_function,
	'function_call': gen_function_call,
	'scope': gen_scope,
	'declarator': gen_declarator,
	'declarator_item': gen_declarator_item,
	'expression': gen_expression,
	'binary': gen_binary,
	'postfix': gen_postfix,
	'field_selector': gen_field_selector,
	'precision': gen_precision,

	'float': gen_float,
};

function token(s) {
	output.push(s);
}

function generate(node) {
	// console.log('generate: ', node.type);
	var fn = types[node.type];
	if (!fn) {
		return console.warn('Warning: Encountered an AST node that has no generator:', node.type);
		//throw "Error: Unimplemented AST node: " + node.type;
	}
	return fn(node);
}

function list(a, useSeparator) {
	for (var i=0; i<a.length; i++) {
		generate(a[i]);
		if (useSeparator && i < a.length-1)
			whitespace.separator();
	}
}

function gen_root(node) {
	list(node.statements);
}

function gen_type(node) {
	if (node.qualifier) {
		token(node.qualifier);
		whitespace.space();
	}
	token(node.name);
}

function gen_preprocessor(node) {
	switch (node.directive) {
		case '#define':
			token(node.directive);
			whitespace.space();
			token(node.identifier);
			whitespace.space();
			token(node.token_string);
			whitespace.newline();
			break;

		case '#ifdef':
		case '#ifndef':
		case '#if':
		case '#elif':
			token(node.directive);
			whitespace.space();
			token(node.value);
			whitespace.newline();
			list(node.guarded_statements);
			if ('elseBody' in node)
				generate(node.elseBody);
			else {
				token('#endif');
				whitespace.newline();
			}
			break;
		case '#else':
			token(node.directive);
			whitespace.newline();
			list(node.guarded_statements);
			token('#endif');
			whitespace.newline();
			break;

		case '#version':
		case '#undef':
		case '#pragma':
		case '#extension':
		case '#line':
		case '#error':
		case '#include':
			token(node.directive);
			whitespace.space();
			token(node.value);
			whitespace.newline();
			break;
	}
}

function gen_identifier(node) {
	token(node.name);
}

function gen_operator(node) {
	token(node.operator);
}

function gen_declarator(node) {
	whitespace.tab();
	generate(node.typeAttribute);
	whitespace.space();
	list(node.declarators, true);
	whitespace.terminator();
}

function gen_declarator_item(node) {
	generate(node.name);
	if ('initializer' in node) {
		whitespace.space();
		token('=');
		whitespace.space();
		generate(node.initializer);
	}
}

function gen_expression(node) {
	whitespace.tab();
	generate(node.expression);
}

function gen_binary(node) {
	generate(node.left);
	whitespace.space();
	generate(node.operator);
	whitespace.space();
	generate(node.right);
	whitespace.terminator();
}

function gen_parameter(node) {
	token(node.type_name);
	whitespace.space();
	token(node.name);
}

function gen_function(node) {
	generate(node.returnType);
	whitespace.space();
	token(node.name);
	token('(');
	list(node.parameters, true);
	token(')');
	whitespace.space();
	generate(node.body);
}

function gen_function_call(node) {
	token(node.function_name);
	token('(');
	list(node.parameters, true);
	token(')');
}

function gen_scope(node) {
	token('{');
	whitespace.newline();
	whitespace.indent();
	list(node.statements);
	whitespace.dedent();
	token('}');
	whitespace.newline();
}

function gen_postfix(node) {
	generate(node.expression);
	generate(node.operator);
}

function gen_field_selector(node) {
	token('.');
	token(node.selection);
}

function gen_float(node) {
	token(node.value);
	if (node.value % 1 == 0)
		token('.0');
}

function gen_precision(node) {
	token(node.type);
	whitespace.space();
	token(node.precision);
	whitespace.space();
	token(node.typeName);
	whitespace.terminator();
}
