// paquets
const gulp = require('gulp')
const autoprefixer = require('gulp-autoprefixer')
const babel= require('gulp-babel')
const sass = require('gulp-sass')
const concat = require('gulp-concat')
const livereload = require('gulp-livereload')
const rename = require('gulp-rename')




// variables
const path = {
    from:{
        styles: 'dev/www/sass/',
        js: 'dev/www/es6/',
        lib: 'dev/www/libs/'
    },
    to:{
        styles: "www/assets/stylesheets/",
        js: 'www/assets/scripts/',
        lib: 'www/assets/scripts/'
    }
}




// taches
gulp.task('stylesheet',  () =>
    gulp.src(path.from.styles + '*.sass')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 10 versions', '> 1%', 'Explorer 9'],
            cascade: false
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(path.to.styles))
        .pipe(livereload())
)

gulp.task('script', () =>
    gulp.src(path.from.js + '*.js')
        .pipe(babel({presets: ['es2015']}))
        .on('error', showError)
        .pipe(concat('main.js'))
        .on('error', showError)
        .pipe(gulp.dest(path.to.js))
        .pipe(livereload())
)


gulp.task('lib', function () {
    return gulp.src( path.from.lib + '*.js')
        .pipe(babel())
        .on('error', showError)
        .pipe(concat('lib.js'))
        .on('error', showError)
        .pipe(gulp.dest(path.to.lib))
        .pipe(livereload())
})

gulp.task('watch', () => {
    livereload.listen()
    gulp.watch(path.from.styles + '*.sass', ['stylesheet'])
    gulp.watch(path.from.js + '*.js', ['script'])
    gulp.watch(path.from.lib + '*.js', ['lib'])
})

gulp.task('default', ['stylesheet','script', 'lib'])



// gestion des erreurs gulp
// afficher et ne pas l'arrêter
function showError (error) {
    console.log(error.toString())
    this.emit('end')
}