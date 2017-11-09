var Whitespace = require('./whitespace');
var wrap = require('./wrap');

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
	'struct_definition': gen_struct_definition,
	'scope': gen_scope,
	'declarator': gen_declarator,
	'declarator_item': gen_declarator_item,
	'expression': gen_expression,
	'sequence': gen_sequence,
	'binary': gen_binary,
	'unary': gen_unary,
	'ternary': gen_ternary,
	'postfix': gen_postfix,
	'field_selector': gen_field_selector,
	'precision': gen_precision,
	'accessor': gen_accessor,
	'if_statement': gen_if_statement,
	'for_statement': gen_for_statement,
	'while_statement': gen_while_statement,
	'do_statement': gen_do_statement,
	'continue': gen_continue,
	'break': gen_break,
	'return': gen_return,
	'discard': gen_discard,
	'float': gen_float,
	'int': gen_int,
	'bool': gen_bool,
};

var noTerminator = {
	'root': true,
	'preprocessor': true,
	'function_declaration' : true,
	'if_statement' : true,
	'for_statement' : true,
	'while_statement' : true,
	'scope': true
};

var noParens = {
	'identifier': true,
	'function_call': true,
};

var unaryParens = {
	'unary': true,
	'binary': true,
	'ternary': true
};

var binaryParens = {
	'binary': true,
	'ternary': true
};

function token(s) {
	output.push(s);
}

function last_token() {
	if (output.length == 0)
		return null;
	return output[output.length - 1];
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
		if (a[i].type == 'expression' && !a[i].expression)
			continue;
		if (a[i].type != 'preprocessor')
			whitespace.tab();
		generate(a[i]);
		if (!(a[i].type in noTerminator))
			whitespace.terminateLine();
	}
}

function statement_body(node, forceSpace) {
	if (node.type == 'scope') {
		whitespace.space();
		generate(node);
	}
	else {
		if (forceSpace)
			whitespace.space(true);
		if (node.type == 'expression' && node.expression == null) {
			whitespace.terminator();
		}
		else {
			whitespace.newline();
			whitespace.indent();
			generate(wrap(node));
			whitespace.dedent();
		}
	}
}

function generate(node) {
	if (!node)
		return;
	var fn = types[node.type];
	if (!fn) {
		return console.warn('Warning: Encountered an AST node that has no generator:', node.type);
	}
	return fn(node);
}

function gen_root(node) {
	list_statements(node.statements);
}

function gen_bool(node) {
	token(node.value);
}

function gen_type(node) {
	if (node.qualifier) {
		token(node.qualifier);
		whitespace.space(true);
	}
	if (node.precision) {
		token(node.precision);
		whitespace.space(true);
	}
	token(node.name);
}

