var Whitespace = require('./whitespace');

var output = [];
var whitespace = null;

module.exports = function(node, options) {
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
	'unary': gen_unary,
	'postfix': gen_postfix,
	'field_selector': gen_field_selector,
	'precision': gen_precision,
	'accessor': gen_accessor,
	'if_statement': gen_if_statement,
	'return': gen_return,
	'float': gen_float,
	'int': gen_int,
};

var noTerminator = {
	'preprocessor': true,
	'function_declaration' : true,
	'if_statement' : true,
	'scope': true
};

function token(s) {
	output.push(s);
}

var stack = [];

function top() {
	if (stack.length == 0)
		return null;
	return stack[stack.length - 1];
}

function parent() {
	if (stack.length < 2)
		return null;
	return stack[stack.length - 2];
}

function list_parameters(a) {
	for (var i=0; i<a.length; i++) {
		generate(a[i]);
		if (i < a.length-1)
			whitespace.separator();
	}
}

function list_statements(a) {
	for (var i=0; i<a.length; i++) {
		generate(a[i]);
		if (!(a[i].type in noTerminator))
			whitespace.terminator();
	}
}

function generate(node) {
	// console.log('generate: ', node.type);
	var fn = types[node.type];
	if (!fn) {
		return console.warn('Warning: Encountered an AST node that has no generator:', node.type);
		//throw "Error: Unimplemented AST node: " + node.type;
	}
	stack.push(node);
	fn(node);
	stack.pop();
}

function gen_root(node) {
	list_statements(node.statements);
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
			list_statements(node.guarded_statements);
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
			list_statements(node.guarded_statements);
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
	list_parameters(node.declarators);
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
	switch (node.operator.operator) {
		case '=':
			generate(node.left);
			whitespace.space();
			generate(node.operator);
			whitespace.space();
			generate(node.right);
			break;

		default:
			if (node.left.type == 'binary') {
				token('(');
				generate(node.left);
				token(')');
			}
			else {
				generate(node.left);
			}

			whitespace.space();
			generate(node.operator);
			whitespace.space();

			if (node.right.type == 'binary') {
				token('(');
				generate(node.right);
				token(')');
			}
			else {
				generate(node.right);
			}
			break;
	}
}

function gen_unary(node) {
	generate(node.operator);
	generate(node.expression);
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
	list_parameters(node.parameters);
	token(')');
	whitespace.space();
	generate(node.body);
}

function gen_function_call(node) {
	token(node.function_name);
	token('(');
	list_parameters(node.parameters);
	token(')');
}

function gen_scope(node) {
	token('{');
	whitespace.newline();
	whitespace.indent();
	list_statements(node.statements);
	whitespace.dedent();
	whitespace.tab();
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

function gen_accessor(node) {
	token('[');
	generate(node.index);
	token(']');
}

function gen_float(node) {
	token(node.value);
	if (node.value % 1 == 0)
		token('.0');
}

function gen_int(node) {
	token(node.value);
}

function gen_precision(node) {
	token(node.type);
	whitespace.space();
	token(node.precision);
	whitespace.space();
	token(node.typeName);
}

function gen_if_statement(node, isElseIf) {
	whitespace.tab();
	if (isElseIf) token('elseif');
	else token('if');
	whitespace.space();
	token('(');
	generate(node.condition);
	token(')');
	whitespace.space();
	generate(node.body);
	if (node.elseBody) {
		if (node.elseBody.type == 'if_statement') {
			gen_if_statement(node.elseBody, true);
		}
		else {
			whitespace.tab();
			token('else');
			whitespace.space();
			generate(node.elseBody);
		}
	}
}

function gen_return(node) {
	whitespace.tab();
	token('return');
	whitespace.space();
	generate(node.value);
}
