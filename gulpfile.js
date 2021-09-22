const {src, dest, parallel, series, watch} = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const uglifyEs = require('gulp-uglify-es').default;
const del = require('del');
const browserSync = require('browser-sync').create();
const less = require('gulp-less');
const svgSprite = require('gulp-svg-sprite');
const fileInclude = require('gulp-file-include');
const sourcemaps = require('gulp-sourcemaps');
const rev = require('gulp-rev');
const revRewrite = require('gulp-rev-rewrite');
const revDel = require('gulp-rev-delete-original');
const htmlmin = require('gulp-htmlmin');
const gulpif = require('gulp-if');
const notify = require('gulp-notify');
/* const image = require('gulp-image'); */
const { readFileSync } = require('fs');
const tiny = require('gulp-tinypng-compress');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const gulpStylelint = require('gulp-stylelint');
const htmlValidator = require('gulp-w3c-html-validator');

let isProd = false; // dev by default

const clean = () => {
    return del(['docs/*'])
}

//svg sprite
const svgSprites = () => {
    return src('./src/img/svg/**.svg')
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: "../sprite.svg" //sprite file name
                }
            },
        }))
        .pipe(dest('./docs/img'));
}

const styles = () => {
    src('./src/less/vendor/**')
        .pipe(concat('vendor.css'))
        .pipe(gulpif(isProd, cleanCSS({ level: 2 })))
        .pipe(dest('./docs/css/'))
    return src('./src/less/style.less')
        .pipe(gulpif(!isProd, sourcemaps.init()))
        .pipe(less({
            relativeUrls: true,
        }).on("error", notify.onError()))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 2 versions'],
            cascade: false,
        }))
        .pipe(gulpif(isProd, cleanCSS({ level: 2 })))
        .pipe(gulpif(!isProd, sourcemaps.write('.')))
        .pipe(dest('./docs/css/'))
        .pipe(browserSync.stream());
};

const lintStyles = () => {
    return src('./src/less/**/*.less')
        .pipe(gulpStylelint({
            failAfterError: false,
            reporters: [
                {
                    formatter: 'string',
                    console: true
                }
            ]
        }))
}

const scripts = () => {
    src('./src/js/vendor/**.js')
    .pipe(webpackStream({
        mode: 'development',
        output: {
            filename: 'vendor.js',
        },
        module: {
            rules: [{
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                }
            }]
        },
    }))
    .on('error', function (err) {
        console.error('WEBPACK ERROR', err);
        this.emit('end'); // Don't stop the rest of the task
    })
        .pipe(concat('vendor.js'))
        .pipe(gulpif(isProd, uglifyEs().on("error", notify.onError())))
        .pipe(dest('./docs/js/'))
    return src(
        ['./src/js/**.js',
        './src/js/js-components/**.js'])

        .pipe(webpackStream({
			mode: 'development',
			output: {
				filename: 'main.js',
			},
			module: {
				rules: [{
					test: /\.m?js$/,
                    exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
					}
				}]
			},
		}))
		.on('error', function (err) {
			console.error('WEBPACK ERROR', err);
			this.emit('end'); // Don't stop the rest of the task
		})

        .pipe(gulpif(!isProd, sourcemaps.init()))
        .pipe(concat('main.js'))
        .pipe(gulpif(isProd, uglifyEs().on("error", notify.onError())))
        .pipe(gulpif(!isProd, sourcemaps.write('.')))
        .pipe(dest('./docs/js'))
        .pipe(browserSync.stream());
}

const resources = () => {
    return src('./src/resources/**')
        .pipe(dest('./docs'))
}

const fonts = () => {
    return src('./src/fonts/**')
        .pipe(dest('./docs/fonts'))
}

const images = () => {
    return src([
        './src/img/**.jpg',
        './src/img/**.png',
        './src/img/**.jpeg',
        './src/img/*.svg',
        './src/img/**/*.jpg',
        './src/img/**/*.png',
        './src/img/**/*.jpeg'
        ])
        /* .pipe(gulpif(isProd, image())) */
        .pipe(dest('./docs/img'))
};

const tinypng = () => {
	return src(['./src/img/**.jpg', './src/img/**.png', './src/img/**.jpeg', './src/img/**/*.jpg', './src/img/**/*.png'])
		.pipe(tiny({
			key: '0jkY4p7Hcw41s0rB782d0HGvsjr5t3K9',
			log: true
		}))
		.pipe(dest('./docs/img'))
}

const htmlInclude = () => {
    return src(['./src/*.html'])
        .pipe(fileInclude({
            prefix: '@',
            basepath: '@file'
        }))
        .pipe(dest('./docs'))
        .pipe(browserSync.stream());
}

const w3cHtmlValidator = () => {
    return src(['./docs/index.html'])
        .pipe(htmlValidator()) 
        .pipe(htmlValidator.reporter({
            throwErrors: false
        }))
        .pipe(dest('./docs'))
        .pipe(browserSync.stream());
}

const watchFiles = () => {
    browserSync.init({
        server: {
            baseDir: "./docs"
        },
    });

    watch('./src/less/**/*.less', lintStyles);
    watch('./src/less/**/*.less', styles);
    watch('./src/js/**/*.js', scripts);
    watch('./src/html-partials/*.html', htmlInclude);
    watch('./src/*.html', htmlInclude);
    watch('./src/resources/**', resources);
    watch('./src/img/*.{jpg,jpeg,png,svg}', images);
    watch('./src/img/svg/**.svg', svgSprites);
}

const cache = () => {
    return src('docs/**/*.{css,js,svg,png,jpg,jpeg,woff2,woff}', {
        base: 'docs'})
        .pipe(rev())
        .pipe(dest('docs'))
        .pipe(revDel())
        .pipe(rev.manifest('rev.json'))
        .pipe(dest('docs'));
};

const rewrite = () => {
    const manifest = readFileSync('docs/rev.json');

    return src('docs/**/*.html')
        .pipe(revRewrite({
            manifest
        }))
        .pipe(dest('docs'));
}

const htmlMinify = () => {
    return src('docs/**/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(dest('docs'));
}

const toProd = (done) => {
    isProd = true;
    done();
};

exports.default = series(clean, htmlInclude, scripts, lintStyles, styles, fonts, resources, images, svgSprites, watchFiles);

exports.build = series(toProd, fonts, clean, htmlInclude, scripts, styles, fonts, resources, images, svgSprites, htmlMinify, tinypng);

exports.w3c = series(w3cHtmlValidator);

exports.cache = series(cache, rewrite);