'use strict'

import { src, dest, parallel } from 'gulp'
import autoprefixer from 'gulp-autoprefixer'
import sourcemaps from 'gulp-sourcemaps'
import minifyCSS from 'gulp-csso'
import run from 'gulp-run'

const dirs = {
    src: 'src',
    dest: 'dist'
}

const paths = {
    src: `${dirs.src}/styles/*.css`,
    dest: `${dirs.dest}/styles/`
}

const styles = () => {
    return src(paths.src)
        .pipe(sourcemaps.init())
        .pipe(autoprefixer())
        .pipe(minifyCSS())
        .pipe(sourcemaps.write('.'))
        .pipe(dest(paths.dest))
}

const generate = () => run('npx eleventy').exec()
const clean = () => run(`rm -rf ${paths.dest}`).exec()

export {
    styles,
    generate,
    clean,
}

export default parallel(styles)



