'use strict'
require('dotenv').config()

import gulp from 'gulp'
import autoprefixer from 'gulp-autoprefixer'
import minifyCSS from 'gulp-csso'
import minifyHTML from 'gulp-htmlmin'
import inlineSource from 'gulp-inline-source'
import run from 'gulp-run'
import browserSync from 'browser-sync'

const paths = {
    src: 'src',
    dest: 'dist',
}

paths.styles = {
    src: `${paths.src}/styles/*.css`,
    dest: `${paths.dest}/styles/`,
}

paths.html = {
    src: `${paths.dest}/**/*.html`,
}

paths.generate = {
    src: [`${paths.src}/**/*.njk`, `${paths.src}/**/*.md`],
}

/* Eleventy generator: see .eleventy.js for config */
const generate = () => run('npx eleventy').exec()

/* Parralel assets pipelines */
const styles = () => {
    return gulp.src(paths.styles.src, { sourcemaps: true })
        .pipe(autoprefixer())
        .pipe(minifyCSS())
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browserSync.stream())
}
const html = () => {
    return gulp.src(paths.html.src)
        .pipe(minifyHTML({ collapseWhitespace: true }))
        .pipe(gulp.dest(file => file._base)) // minify eleventy output in place
}
const assets = gulp.parallel(styles, html)

/* Critical css inlining */
const inline = () => {
    return gulp.src(paths.html.src)
        .pipe(inlineSource({
            rootpath: paths.dest
        }))
        .pipe(gulp.dest(file => file._base)) // minify eleventy output in place
}

/* Dev Server settings */
const serve = done => {
    browserSync.init({
        notify: false,
        reloadDebounce: 2000,
        ui: false,
        ghostMode: false,
        browser: process.env.BROWSER || 'default',
        server: {
            baseDir: paths.dest,
        }
    })
    done()
}
const reload = done => {
    browserSync.reload()
    done()
}

const clean = () => run(`rm -rf ${paths.dest}`).exec()
const build = gulp.series(clean, generate, assets, inline)
const watch = () => {
    gulp.watch(paths.styles.src, styles)
    gulp.watch(paths.generate.src, gulp.series(generate, reload))
}
const develop = gulp.series(clean, gulp.parallel(generate, styles), serve, watch)

export default build
export { clean, develop }