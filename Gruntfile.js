module.exports = function(grunt) {

	// load grunt's plugins - don't forget to add plugins here
	// as modules are installed!
	[
	'grunt-cafe-mocha',
	'grunt-contrib-jshint'
	].forEach(function(task) {
		grunt.loadNpmTasks(task);
	});

	// configure the plugins. Check grunt documentation.
	grunt.initConfig({
		cafemocha: {
			all: {src: 'qa/tests-*.js', options: {ui: 'tdd'}, }
		},
		jshint: {
			app: ['server.js', 'public/js/**/*.js', 'lib/**/*.js'],
			qa: ['Gruntfile.js', 'public/qa/**/*.js', 'qa/**/*.js'],
		},
	});

	// register tasks
	grunt.registerTask('default', ['cafemocha','jshint']);
};