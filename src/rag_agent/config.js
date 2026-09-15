// src/rag_agent/config.js
// 🌟 【局部模块构建配置】
// 作用：精确指导 Webpack 如何打包当前这个业务模块（智能校务问答系统）。
module.exports = {
    /**
     * 静态文件直拷列表（不经 Webpack 编译，原样复制到 dist/ 根目录）
     * ⚠️ 仅 Cloudflare Pages 部署需要此配置，本地开发和其他服务器忽略。
     * _worker.js → Cloudflare Pages 专属代理脚本（/kb-api → 后端 API）
     */
    staticFrom: ['src/rag_agent/_worker.js'],

    // webpack 任务数组（采用 React 路由，只写一个总入口）
    webpack: [
        {
            // --- 【输入配置】---
            // 1. 核心代码入口路径 (Entry)
            source: ['src/rag_agent/index.tsx'],
            // --- 【输出配置】---
            // 2. 打包后的 JS/CSS 产出目录 (Target)
            target: 'dist/rag_agent/js',
            // 3. 产出文件的核心名称 (Chunk Name)
            name: 'main',
            // --- 【HTML 模板配置】---
            // 4. HTML 模板所在的文件夹路径
            htmlPath: 'src/rag_agent/',
            // 5. HTML 模板的纯文件名（不带后缀）
            htmlName: 'index',
            // 6. HTML 模板的后缀名
            htmlType: 'html',
        },
    ],
};
