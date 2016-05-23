# GLSL manipulator
GLSL parser and code generator based on Google's glsl-unit grammar.

[![NPM](https://nodei.co/npm/glsl-man.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/glsl-man/)

## Install

```sh
npm install glsl-man
```

## Usage

### Parsing

```javascript
var glsl = require('glsl-man');
var ast = glsl.parse(source);
```

### Deparsing

```javascript
var glsl = require('glsl-man');
var ast = glsl.parse(source);
var generated = glsl.string(ast);
```

### Querying

```javascript
var glsl = require('glsl-man');
var ast = glsl.parse(source);
var uniforms = glsl.query.all(
	ast,
	glsl.query.selector('declarator[typeAttribute] > type[qualifier=uniform]'));
```

## API

### Parsing

* `glsl.parse(string)` - Generates AST from GLSL
  - *string* - GLSL source code


### Deparsing

* `glsl.string(ASTNode, options)` - Generates GLSL from AST
  - *ASTNode* - Any node from the tree returned by `parse(string)`
  - *options* - The default options are described below:
```javascript
	{
		tab: '\t',       // Character used for tab
		space: ' ',      // Character used for space
		newline: '\n',   // Character used for newlines

		// The following should not be altered to produce valid GLSL
		terminator: ';', // Character used to terminate a statement
		comma: ','       // Character used for comma
	}
```


* `glsl.wrap(ASTNode)` - Wraps the given node in a 'root' scope. Useful for
  generating valid code from arbitrary AST subnodes.
  - *ASTNode* - Any node from the tree returned by `parse(string)`


### Querying

* `glsl.query.selector(string)` - Returns a selector
  - *string* - [cssauron](https://github.com/chrisdickinson/cssauron) selector


* `glsl.query.all(node, selector, matches)` - Searches the tree depth first and returns all nodes that match the selector
  - *node* - AST node
  - *selector* - The selector to test against
  - *matches* - Array to store matched nodes (optional)


* `glsl.query.first(node, selector)` - Searches the tree depth first and returns the first node that matches the selector
  - *node* - AST node
  - *selector* - The selector to test against


* `glsl.query.children(node, selector, matches)` - Searches only the immediate subnodes of the given node and returns all children that match the selector
  - *node* - AST node
  - *selector* - The selector to test against
  - *matches* - Array to store matched nodes (optional)


* `glsl.query.firstChild(node, selector)` - Searches only the immediate subnodes of the given node and returns the first node that matches the selector
  - *node* - AST node
  - *selector* - The selector to test against


* `glsl.query.subnodes(node)` - Returns a list of all subnodes of the given node that can be further traversed
  - *node* - AST node
