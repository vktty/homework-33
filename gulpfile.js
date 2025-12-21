const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const gulpprefixer = require('gulp-autoprefixer').default;
const cssMin = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename')


const browserSync = require('browser-sync').create();
const { deleteAsync } = require('del');
// const concat = require('gulp-concat');

// const paths = {
//     style: {
//         src: 'scss/*.scss',
//         dist: 'dist/css/'
//     },
//     script: {
//         src: 'js/*.js',
//         dist:'dist/js/'
//     }
// }


// function compiletailwind() {
//     return src('./scss/tailwind.scss')
//     .pipe(postCss([tailwind(), prefixer()]))
//     .pipe(cssMin())
//     .pipe(rename({suffix: '.min', extname: '.css'}))
//     .pipe(dest('dist/css'))
// }

function compilecss() {
    return src(['./scss/*.scss', '!./scss/tailwind.scss'])
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
    return src(['./dist/css/*.css', '!./dist/css/*.min.css'])
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

    watch('./scss/*.scss', compilecss);
    watch('js/*.js', jsmin).on('change', browserSync.reload)
    watch('index.html').on('change', browserSync.reload)

    done();
}

function watchTask(done) {
    // watch('scss/tailwind.scss', compiletailwind)
    watch(['./scss/*.scss', '!./scss/tailwind.scss'], series(compilecss, cssmin))
    watch('js/*.js', jsmin)

    done();
}

exports.default = series(
    clean,
    // compiletailwind,
    compilecss,
    cssmin,
    jsmin,
    parallel(watchTask, live)
)
