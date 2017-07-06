'use strict';

import gulp          from 'gulp';
import minifyCSS     from 'gulp-cssnano';
import sass          from 'gulp-sass';
import browserSync   from 'browser-sync';
import uglify        from 'gulp-uglify';
import rename        from 'gulp-rename';
import replace       from 'gulp-replace';
import notify        from 'gulp-notify';
import colors        from 'colors';
import path          from 'path';
import eslint        from 'gulp-eslint';
import sourcemaps    from 'gulp-sourcemaps';
import source        from 'vinyl-source-stream';
import buffer        from 'vinyl-buffer';
import browserify    from 'browserify';
import babel         from 'babelify';

gulp.task('sass', () => {
  return gulp.src('sass/**/*.scss')
    .pipe(sass())
    .pipe(minifyCSS())
    .pipe(gulp.dest('./build/css/'))
    .pipe(notify({ message: 'CSS complete' }));
});

gulp.task('browser-sync', () => {
  browserSync({
    server: {
      baseDir: path.join(__dirname, 'build')
    },
    host: 'localhost',
    port: 8000,
    open: false
  });
});

// separate task for unminifed version in case
// we want error logs
gulp.task('browserify' , () => {
  return browserify('./js/main.js')
    .bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest('./build/js'));
});

gulp.task('scripts', () => {
  return browserify('./js/main.js')
    .bundle()
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(uglify())
      .on('error', function(err){
        console.log(err)
      })
    .pipe(rename('main.min.js'))
    .pipe(gulp.dest('./build/js'));
});

gulp.task('eslint', () => {
  return gulp.src('./js/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(notify({ message: 'ESLint complete' }));
});

gulp.task('watch', ['browser-sync'], () => {
  gulp.watch('sass/**/*.scss', ['sass']);
  gulp.watch('js/**/*.js', ['browserify', 'scripts']);
});

gulp.task('default', ['watch']);
