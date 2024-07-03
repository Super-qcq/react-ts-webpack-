// var baseConfigs = require('./configs')
// var gulp = require('gulp')
// var uglify = require('gulp-uglify-es').default
// var cleanCSS = require('gulp-clean-css')
// var concat = require('gulp-concat')
// var source = require('vinyl-source-stream')
// var less = require('gulp-less')
// var plumber = require('gulp-plumber')
// var _ = require('lodash')
// var browserify = require('browserify')
// var del = require('del')
// var path = require('path')
// var sourcemaps = require('gulp-sourcemaps')
// var buffer = require('vinyl-buffer')
// var through = require('through2')
// var tsify = require('tsify')
// var gutil = require('gulp-util')
// var gulpif = require('gulp-if')
// var async = require('async')
// var moment = require('moment')
// const spawn = require('child_process').spawnSync

// process['env']['NODE_ENV'] = 'production'
// function current() {
// 	return moment().format('HH:mm:ss')
// }

// function ModuleService() {
// 	this.dev = false
// 	this.data = null
// 	this.module = null
// }
// ModuleService.prototype = {
// 	getModuleName: function() {
// 		return this.module.name
// 	},
// 	getCleanConfigs: function() {
// 		return this.data.clean ? this.data.clean : []
// 	},
// 	getLessConfigs: function() {
// 		return this.data.less ? this.data.less : []
// 	},
// 	getEs5Configs: function() {
// 		return this.data.es5 ? this.data.es5 : []
// 	},
// 	getEs6Configs: function() {
// 		return this.data.es6 ? this.data.es6 : []
// 	},
// 	getTsConfigs: function() {
// 		return this.data.ts ? this.data.ts : []
// 	},
// 	getCopyConfigs: function() {
// 		return this.data.copy ? this.data.copy : []
// 	},
// 	getWatchSrc: function() {
// 		return this.data.watchSrc ? this.data.watchSrc : []
// 	},
// 	setModule: function(module) {
// 		this.module = module
// 		this.data = module.data
// 	},
// 	isDev: function() {
// 		return this.dev
// 	},
// 	setDev: function(flag) {
// 		this.dev = flag
// 	}
// }
// function cleanTask(moduleService, cb) {
// 	console.log('cleanTask')
// 	const configs = moduleService.getCleanConfigs()
// 	async.eachSeries(
// 		configs,
// 		function(config, cb) {
// 			del.sync(path.join(process.cwd(), config))
// 			cb()
// 		},
// 		cb
// 	)
// }
// function lessTask(moduleService, cb) {
// 	console.log('lessTask')
// 	const configs = moduleService.getLessConfigs()
// 	async.eachSeries(
// 		configs,
// 		function(config, cb) {
// 			gulp.src(config.source)
// 				.pipe(less())
// 				.pipe(gulpif(!moduleService.isDev(), cleanCSS()))
// 				.pipe(gulp.dest(config.target))
// 				.pipe(
// 					through.obj(function(file, enc, callback) {
// 						cb()
// 					})
// 				)
// 		},
// 		cb
// 	)
// }

// function es5Task(moduleService, cb) {
// 	console.log('es5Task')
// 	const configs = moduleService.getEs5Configs()
// 	async.eachSeries(
// 		configs,
// 		function(config, cb) {
// 			gulp.src(config.source)
// 				.pipe(sourcemaps.init()) //
// 				//		.pipe(jshint()) //
// 				//		.pipe(jshint.reporter('default')) //
// 				.pipe(gulpif(!moduleService.isDev(), uglify())) //
// 				.pipe(concat(config.name)) //
// 				.pipe(gulpif(moduleService.isDev(), sourcemaps.write())) //
// 				.pipe(gulp.dest(config.target))
// 				.pipe(
// 					through.obj(function(file, enc, callback) {
// 						cb()
// 					})
// 				)
// 		},
// 		cb
// 	)
// }
// function es6Task(moduleService, cb) {
// 	console.log('es6Task')
// 	const configs = moduleService.getEs6Configs()
// 	async.eachSeries(
// 		configs,
// 		function(config, cb) {
// 			var entryJs = config.source,
// 				target = config.target,
// 				bundleName = config.name,
// 				dev = moduleService.isDev()
// 			var opts = {
// 				entries: [entryJs],
// 				debug: dev
// 			}
// 			browserify(opts)
// 				.transform('babelify', {
// 					presets: ['@babel/preset-env', '@babel/preset-react'],
// 					plugins: [
// 						[
// 							'import',
// 							{
// 								libraryName: 'antd',
// 								libraryDirectory: 'lib',
// 								style: 'css'
// 							}
// 						],
// 						['@babel/plugin-proposal-decorators', { legacy: true }],
// 						['@babel/plugin-proposal-class-properties', { loose: true }],
// 						['@babel/plugin-syntax-dynamic-import'],
// 						['@babel/plugin-transform-runtime']
// 					]
// 				})
// 				.bundle()
// 				.pipe(source(bundleName || 'bundle.js'))
// 				.pipe(buffer())
// 				.pipe(gulpif(!dev, uglify()))
// 				.pipe(gulp.dest(target))
// 				.pipe(
// 					through.obj(function(file, enc, callback) {
// 						cb()
// 					})
// 				)
// 		},
// 		cb
// 	)
// }
// function tsTask(moduleService, cb) {
// 	console.log('tsTask')
// 	const configs = moduleService.getTsConfigs()
// 	async.eachSeries(
// 		configs,
// 		function(config, cb) {
// 			var entryJs = config.source,
// 				target = config.target,
// 				bundleName = config.name,
// 				dev = moduleService.isDev()
// 			var opts = {
// 				allowJs: true,
// 				entries: [entryJs],
// 				debug: dev
// 			}
// 			browserify(opts)
// 				.plugin(tsify)
// 				.transform('babelify', {
// 					presets: ['@babel/preset-env', '@babel/preset-react'],
// 					extensions: ['.ts', '.tsx', '.js'],
// 					plugins: [
// 						[
// 							'import',
// 							{
// 								libraryName: 'antd',
// 								libraryDirectory: 'lib',
// 								style: 'css'
// 							}
// 						],
// 						['@babel/plugin-proposal-decorators', { legacy: true }],
// 						['@babel/plugin-proposal-class-properties', { loose: true }],
// 						['@babel/plugin-syntax-dynamic-import'],
// 						['@babel/plugin-transform-runtime']
// 					]
// 				})
// 				.bundle()
// 				.pipe(source(bundleName || 'bundle.js'))
// 				.pipe(buffer())
// 				.pipe(gulpif(!dev, uglify()))
// 				.on('error', function(err) {
// 					gutil.log(gutil.colors.red('[Error]'), err.toString())
// 				})
// 				.pipe(gulp.dest(target))
// 				.pipe(
// 					through.obj(function(file, enc, callback) {
// 						cb()
// 					})
// 				)
// 		},
// 		cb
// 	)
// }
// function copyTask(moduleService, cb) {
// 	console.log('copyTask')
// 	const configs = moduleService.getCopyConfigs()
// 	async.eachSeries(
// 		configs,
// 		function(config, cb) {
// 			gulp.src(config.source)
// 				.pipe(gulp.dest(config.target))
// 				.pipe(
// 					through.obj(function(file, enc, callback) {
// 						cb()
// 					})
// 				)
// 		},
// 		cb
// 	)
// }

