var gulp       = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var preprocess = require('gulp-preprocess');
var to5        = require('gulp-6to5');
var rename     = require('gulp-rename');
var uglify     = require('gulp-uglify');
var filter     = require('gulp-filter');
var jshint     = require('gulp-jshint');
var stylish    = require('jshint-stylish');
var mocha      = require('gulp-mocha');
var dox        = require('gulp-dox');
var package    = require('./package');

gulp.task('build', function() {
  return gulp.src('src/wrapper.js')
    .pipe(preprocess())
    .pipe(rename(package.name + '.js'))
    .pipe(sourcemaps.init())
      .pipe(to5({ blacklist: ['useStrict', '_declarations'] }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'))
      .pipe(filter(['*', '!**/*.js.map']))
      .pipe(uglify())
      .on('error', console.log)
      .pipe(rename({ extname: '.min.js' }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'));
});

gulp.task('docs', function() {
  return gulp.src('src/metal.js')
    .pipe(dox())
    .pipe(gulp.dest('docs/'));
});

gulp.task('jshint', function() {
  return gulp.src(['src/**/*.js', '!src/wrapper.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('mocha', function() {
  return gulp.src('test/**.js', { read: false })
    .pipe(mocha({ reporter: 'spec' }));
});

gulp.task('test', ['jshint', 'mocha']);

gulp.task('watch', function() {
  gulp.watch('src/**.js', ['test']);
  gulp.watch('test/**.js', ['test']);
});

gulp.task('default', ['test', 'watch']);
