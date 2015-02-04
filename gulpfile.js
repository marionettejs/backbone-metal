var gulp        = require('gulp');
var esperanto   = require('gulp-esperanto');
var sourcemaps  = require('gulp-sourcemaps');
var to5         = require('gulp-6to5');
var rename      = require('gulp-rename');
var uglify      = require('gulp-uglify');
var filter      = require('gulp-filter');
var jshint      = require('gulp-jshint');
var stylish     = require('jshint-stylish');
var mocha       = require('gulp-mocha');
var istanbul    = require('gulp-istanbul');
var isparta     = require('isparta');
var packageName = require('./package').name;

gulp.task('build', function() {
  return gulp.src('src/' + packageName + '.js')
    .pipe(sourcemaps.init())
      .pipe(to5({ blacklist: ['es6.modules', 'useStrict'], loose: 'all' }))
      .pipe(esperanto({ strict: false, type: 'umd', name: 'Metal' }))
    .pipe(sourcemaps.write('./', { addComment: false }))
      .pipe(gulp.dest('dist'))
      .pipe(filter(['*', '!**/*.js.map']))
      .pipe(uglify())
      .on('error', console.log)
      .pipe(rename({ extname: '.min.js' }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'));
});

gulp.task('jshint', function() {
  return gulp.src(['src/**/*.js', 'test/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

function test() {
  return gulp.src('test/**.js', { read: false })
    .pipe(mocha({ reporter: 'spec' }));
}

gulp.task('mocha', function() {
  require('6to5/register');
  return test();
});

gulp.task('coverage', function(done) {
  gulp.src(['src/' + packageName + '.js'])
    .pipe(istanbul({ instrumenter: isparta.Instrumenter }))
    .pipe(istanbul.hookRequire())
    .on('finish', function() {
      return test()
        .pipe(istanbul.writeReports())
        .on('end', done);
    });
});

gulp.task('test', ['jshint', 'mocha']);

gulp.task('watch', function() {
  gulp.watch('src/**.js', ['test']);
  gulp.watch('test/**.js', ['test']);
});

gulp.task('default', ['test', 'watch']);
