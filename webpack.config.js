// 引入 Node.js 内置的 path 模块，用于处理绝对路径和相对路径拼接
const path = require('path')
// 引入 webpack 核心模块，用于获取内部插件（如热更新等）
const webpack = require('webpack');
// 🌟 引入你的“总管家”模块注册表，所有的多页面入口都在这里登记
const baseConfigs = require('./build/configs')
// 引入 HTML 生成插件，用于自动根据模板生成 HTML，并自动注入打包好的 JS 和 CSS
const HtmlWebpackPlugin = require('html-webpack-plugin')
// 引入 CSS 抽离插件，用于在生产环境中将 CSS 从 JS 中剥离出来，生成独立的 .css 文件
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// 引入代码压缩插件，用于生产环境的 JS 压缩、混淆、去除 console 等
const TerserPlugin = require('terser-webpack-plugin')
// 引入静态资源拷贝插件，用于将不需要 webpack 编译的文件（如原封不动的图片/音频）直接拷贝到打包目录
const CopyWebpackPlugin = require('copy-webpack-plugin')

// 导出一个函数，接收环境变量 env 和命令行参数 argv
module.exports = (env, argv) => {
    // 防弹设计：确保 env 是一个对象，防止未传 --env 时报错
    const safeEnv = (env && typeof env === 'object') ? env : {};
    // 获取当前的模式（development 开发模式 或 production 生产模式）
    const mode = argv.mode || 'development';
    // 定义一个布尔值，方便后续判断是否为开发环境
    const isDev = mode === 'development';

    // 🌟 兼容多种传参方式的核心神仙代码！
    // 寻找命令行参数中以 'module=' 开头的参数（解决终端吞横线的问题）
    const cliModuleArg = process.argv.find(arg => arg.startsWith('module='));
    // 截取 'module=' 后面的真实模块名
    const cliModuleName = cliModuleArg ? cliModuleArg.split('=').slice(1).join('=') : '';
    // 按优先级获取最终的模块名：1. --env module=xxx 2. npm 的 config 3. 直接追加的 module=xxx
    const targetModuleName = safeEnv.module || process.env.npm_config_module || cliModuleName;

    // 遍历注册表，将相对路径转化为绝对路径，并 required 加载进来
    let moduleConfig = baseConfigs.map(config => ({
        name: config.name,
        data: require(path.join(__dirname, config.path))
    }));

    // 如果终端传了具体模块名，就过滤出这个模块的数据；如果不传（如 build:all），则保留全部
    if (targetModuleName) {
        moduleConfig = moduleConfig.filter(it => it.name === targetModuleName);
        // 如果名字拼写错了或者没注册，直接报错并停止运行
        if (moduleConfig.length === 0) {
            console.error(`模块名称有误或未找到 [${targetModuleName}] 的配置文件！`);
            process.exit(1);
        }
    }

    // 初始化最终传给 webpack 的入口对象和插件数组
    const entrys = {};
    const plugins = [];

    // 遍历筛选后的模块配置，组装 entry 和 plugins
    moduleConfig.forEach(m => {
        const webpackTask = m.data.webpack;
        // 临时存储 HTML 配置，用于处理多 JS 文件打入同一个 HTML 的情况
        const htmlPlugins = {};

        if (webpackTask) {
            webpackTask.forEach(config => {
                // 安全校验：确保 config.js 里的 source 字段写对了
                if (!Array.isArray(config.source) || !config.source[0]) {
                    throw new Error(`模块 [${m.name}] 的入口配置无效，请检查 source 字段`);
                }
                // 组装 entry 对象，例如 { 'main': 'C:/.../src/home/index.tsx' }
                entrys[config.name] = path.join(__dirname, config.source[0]);

                // 生成一个唯一的 HTML Key，用于合并同属一个 HTML 的不同 chunk
                const htmlKey = config.htmlPath + config.htmlName + '.' + config.htmlType;
                if (htmlPlugins[htmlKey]) {
                    htmlPlugins[htmlKey].chunks.push(config.name);
                } else {
                    htmlPlugins[htmlKey] = {
                        // HTML 模板所在的绝对路径
                        template: config.htmlPath + config.htmlName + '.' + config.htmlType,
                        // 打包后生成的 HTML 文件名
                        filename: `${config.targetName || config.htmlName}.${config.htmlType}`,
                        // 这个 HTML 需要引入哪些 JS 模块
                        chunks: [config.name]
                    };
                }

                // 添加 CSS 提取插件，[name]对应入口名，[chunkhash:8]生成8位哈希防缓存
                plugins.push(new MiniCssExtractPlugin({
                    filename: `css/[name].[chunkhash:8].css`,
                    chunkFilename: `css/[name].[id].[chunkhash:8].css`,
                    ignoreOrder: true // 忽略 CSS 引入顺序不一致的警告
                }));
            });

            // 遍历组装好的 HTML 数据，实例化 HtmlWebpackPlugin 生成真正的 HTML 文件
            for (let key in htmlPlugins) {
                plugins.push(new HtmlWebpackPlugin({
                    template: htmlPlugins[key].template,
                    filename: htmlPlugins[key].filename,
                    chunks: htmlPlugins[key].chunks,
                    minify: !isDev, // 生产环境开启 HTML 压缩（去除空格、换行等）
                }));
            }

            // 如果模块配置了 staticFrom (纯静态文件拷贝)，则实例化 CopyWebpackPlugin
            if (Array.isArray(m.data.staticFrom) && m.data.staticFrom.length > 0) {
                const patterns = m.data.staticFrom.map(staticFromPath => ({
                    from: path.resolve(__dirname, staticFromPath), // 来源绝对路径
                    to: path.resolve(__dirname, `dist/${m.name}/${path.basename(staticFromPath)}`) // 目标绝对路径
                }));
                plugins.push(new CopyWebpackPlugin({ patterns }));
            }
        }
    });

    // 最终返回给 Webpack 的核心配置对象
    return {
        mode, // 告知 webpack 使用相应模式的内置优化
        entry: entrys, // 多入口配置
        output: {
            filename: 'js/[name].[chunkhash:8].js', // 入口文件的输出命名规则
            chunkFilename: 'js/[name].[id].[chunkhash:8].js', // 非入口（如动态 import 拆分出）的 chunk 命名规则
            // 🌟 动态计算输出路径：如果是单模块打包，就放在 dist/模块名 下；如果是全量，放在 dist/all 下
            path: path.resolve(__dirname, `./dist/${targetModuleName || 'all'}`),
            clean: true, // 🌟 Webpack 5 原生清除目录机制，每次打包前自动清空 path 目录
        },
        module: {
            rules: [
                // 1. 处理 JS/TS/JSX/TSX 核心逻辑
                {
                    test: /\.(ts|tsx|js|jsx)$/,
                    include: path.resolve(__dirname, 'src'), // 只编译 src 目录，大幅提升速度
                    use: [
                        { loader: 'thread-loader', options: { workers: 4 } }, // 开启 4 个线程多进程加速编译
                        {
                            loader: 'babel-loader', // 使用 Babel 将 ES6+ 和 TS 转换为浏览器能懂的 JS
                            options: {
                                babelrc: false, // 不读取外部的 .babelrc 配置文件，以这里的配置为准
                                presets: [
                                    '@babel/preset-env', // 智能转换现代 JS 语法
                                    '@babel/preset-typescript', // 剥离 TS 类型注解
                                    ['@babel/preset-react', { runtime: 'automatic' }] // 🌟 适配 React 19+ 新 JSX 转换，无需手动 import React
                                ],
                                cacheDirectory: true, // 开启编译缓存，二次启动速度起飞
                                plugins: [
                                    // 开启对类装饰器（如 MobX）的支持
                                    ['@babel/plugin-proposal-decorators', { legacy: true }],
                                    // 开启对类属性语法的支持
                                    ['@babel/plugin-transform-class-properties', { loose: false }],
                                    '@babel/plugin-syntax-dynamic-import', // 支持 import() 动态导入语法
                                    '@babel/plugin-transform-runtime' // 提取公共的 Babel 辅助函数，减小打包体积
                                ]
                            }
                        }
                    ],
                    exclude: /node_modules/ // 绝对不编译第三方依赖库
                },
                // 2. 处理样式文件 (CSS/LESS)
                {
                    test: /\.(css|less)$/,
                    use: [
                        // 开发环境直接用 style-loader 注入 <style> 标签（快）；生产环境抽离成独立 .css 文件
                        isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
                        'css-loader', // 解析 css 中的 @import 和 url()
                        'less-loader' // 将 less 编译为 css
                    ]
                },
                // 3. 处理图片、字体等静态资源
                {
                    test: /\.(png|svg|jpe?g|gif|webp)$/i,
                    type: 'asset', // 🌟 Webpack 5 原生资源模块，替代以前的 url-loader 和 file-loader
                    parser: { dataUrlCondition: { maxSize: 10 * 1024 } }, // 小于 10KB 的图片转成 base64 字符串内联到代码里，减少 HTTP 请求
                    generator: { filename: 'imgs/[name].[hash:8][ext]' } // 大于 10KB 的图片输出到 imgs 目录下
                }
            ]
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'] // 导入这些后缀的文件时可以省略后缀名
        },
        optimization: {
            minimize: !isDev, // 只有生产环境才开启代码压缩
            minimizer: [
                new TerserPlugin({
                    parallel: true, // 开启多线程并行压缩
                    exclude: /_worker\.js$/, // Cloudflare Pages 代理文件，不需要压缩混淆
                    terserOptions: {
                        compress: { drop_console: true, drop_debugger: true } // 自动删除代码里的 console.log 和 debugger
                    }
                })
            ],
            // 🌟 代码分割（分包）策略
            splitChunks: {
                chunks: 'all', // 将同步和异步引用的代码都进行分割
                cacheGroups: {
                    vendors: { // 抽离第三方依赖 (node_modules里的代码)
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors', // 抽离出来的包名叫 vendors.js
                        priority: 10, // 优先级较高，优先匹配第三方库
                        enforce: true // 强制执行抽离
                    }
                }
            }
        },
        // 🌟 新增这一段：调整 Webpack 的性能警告阈值
        performance: {
            hints: !isDev ? 'warning' : false, // 开发环境关闭警告，生产环境开启
            maxEntrypointSize: 2500000,        // 将入口总大小限制放宽到 2.5 MB
            maxAssetSize: 2000000,             // 将单个静态文件大小限制放宽到 2.0 MB
        },
        // 控制台报错溯源：开发环境显示具体源码行数，生产环境关闭以提高安全性并减小体积
        devtool: isDev ? 'eval-cheap-module-source-map' : false,
        plugins, // 挂载前面组装好的所有插件
        devServer: {
            port: 8080, // 本地开发服务器端口
            historyApiFallback: true, // 🌟 单页应用 (SPA) 路由防 404 核心配置：如果找不到真实路径的文件，重定向回 index.html
            hot: true, // 开启热更新 (HMR)：修改代码后浏览器不刷新，只局部更新对应模块
            proxy: [ // 🌟 跨域代理配置
                {
                    context: ['/api'], // 学生系统 — 以 /api 开头 → JSONPlaceholder
                    target: 'https://jsonplaceholder.typicode.com',
                    changeOrigin: true,
                    pathRewrite: { '^/api': '' },
                },
                {
                    context: ['/shop-api'], // 商城系统 — 以 /shop-api 开头 → DummyJSON
                    target: 'https://dummyjson.com',
                    changeOrigin: true,
                    pathRewrite: { '^/shop-api': '' },
                },
            ]
        },
        // 🌟 Webpack 5 缓存机制：极大提升二次启动和打包速度，利用文件系统把缓存存到硬盘里
        cache: { type: 'filesystem' }
    };
};
