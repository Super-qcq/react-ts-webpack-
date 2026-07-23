// build/configs.js
// 🌟 【项目全局模块注册表】
// 作用：告诉 Webpack 主程序，当前整个大项目里一共包含哪些相互独立的子系统。
module.exports = [
    {
        // 1. 终端启动暗号 (标识符)
        // 作用：在命令行敲击 npm run start module=student-system 时，
        // Webpack 会精确捕捉到 'student-system' 这个名字，并找到它。
        name: 'student-system', 

        // 2. 局部配置文件的精确物理路径
        // 作用：Webpack 找到名字后，会顺着这个路径，去读取该模块独有的 Webpack 配置。
        path: 'src/student_system/config.js'
    },
    // 🌟 电商管理系统
    { name: 'shop-system', path: 'src/shop_system/config.js' }
]