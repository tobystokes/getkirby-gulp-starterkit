var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var argv = require('yargs').argv;
var autoprefixer = require('autoprefixer');

/*var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');
var image  = require('gulp-image');
*/

var browserSync = require('browser-sync').create();

// assuming we're MAMP Virtualising, so add your hostname for browsersync proxy
var ENV = 'local.dev';

// Check for --production flag
var isProduction = !!(argv.production);


// Compile CSS
// In production, the CSS is compressed
gulp.task('css', function() {

    var processors = [
        autoprefixer({browsers: ['last 2 versions', 'ie >= 9']}),
    ];
	
    var paths = [
		'bower_components/foundation-sites/scss',
		'bower_components/motion-ui/src/'
	];
	
	// --production switches
	var cssnano = $.if( isProduction, $.cssnano() );
	var sourcemaps = $.if( !isProduction, $.sourcemaps.write() );
	
	return gulp.src('src/scss/main.scss')
		.pipe($.sourcemaps.init())
		.pipe($.sass({
			includePaths: paths
		})
		.on('error', $.sass.logError))
		.pipe($.postcss(processors))
		.pipe(cssnano)
		.pipe(sourcemaps)
		.pipe(gulp.dest('assets/css'));
});



// Combine JavaScript into one file
// In production, the file is minified
gulp.task('javascript', function() {

	var paths = [
		'src/js/**/*.js',
		'src/js/main.js'
	];
  
  var uglify = $.if(isProduction, $.uglify()
    .on('error', function (e) {
      console.log(e);
    }));

  return gulp.src(paths)
    .pipe($.sourcemaps.init())
    .pipe($.concat('main.js'))
    .pipe(uglify)
    .pipe($.if(!isProduction, $.sourcemaps.write()))
    .pipe(gulp.dest('assets/js'));
});



// Start a server with LiveReload to preview the site in
gulp.task('browser-sync', function() {
    browserSync.init({
        proxy: ENV,
        open: false
    });
});


// Build the site, run the server, and watch for file changes
gulp.task('default', ['css', 'javascript', 'browser-sync'], function() {
	gulp.watch(['src/scss/**/*.scss'], ['css', browserSync.reload]);
	gulp.watch(['src/js/**/*.js'], ['javascript', browserSync.reload]);
	gulp.watch(['site/**/*.php'], ['', browserSync.reload]);
});


// Build the site, with --production flag
gulp.task('build', ['css --production', 'javascript --production']);
