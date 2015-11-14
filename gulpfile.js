var gulp = require('gulp');
var exec = require('child_process').exec;

/**
 * Builds the PEG.js parser using the grammar from Google's glsl-unit project.
 */
gulp.task('parser', function(next) {
	exec('node_modules/.bin/pegjs peg/glsl.pegjs src/parser.js', function(err, stdout, stderr) {
		next(err)
	});
});


gulp.task('default', function() {
	console.log('** Nothing here **');
});
