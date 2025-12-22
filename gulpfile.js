const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const gulpprefixer = require('gulp-autoprefixer').default;
const cssMin = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename')
const tailwindcss = require('tailwindcss');
const postCss = require('gulp-postcss');
const prefixer = require('autoprefixer');

const browserSync = require('browser-sync').create();
const { deleteAsync } = require('del');

function compiletailwind() {
    return src('tailwind/tailwind.css')
    .pipe(postCss([tailwindcss(), prefixer()]))
    .pipe(dest('dist/css'))
}

function compilecss() {
    return src('./scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulpprefixer({
            overrideBrowserslist: [
                "> 0.5%",
                "last 2 versions",
                "not dead"
            ]
        }))
        .pipe(dest('./dist/css'))
}

function cssmin() {
    return src('./dist/css/*.css')
    .pipe(cssMin())
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest('./dist/css'))
}

function jsmin() {
    return src('./js/*.js')
        .pipe(uglify())
        .pipe(dest('./dist/js'))
}

function clean() {
    return deleteAsync('./dist/*');
}

function live(done) {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    })

    watch('./scss/*.scss').on('change', clean);
    watch('./scss/*.scss', compilecss);
    watch('js/*.js', jsmin).on('change', browserSync.reload)
    watch('index.html').on('change', browserSync.reload)
    watch(['tailwind/tailwind.css', './*.html', './js/**/*.js']).on('change', browserSync.reload)

    done();
}

function watchTask(done) {
    watch(['tailwind/tailwind.css', './*.html', './js/*.js'], compiletailwind)
    watch('./scss/*.scss', series(compilecss, cssmin))
    watch('js/*.js', jsmin)

    done();
}

exports.default = series(
    clean,
    compilecss,
    compiletailwind,
    cssmin,
    jsmin,
    parallel(watchTask, live)
)