function gen_preprocessor(node) {
	if (last_token() != null && last_token() != '\n')
		whitespace.newline(true);

	switch (node.directive) {
		case '#define':
			token(node.directive);
			whitespace.space(true);
			token(node.identifier);
			if (node.parameters && node.parameters.length > 0) {
				token('(');
				list_parameters(node.parameters);
				token(')');
			}
			if (node.token_string && node.token_string.length > 0) {
				whitespace.space(true);
				token(node.token_string);
			}
			whitespace.newline(true);
			break;

		case '#ifdef':
		case '#ifndef':
		case '#if':
		case '#elif':
			token(node.directive);
			whitespace.space(true);
			token(node.value);
			whitespace.newline(true);
			list_statements(node.guarded_statements);
			if ('elseBody' in node)
				generate(node.elseBody);
			else {
				if (last_token() != null && last_token() != '\n')
					whitespace.newline(true);
				token('#endif');
				whitespace.newline(true);
			}
			break;
		case '#else':
			token(node.directive);
			whitespace.newline(true);
			list_statements(node.guarded_statements);
			if (last_token() != null && last_token() != '\n')
				whitespace.newline(true);
			token('#endif');
			whitespace.newline(true);
			break;

		case '#version':
		case '#undef':
		case '#pragma':
		case '#extension':
		case '#line':
		case '#error':
		case '#include':
			token(node.directive);
			whitespace.space(true);
			token(node.value);
			whitespace.newline(true);
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
	generate(node.typeAttribute);
	whitespace.space(true);
	list_parameters(node.declarators);
}

function gen_declarator_item(node) {
	generate(node.name);
	if ('arraySize' in node) {
		token('[');
		generate(node.arraySize);
		token(']');
	}
	if ('initializer' in node) {
		whitespace.space();
		token('=');
		whitespace.space();
		generate(node.initializer);
	}
}

function gen_expression(node) {
	generate(node.expression);
}

function gen_sequence(node) {
	a = node.expressions
	for (var i=0; i<a.length; i++) {
		generate(a[i]);
		if (i < a.length-1)
			whitespace.separator();
	}
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
			if (node.left.type in binaryParens) {
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

			if (node.right.type in binaryParens) {
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
	if (node.expression.type in unaryParens) {
		token('(');
		generate(node.expression);
		token(')');
	}
	else {
		generate(node.expression);
	}
}


function gen_parameter(node) {
	if (node.typeQualifier) {
		token(node.typeQualifier);
		whitespace.space(true);
	}
	if (node.parameterQualifier) {
		token(node.parameterQualifier);
		whitespace.space(true);
	}
	token(node.type_name);
	whitespace.space(true);
	token(node.name);

	if ('arraySize' in node) {
		token('[');
		generate(node.arraySize);
		token(']');
	}
}

function gen_function(node) {
	generate(node.returnType);
	whitespace.space(true);
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

function gen_struct_definition(node) {
	token('struct');
	whitespace.space(true);
	token(node.name)
	whitespace.space();
	token('{');
	whitespace.newline();
	whitespace.indent();
	list_statements(node.members);
	whitespace.dedent();
	whitespace.tab();
	token('}');
	if ('declarators' in node && node.declarators.length > 0) {
		whitespace.space();
		list_parameters(node.declarators);
	}
}

function gen_scope(node, noNewline) {
	token('{');
	whitespace.newline();
	whitespace.indent();
	list_statements(node.statements);
	whitespace.dedent();
	whitespace.tab();
	token('}');
	if (!noNewline)
		whitespace.newline();
}

function gen_postfix(node) {
	if (node.expression.type in noParens) {
		generate(node.expression);
	}
	else {
		token('(');
		generate(node.expression);
		token(')');
	}

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
}

function gen_int(node) {
	token(node.value);
}

function gen_bool(node) {
	token(node.value);
}

function gen_precision(node) {
	token(node.type);
	whitespace.space(true);
	token(node.precision);
	whitespace.space(true);
	token(node.typeName);
}

function gen_if_statement(node, isElseIf) {
	if (isElseIf) {
		whitespace.tab();
		token('else if');
	}
	else token('if');
	whitespace.space();
	token('(');
	generate(node.condition);
	token(')');
	statement_body(node.body);
	if (node.elseBody) {
		if (node.elseBody.type == 'if_statement') {
			gen_if_statement(node.elseBody, true);
		}
		else {
			whitespace.tab();
			token('else');
			// Only force space after statement if newlines are stripped
			// and we actually have a statement following the 'else'.
			var forceSpace = false;
			if (whitespace.options.newline == '')
				forceSpace = true;
			if (node.elseBody.type == 'expression' && node.elseBody.expression == null)
				forceSpace = false;
			statement_body(node.elseBody, forceSpace);
		}
	}
}

function gen_return(node) {
	token('return');
	whitespace.space(true);
	generate(node.value);
}

function gen_ternary(node) {
	generate(node.condition);
	whitespace.space();
	token('?');
	whitespace.space();
	generate(node.is_true);
	whitespace.space();
	token(':');
	whitespace.space();
	generate(node.is_false);
}

function gen_for_statement(node) {
	token('for');
	whitespace.space();
	token('(');
	generate(node.initializer);
	whitespace.terminator();
	whitespace.space();
	generate(node.condition);
	whitespace.terminator();
	whitespace.space();
	generate(node.increment);
	token(')');
	statement_body(node.body);
}

function gen_while_statement(node) {
	token('while');
	whitespace.space();
	token('(');
	generate(node.condition);
	token(')');
	statement_body(node.body);
}

function gen_do_statement(node) {
	token('do');
	whitespace.space();
	gen_scope(node.body, true);
	whitespace.space();
	token('while');
	whitespace.space();
	token('(');
	generate(node.condition);
	token(')');
}

function gen_continue(node) {
	token('continue');
}

function gen_break(node) {
	token('break');
}

function gen_discard(node) {
	token('discard');
}
