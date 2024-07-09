// 引入Node.js的path模块，用于处理文件和目录的路径  
const path = require('path')

// 引入项目的baseConfigs配置，通常这些配置定义了项目的模块信息  
const baseConfigs = require('./build/configs')

// 引入HtmlWebpackPlugin，用于简化HTML文件的创建，以便为你的webpack包提供服务  
const HtmlWebpackPlugin = require('html-webpack-plugin')

// 引入MiniCssExtractPlugin，用于将CSS提取到单独的文件中  
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

// 引入TerserPlugin，用于压缩JavaScript  
const TerserPlugin = require('terser-webpack-plugin')

// 引入CopyWebpackPlugin，用于将单个文件或整个目录复制到构建目录中  
const CopyWebpackPlugin = require('copy-webpack-plugin')


// 引入lodash库，提供了一套丰富的工具函数  
const _ = require('lodash')
// 引入CleanWebpackPlugin，用于在webpack构建之前清理/dist文件夹  
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

// 通过yargs库获取webpack命令的参数，这里用于区分开发模式和生产模式  
const argv = require('yargs').argv


let mode = (argv.mode == 'development' ? 'development' : 'production')

// 从命令行参数中获取模块名，这里的获取方式可能不够健壮，需要进一步改进  
let moduleName = process.argv[6]

// start获取模块名和设置模式
if (process.argv[2] == 'serve') {
    moduleName = process.argv[4]
    mode = 'development'
}
// 定义一个函数，根据模块名获取对应的配置模块信息  
function getModules(moduleName) {
    let modules = baseConfigs.map(function (config) {
        return {
            name: config.name,
            data: require(path.join(__dirname, config.path))
        }
    })
    if (moduleName) {
        modules = modules.filter(it => it.name === moduleName)
    }
    return modules
}

// 调用getModules函数获取模块配置  
const moduleConfig = getModules(moduleName)
if (!moduleConfig || moduleConfig.length < 1) {
    console.error('模块名称有误或未找到模块内配置文件！')
    process.exit(1);
}

// 初始化entry和plugins数组  
const entrys = {},
    plugins = []

