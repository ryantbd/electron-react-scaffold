var gulp = require('gulp');
var gulpif = require('gulp-if');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var gls = require('gulp-live-server');
var del = require('del');
var mkdirp = require('mkdirp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var babelify = require('babelify');
var electron = require('electron-connect').server.create({
  path: __dirname + '/app/'
});

// process.env.NODE_ENV
var isProduction = (process.env.NODE_ENV !== 'development');

gulp.task('script', function () {
  var b = browserify({
    entries: ['./app/script/main.jsx'],
    debug: true
  });

  b.transform(babelify.configure({
    optional: ['es7.asyncFunctions', 'es7.classProperties']
  }));

  return b.bundle()
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(gulpif(isProduction, uglify()))
    .pipe(gulp.dest('./app/js/'));
});

gulp.task('style', function () {
  return gulp.src('./app/style/main.scss')
    .pipe(sass())
    .pipe(gulpif(isProduction, minifyCSS()))
    .pipe(gulp.dest('./app/css/'));
});

gulp.task('watch', function () {
  gulp.watch('./app/script/**/*.*', ['script']);
  gulp.watch('./app/style/**/*.*', ['style']);
});

gulp.task('clean', function () {
  return del([
    './compile/',
    './app/css/',
    './app/js/'
  ]);
});

gulp.task('copypaste', function () {
  mkdirp('./compile/', function () {
    return gulp.src('./package.json')
      .pipe(gulp.dest('./compile/'));
  });
});

gulp.task('compile', ['copypaste', 'clean', 'script', 'style'], function () {
  mkdirp('./compile/', function () {
    return gulp.src([
      './app/index.html',
      './app/index.js',
      './app/css/**/*',
      './app/js/**/*'
    ], {
      base: './app/'
    }).pipe(gulp.dest('./compile/'));
  });
});

gulp.task('debug', ['script', 'style', 'watch'], function () {
  electron.start();

  gulp.watch([
    './app/index.js',
    './app/index.html'
  ], electron.restart);
});