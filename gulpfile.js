'use strict';

// Module dependencies
const gulp = require('gulp');
const browserSync = require('browser-sync');
const reload = browserSync.reload;
const nodemon = require('gulp-nodemon');
const minify = require('gulp-minify');
// const cp = require('child_process');

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
gulp.task('default', ['browser-sync'], () => {
	gulp.watch(["**/*.html", "**/*.css", "**/*.js", "**/**/*.ejs", "*.json", "*.md"], () => {
		reload();
	});
});

// Minify .js files
gulp.task('compress', function() {
  gulp.src('public/js/*.js')
    .pipe(minify({
        ext:{
            src:'-debug.js',
            min:'.js'
        },
        ignoreFiles: ['-min.js']
    }))
    .pipe(gulp.dest('public/js'))
});