// 遍历模块配置，为每个模块设置webpack的入口和插件  
moduleConfig.forEach(m => {
    const webpackTask = m.data.webpack
    const cleans = m.data.clean
    console.log(m)
    // 缓存需要打包在一个html文件中的js配置  
    const htmlPlugins = {}
    if (webpackTask) {
        webpackTask.forEach(config => {
            // 设置webpack的入口   src/home/html/index.tsx
            entrys[config.name] = path.join(__dirname, config.source[0])
            // 生成htmlKey，用于区分不同的HTML模板  
            // source: [ 'src/home/html/index.tsx' ],
            // target: 'dist/home',
            // name: 'home',
            // htmlPath: 'src/home/html/',
            // htmlName: 'index',
            // htmlType: 'html'
            const htmlKey = config.htmlPath + config.htmlName + '.' + config.htmlType
            // 如果已存在相同的htmlKey，则将当前js添加到chunks数组中  
            if (htmlPlugins[htmlKey]) {
                htmlPlugins[htmlKey].chunks.push(config.name)
            } else {
                // 否则，初始化htmlPlugins(生成 HTML 文件的插件.生成的index.html文件将会以script标签的形式引入每一个输出js文件（通过output.filename选项配置）)对象  
                htmlPlugins[htmlKey] = {
                    // 以原html文件为模板的文件路径
                    template: config.htmlPath + config.htmlName + '.' + config.htmlType,
                    // 
                    filename: `${m.name}/${config.targetName || config.htmlName}.${config.htmlType}`,
                    chunks: [config.name]
                }
            }
            // 添加MiniCssExtractPlugin插件到plugins数组  
            plugins.push(
                new MiniCssExtractPlugin({
                    filename: `${m.name}/css/[name].[chunkhash].css`,
                    //控制从打包后的非入口JS文件中提取CSS样式生成的CSS文件的名称
                    chunkFilename: `${m.name}/css/[name].[id].[chunkhash].css`,
                    // 控制css的引入顺序不一致是否警告，true表示警告，false表示不警告 这个选项会忽略CSS文件中导入（@import）的顺序
                    ignoreOrder: true
                }),


            )

        })

        // 遍历htmlPlugins，为每个html模板添加HtmlWebpackPlugin插件  
        for (let key in htmlPlugins) {
            plugins.push(
                new HtmlWebpackPlugin({
                    template: htmlPlugins[key].template,
                    filename: htmlPlugins[key].filename,
                    chunks: htmlPlugins[key].chunks,
                    // 这里设置minify为false，表示不压缩HTML文件，也可以根据需要启用压缩  
                    minify: false,
                }),
            )
        }

        // 处理静态文件复制  
        if (Array.isArray(m.data.staticFrom) && m.data.staticFrom.length > 0) {
            const patterns = m.data.staticFrom.map(staticFromPath => {
                // 将 from 路径转换为绝对路径（可选，但符合你的要求）  
                const absoluteFromPath = path.resolve(__dirname, staticFromPath);

                // 动态生成 to 路径，这里假设它位于 dist 目录下，与模块名相同的子目录中  
                const staticTargetPath = path.resolve(__dirname, `dist/${m.name}/${path.basename(staticFromPath)}`);

                // 注意：这里我保留了 absoluteFromPath，但你也可以直接使用 staticFromPath（如果它是相对路径，Webpack 会处理它）  
                // 返回 patterns 数组中的一个对象  
                return {
                    from: absoluteFromPath, // 使用绝对路径（或保留为 staticFromPath）  
                    to: staticTargetPath,
                    // 这里可以添加其他 CopyWebpackPlugin 的 options，比如 globOptions  
                };
            });
            // 将 CopyWebpackPlugin 实例添加到 plugins 数组中，只添加一次  
            plugins.push(
                new CopyWebpackPlugin({ patterns })
            );
        }
    }

    // 用于存储所有需要清理的绝对路径  
    const cleanPaths = [];
    // 如果当前模块有清除路径配置  
    if (cleans && cleans.length > 0) {
        cleans.forEach(cleanPath => {
            // 使用path.resolve将相对路径转换为绝对路径  
            const absoluteCleanPath = path.resolve(__dirname, cleanPath);
            // 将绝对路径添加到清理路径数组中  
            cleanPaths.push(absoluteCleanPath);
        });
    }
    // 如果存在需要清理的路径，则添加CleanWebpackPlugin实例   只是打包情况下清除原文件夹
    if (cleanPaths.length > 0 && process.argv[2] !== 'serve') {
        console.log('清除的模块路径为' + cleanPaths)
        plugins.push(new CleanWebpackPlugin({
            // 使用cleanPaths数组作为需要清理的路径  
            cleanOnceBeforeBuildPatterns: cleanPaths,
            verbose: true // 打印日志  
        }));
    }

})

