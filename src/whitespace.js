/**
 * Helper function for extending options objects.
 */
function extend() {
	for (var i=1; i<arguments.length; i++)
		for (var key in arguments[i])
			if (arguments[i].hasOwnProperty(key))
				arguments[0][key] = arguments[i][key];
	return arguments[0];
}

var Whitespace = function(options, token) {
	this.options = {
		tab: '\t',
		space: ' ',
		newline: '\n',
		terminator: ';',
		comma: ',',
	};
	extend(this.options, options);

	this.token = token || function() {};
	this.level = 0;
	this.tabcache = [''];
}

Whitespace.prototype.space = function (hard) {
	if (hard)
		return this.token(' ');
	return this.token(this.options.space);
};

Whitespace.prototype.newline = function () {
	return this.token(this.options.newline);
};

Whitespace.prototype.terminateLine = function () {
	this.token(this.options.terminator);
	this.token(this.options.newline);
};

Whitespace.prototype.terminator = function () {
	return this.token(this.options.terminator);
};

Whitespace.prototype.separator = function () {
	this.token(this.options.comma);
	this.token(this.options.space);
};

Whitespace.prototype.tab = function () {
	if (this.level < this.tabcache.length)
		return this.token(this.tabcache[this.level]);
	var buffer = ''
	for (var i = 0, len = this.level, o = this.options.tab; i < len; ++i) {
		buffer += o;
	}
	return this.token(this.tabcache[this.level] = buffer);
};

Whitespace.prototype.indent = function () {
	return ++this.level;
};

Whitespace.prototype.dedent = function () {
	return --this.level;
};

module.exports = Whitespace;
