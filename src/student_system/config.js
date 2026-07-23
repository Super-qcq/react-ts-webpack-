// src/student_system/config.js
// 🌟 【局部模块构建配置】
// 作用：精确指导 Webpack 如何打包当前这个特定的业务模块（学生系统）。
module.exports = {
    /**
     * 静态文件直拷列表（不经 Webpack 编译，原样复制到 dist/ 根目录）
     * ==================================================================
     * ⚠️ 仅 Cloudflare Pages 部署需要此配置，本地开发和其他服务器忽略。
     *
     * _worker.js → Cloudflare Pages 专属代理脚本
     *   为什么用 staticFrom 而不是 webpack entry：
     *     1. 这个文件是给 Cloudflare 边缘网络执行的，不是给浏览器执行的
     *     2. 不能经过 Babel/Webpack 编译（Cloudflare 不认识 webpack 打包后的格式）
     *     3. 必须原样放在 dist/ 根目录，和 index.html 同级
     *     4. copy-webpack-plugin 会自动把它从 src/ 复制到 dist/student-system/
     */
    staticFrom: ['src/student_system/_worker.js'],

    // webpack 任务数组（如果一个模块里还有多个物理隔离的页面，可以写多个对象。现在我们采用了 React 路由，所以只写一个总入口即可）
    webpack: [
        {
            // --- 【输入配置】 ---
            // 1. 核心代码入口路径 (Entry)
            // 作用：Webpack 从哪个文件开始“顺藤摸瓜”去解析整个 React 组件树。必须写在数组里。
            source: ['src/student_system/index.tsx'], 
            // --- 【输出配置】 ---
            // 2. 打包后的 JS/CSS 产出目录 (Target)
            // 作用：传统上指定生成文件的存放位置。（注：在我们深度优化的 webpack.config.js 中，这个路径已经被统一接管为 dist/[模块名] 了，但保留此字段符合你底层配置的数据结构规范）
            target: 'dist/student_system/js', 
            // 3. 产出文件的核心名称 (Chunk Name)
            // 作用：打包后会生成类似 main.8f2a3c1b.js 的文件，前缀的 'main' 就是由这里决定的。
            name: 'main', 
            // --- 【HTML 模板配置】 ---
            // Webpack 打包完 JS 和 CSS 后，需要一个基础的 HTML 骨架（带 <div id="root"></div> 的那个）把它们装起来。
            // 4. HTML 模板所在的文件夹路径
            htmlPath: 'src/student_system/', 
            // 5. HTML 模板的纯文件名（不带后缀）
            htmlName: 'index', 
            // 6. HTML 模板的后缀名
            htmlType: 'html' 
        }
    ]
}