// 导出webpack配置对象  
module.exports = {
    mode: mode, // 设置模式为开发或生产  
    entry: entrys, // 设置入口文件  
    output: {
        // 是一个用于跨平台路径拼接的方法，确保无论你的代码在Windows、Linux还是macOS上运行，都能得到正确的路径格式。这里它被用来拼接模块名称(moduleName)和动态生成的文件名([name].[chunkhash].js)
        filename: path.posix.join(`${moduleName}`, 'js/[name].[chunkhash].js'), // 输出文件名  
        chunkFilename: path.posix.join(`${moduleName}`, 'js/[name].[id].[chunkhash].js'), // 非入口(non-entry) chunk 文件的名称   
        path: path.resolve(__dirname, `./dist`), // 输出目录的绝对路径   __dirname指的是当前文件的路径
        // 当打开dev server和打包时 在html将引入js css文件路径出错时的修改
        // publicPath: `${process.argv[2] == 'serve' ? '/' : '../'}`,

    },
    module: {
        rules: [
            // 处理ts、tsx、js、jsx文件  
            {
                test: /\.(ts|tsx|js|jsx)?$/,
                include: [path.join(__dirname, 'src')], // 只处理src目录下的文件  
                use: [
                    // 使用thread-loader开启多线程构建，可以加快构建速度  位于其他loader之前
                    {
                        loader: 'thread-loader',
                        options: {
                            workers: 4 // 开启4个worker进程  
                        }
                    },
                    // 使用babel-loader处理JSX和ES6+语法  
                    // loader: 指定使用的loader是babel-loader。
                    // options: 包含了一系列配置选项，用于指导babel-loader如何处理文件。
                    // babelrc: 设置为false，表示不使用项目根目录下的.babelrc文件。这意味着babel-loader的配置将完全由这个Webpack配置对象控制，而不是由.babelrc文件控制。
                    // presets: 指定了一系列预设（presets），它们是Babel的插件集合，用于指导Babel如何转译代码。这里指定了三个预设：
                    // @babel/preset-env：一个智能预设，它可以根据你支持的环境自动启用各种转换和polyfills。
                    // @babel/preset-typescript：用于转译TypeScript代码。
                    // @babel/preset-react：用于转译React的JSX。
                    // cacheDirectory: 设置为true，表示启用缓存。这可以加快重新构建的速度，因为Babel可以将转译结果缓存到硬盘上。
                    // plugins: 指定了一系列插件（plugins），用于进一步增强Babel的转译能力。这里指定了五个插件：
                    // ['import', { libraryName: 'antd', libraryDirectory: 'lib', style: 'css' }]：用于实现antd样式的按需加载。
                    // ['@babel/plugin-proposal-decorators', { legacy: true }]：用于支持装饰器语法。
                    // ['@babel/plugin-proposal-class-properties', { loose: false }]：用于支持类属性语法。
                    // ['@babel/plugin-syntax-dynamic-import']：用于支持动态导入语法。
                    // ['@babel/plugin-transform-runtime']：用于支持运行时转换，这可以帮助你减小编译后的代码体积。
                    // 总的来说，这段代码是一个详细的配置，用于指导Webpack的babel-loader如何处理JavaScript文件，包括使用哪些预设和插件，以及是否启用缓存等。
                    {
                        loader: 'babel-loader',
                        options: {
                            babelrc: false, // 不使用项目根目录下的.babelrc文件  
                            presets: ['@babel/preset-env', '@babel/preset-typescript', '@babel/preset-react'], // 预设配置  
                            cacheDirectory: true, // 启用缓存，加快重新构建速度  
                            plugins: [
                                // antd样式按需加载  
                                ['import', { libraryName: 'antd', libraryDirectory: 'lib' }],
                                // 装饰器语法支持  
                                ['@babel/plugin-proposal-decorators', { legacy: true }],
                                // 类属性语法支持  
                                ['@babel/plugin-proposal-class-properties', { loose: false }],
                                // 动态导入语法支持  
                                ['@babel/plugin-syntax-dynamic-import'],
                                // 运行时转换支持  
                                ['@babel/plugin-transform-runtime'],
                            ]
                        }
                    }
                ],
                exclude: /node_modules/ // 排除node_modules目录  
            },
            // 处理css文件  
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'] // 使用MiniCssExtractPlugin提取CSS到单独文件，并使用css-loader处理CSS  
            },
            // 处理less文件  
            {
                test: /\.less$/,
                use: [
                    MiniCssExtractPlugin.loader, // 提取CSS到单独文件  
                    'css-loader', // 处理CSS文件  
                    'less-loader' // 处理LESS文件  
                ]
            },
            // 处理图片文件  
            {
                test: /\.(png|svg|jpe?g|gif)(\?.*)?$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10000, // 文件大小小于10kb时，将转化为base64编码  
                            name: path.posix.join(`${moduleName}/imgs/`, `[name].[hash:7].[ext]`) // 输出文件的名称  
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'], // 自动解析确定的扩展  
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                // cache: true, // 启用文件缓存  
                parallel: true, // 并行运行以提高构建速度  
                terserOptions: {
                    sourceMap: false,
                    output: {
                        // 是否输出可读性较强的代码，即会保留空格和制表符，默认为输出，为了达到更好的压缩效果，可以设置为false
                        beautify: false,
                        // 是否保留代码中的注释，默认为保留，为了达到更好的压缩效果，可以设置为false
                        comments: false
                    },
                    compress: {
                        // 是否在UglifyJS删除没有用到的代码时输出警告信息，默认为输出，可以设置为false关闭这些作用不大的警告
                        warnings: false,
                        // 是否删除代码中所有的console语句，默认为不删除，开启后，会删除所有的console语句
                        drop_console: true,
                        drop_debugger: true,
                        // 是否内嵌虽然已经定义了，但是只用到一次的变量，比如将 var x = 1; y = x, 转换成 y = 5, 默认为不转换，为了达到更好的压缩效果，可以设置为false
                        collapse_vars: true,
                        // 是否提取出现了多次但是没有定义成变量去引用的静态值，比如将 x = 'xxx'; y = 'xxx'  转换成var a = 'xxxx'; x = a; y = a; 默认为不转换，为了达到更好的压缩效果，可以设置为false
                        reduce_vars: true,
                        pure_funcs: ['console.log'] // 移除console
                    }
                }
            })
        ],
        // 代码分割配置  
        splitChunks: {
            chunks: 'all', // 包括异步和同步代码块  
            cacheGroups: {
                vendors: { // 将node_modules中的代码打包到一起  
                    test: /[\\/]node_modules[\\/]/,
                    chunks: "all",
                    priority: 10, // 优先级  
                    enforce: true // 强制打包到一起  
                }
            }
        }
    },
    externals: {
        // 这里定义了外部依赖，即告诉webpack在打包时忽略这些依赖，因为它们将在运行时从外部获取  
        // react: 'react',  
        // reactDom: 'react-dom',  
        // 其他依赖...  
    },
    // 我们在打包完文件之后运行项目文件，此时如果存在错误（比如在源文件 main.js 出现了一个错误），那么它只会跟踪到打包完的 bundle.js 上，对于我们找说，如此跟踪错误来源毫无帮助。因此我们可以使用 JavaScript 自带的 source map 功能帮助我们追踪错误的位置
    // eval-cheap-module-source-map 控制台源代码只显示tsx代码部分 适合大项目，inline-source-map会显示tsx、html、less等所有文件 适合小项目
    devtool: mode == 'development' ? 'eval-cheap-module-source-map' : false, // 开发模式下生成source map，生产模式下不生成  
    plugins: plugins, // 插件列表  
    // npm run start的配置
    devServer: {
        port: 8080,
        historyApiFallback: true, //配置项是必需的，它确保当浏览器访问一个不存在的路由时，webpack-dev-server 会返回 index.html 文件，而不是显示 404 错误页面
        hot: true,
        // 以下内容为配置代理所需，由于不是create-react-app脚手架而不能在项目中进行配置代理，为了开发环境测试时的跨域问题解决，只能在这个服务器中配置  
        proxy: [
            {
                context: ['/dev'], // 可选，定义需要代理的上下文（路径）  
                target: 'http://sph-h5-api.atguigu.cn', // 目标服务器地址  
                changeOrigin: true, // 是否改变源，对于域名请求通常需要设置为 true  
                pathRewrite: { '^/dev': '' }, // 路径重写，去除前缀  
                // 其他代理选项...  
                // 注意：如果你只代理一个上下文，这里的 context 可以省略，但保持为数组格式  
            },
            // 如果有更多的代理规则，继续在这里添加对象  
        ],
    },
    performance: {
        hints: false, // 禁用性能提示  
        maxEntrypointSize: 512000, // 设置入口点的最大体积（以字节为单位）  
        maxAssetSize: 512000, // 设置任何单个资产的最大体积  
    },

    cache: {
        type: 'filesystem', // 使用文件系统缓存  
    },

}