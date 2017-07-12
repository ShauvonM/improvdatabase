var gulp = require('gulp');
//var compass = require('gulp-compass');
var sass = require('gulp-sass');
var maps = require('gulp-sourcemaps');
var ts = require('gulp-typescript');
var watch = require('gulp-watch');
var livereload = require('gulp-livereload');
var plumber = require('gulp-plumber');
var copy = require('gulp-copy');

var tsoptions = require('./tsconfig.json');

gulp.task('default', function() {

});

gulp.task('compileAppSass', function() {
    return gulp.src('./app/sass/style.scss')
        .pipe(plumber({ errorHandler: handleError }))
        .pipe(maps.init())
        .pipe(sass())
        .pipe(maps.write('./'))
        .pipe(plumber.stop())
        .pipe(gulp.dest('./public/css'));
});

gulp.task('compileFontAwesome', function() {
    return gulp.src('./app/fontawesome/font-awesome.scss')
        .pipe(plumber({ errorHandler: handleError }))
        .pipe(maps.init())
        .pipe(sass())
        .pipe(maps.write('./'))
        .pipe(plumber.stop())
        .pipe(gulp.dest('./public/css'));
})

gulp.task('tscompile', function() {
    return gulp.src(['./app/src/**/*.ts', '!./app/src/main-aot.ts'])
        .pipe(plumber({ errorHandler: handleError }))
        .pipe(maps.init())
        .pipe(ts(tsoptions.compilerOptions))
        .pipe(maps.write('./'))
        .pipe(plumber.stop())
        .pipe(gulp.dest('./public/js'));
});

gulp.task('templateCopy', function () {
    return gulp.src('./app/src/**/*.html')
        .pipe(gulp.dest('./public/js'));
});

function handleError(err) {
    console.log(err.toString());
    this.emit('end');
}

gulp.task('watch', function () {
    gulp.watch('./app/**/*.ts', ['tscompile']);
    gulp.watch('./app/**/*.html', ['templateCopy']);
    gulp.watch('./app/fontawesome/**/*.scss', ['compileFontAwesome']);
    gulp.watch('./app/sass/**/*.scss', ['compileAppSass']);
});

gulp.task('build', ['compileAppSass', 'tscompile', 'templateCopy']);
