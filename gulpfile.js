var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var preprocess = require('gulp-preprocess');
var to5 = require('gulp-6to5');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var filter = require('gulp-filter');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var package = require('./package');

gulp.task('build', function() {
  return gulp.src('src/wrapper.js')
    .pipe(preprocess())
    .pipe(rename(package.name + '.js'))
    .pipe(sourcemaps.init())
      .pipe(to5())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'))
      .pipe(filter(['*', '!**/*.js.map']))
      .pipe(uglify())
      .on('error', console.log)
      .pipe(rename({ extname: '.min.js' }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'));
});

gulp.task('test', function() {
  return gulp.src(['src/**/*.js', '!src/wrapper.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('watch', function() {
  gulp.watch('src/**.js', ['test']);
  gulp.watch('test/**.js', ['test']);
});

gulp.task('default', ['test', 'watch']);
