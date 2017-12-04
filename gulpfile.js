'use strict';

// Module dependencies
const gulp        = require('gulp'),
	  browserSync = require('browser-sync'),
	  reload      = browserSync.reload,
	  nodemon     = require('gulp-nodemon'),
	  watch       = require('gulp-watch'),
	  minify      = require('gulp-minify');

gulp.task('browser-sync', ['nodemon'], () =>  {
	browserSync.init(null, {
		proxy: "http://localhost:8080",
        files: ["public/**/*.js"],
        browser: "google chrome",
        port: 7000,
	});
});

// Restart server
gulp.task('nodemon', (cb) => { 
	
	var started = false;
	
	return nodemon({
		script: 'server.js'
	}).on('start', () => {
		// to avoid nodemon being started multiple times
		// thanks @matthisk
		if (!started) {
			cb();
			started = true; 
		} 
    })
    .on('restart', () => {
        setTimeout(function() {
			reload({stream: false});
		}, 2000);
    })
});

// Reload browser on file save
gulp.task('default', ['browser-sync']);