// function webpackTask(module, mode, cb) {
// 	console.log('webpackTask')
// 	if (module.data.webpack) {
// 		spawn('npm', ['run', mode, module.name], {
// 			stdio: 'inherit'
// 		})
// 	}
// 	cb()
// }

// function getModules(moduleName) {
// 	let modules = baseConfigs.map(function(config) {
// 		return {
// 			name: config.name,
// 			data: require(path.join(process.cwd(), config.path))
// 		}
// 	})
// 	if (moduleName) {
// 		modules = modules.filter(it => it.name === moduleName)
// 	}
// 	return modules
// }

// function build(moduleName, isDev, cb) {
// 	console.log(current() + ' start build')
// 	async.eachSeries(
// 		getModules(moduleName),
// 		function(module, callback) {
// 			console.log('qcq'+current() + ' start ' + module.name)
// 			const moduleService = new ModuleService()
// 			moduleService.setModule(module)
// 			moduleService.setDev(isDev)
// 			async.waterfall(
// 				[
// 					_.partial(cleanTask, moduleService),
// 					_.partial(copyTask, moduleService),
// 					_.partial(lessTask, moduleService),
// 					_.partial(es5Task, moduleService),
// 					_.partial(es6Task, moduleService),
// 					_.partial(tsTask, moduleService),
// 					_.partial(webpackTask, module, isDev ? 'build' : 'release')
// 				],
// 				function(err, result) {
// 					console.log(current() + ' finish build ' + module.name)
// 					callback()
// 				}
// 			)
// 		},
// 		function(err, result) {
// 			console.log(current() + ' finish build')
// 			cb()
// 		}
// 	)
// }

// function autoBuild(moduleName, cb) {
// 	var modules = getModules(moduleName)
// 	async.eachSeries(modules, function(module, cb) {
// 		const moduleService = new ModuleService()
// 		moduleService.setModule(module)
// 		let isRunning = false
// 		let autoRun = false
// 		var buildImpl = _.wrap(build, function(build) {
// 			if (isRunning) {
// 				console.log('autoBuild is running and will start latter')
// 				autoRun = true
// 				return
// 			}
// 			console.log('start autoBuild')
// 			isRunning = true
// 			build(moduleService.getModuleName(), true, function() {
// 				console.log('finish autoBuild')
// 				isRunning = false
// 				if (autoRun) {
// 					autoRun = false
// 					buildImpl()
// 				}
// 			})
// 		})
// 		gulp.watch(moduleService.getWatchSrc(), _.throttle(buildImpl, 2000))
// 		buildImpl()
// 	})
// }
// function clean(moduleName, cb) {
// 	console.log('start clean')
// 	async.eachSeries(
// 		getModules(moduleName),
// 		function(module, callback) {
// 			const moduleService = new ModuleService()
// 			moduleService.setModule(module)
// 			async.waterfall([_.partial(cleanTask, moduleService)], function(err, result) {
// 				console.log('finish  ' + module.name)
// 				callback()
// 			})
// 		},
// 		function(err, result) {
// 			console.log('finish clean')
// 			cb()
// 		}
// 	)
// }
// const arale = {
// 	clean: _.partialRight(clean, _.noop),
// 	release: _.partialRight(build, false, _.noop),
// 	build: _.partialRight(build, true, _.noop),
// 	autoBuild: _.partialRight(autoBuild, _.noop)
// }

// module.exports = arale
