1.先创建一个文件夹
2.文件夹中npm init -y
3.装webpack cnpm i webpack-cli webpack -D
4.装react cnpm i react react-dom @types/react @types/react-dom  
5.package.json 改   "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "webpack --progress --mode development --env",
    // 生产模式打包
    "buildPro": "webpack --progress --mode production --env",
    "start": "webpack serve --open"
  },
6.根目录创建webpack.config.js
7.装tslosder cnpm i ts-loader -D
8.装typescript   cnpm i typescript -D
9.根目录配置tsconfig.json

13.装cnpm i webpack-dev-server -D  在package.json中配置"dev": "webpack-dev-server"
   自动编译的功能，不用每次修改之后手动编译
14.装antd。修改tsconfig中的include的地址。
装npm install html-webpack-plugin mini-css-extract-plugin terser-webpack-plugin copy-webpack-plugin clean-webpack-plugin --save-dev。
<!-- 装npm install yargs --save-dev。
装npm install babel-loader raw-loader --save-dev。
装npm install thread-loader --save-dev。
装npm install babel-plugin-import --save-dev。
装npm install @babel/plugin-proposal-decorators --save-dev。
装npm install @babel/plugin-proposal-class-properties --save-dev。
装npm install @babel/plugin-syntax-dynamic-import --save-dev。
装npm install @babel/plugin-transform-runtime --save-dev。
装npm install @babel/preset-env --save-dev。
装npm install @babel/preset-typescript --save-dev。
装npm install @babel/preset-react --save-dev。
装npm install css-loader --save-dev。
装npm install less less-loader --save-dev。 -->
一条命令执行
npm install  less less-loader css-loader @babel/preset-react @babel/preset-typescript @babel/preset-env @babel/plugin-transform-runtime @babel/plugin-syntax-dynamic-import @babel/plugin-proposal-class-properties yargs  babel-loader raw-loader   thread-loader   babel-plugin-import  @babel/plugin-proposal-decorators --save-dev



15.编译方式: npm run build about（模块名）
16.启动服务方式  npm run start home
17. 一些下载 可以按照package.json中的依赖执行cnpm install去下载
18. Live Server(npm run build -- --module about打包之后启动编译后的页面用的是这个服务器)   Webpack Dev Server( npm run start home 直接启动时用的是这个服务器)这两个工具/服务在功能上有所重叠，但通常用于不同的场景或开发阶段。

Live Server
Live Server 是一个 VS Code 插件，它提供了一个简单的静态文件服务器，用于预览 HTML 文件和相关的静态资源（如 CSS、JavaScript 和图片）。当你打开一个 HTML 文件并启动 Live Server 时，它会在你指定的端口（默认为 8080）上启动一个服务器，并自动刷新浏览器以显示任何更改。

Webpack Dev Server
Webpack Dev Server 是一个基于 Node.js 的服务器，它使用 webpack 编译你的前端资源，并提供一个开发环境，其中包括实时重新加载（live reloading）和热模块替换（hot module replacement，HMR）。它通常在你的项目中配置（例如在 webpack.config.js 文件中），并通过 npm run start 或类似的命令启动。 不会产生dist文件，将打包结果暂时存在内存中，内部的http-sever访问这些文件并读取数据，发送给浏览器 减少磁盘的读取，提高构建效率