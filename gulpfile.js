const gulp = require('gulp');
const del = require('del');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');

var serverProject = ts.createProject('./src/tsconfig.json');

// clean the contents of the distribution directory
gulp.task('clean', function () {
  return del('dist/**/*');
});

// TypeScript compile
gulp.task('compile-server', ['clean'], function () {
  var tsResult = serverProject.src()
    .pipe(ts(serverProject));
  return tsResult.js.pipe(gulp.dest('dist'));
});

gulp.task('default', ['compile-server']);
