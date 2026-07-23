// src/shop_system/config.js
// 🌟 电商系统模块 Webpack 构建配置
module.exports = {
    staticFrom: ['src/shop_system/_worker.js'],
    webpack: [{
        source: ['src/shop_system/index.tsx'],
        target: 'dist/shop_system/js',
        name: 'main',
        htmlPath: 'src/shop_system/',
        htmlName: 'index',
        htmlType: 'html'
    }]
};
