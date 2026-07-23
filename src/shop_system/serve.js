/**
 * 本地生产环境模拟服务器（Node.js 版）
 * ==========================================
 * 作用：直接用浏览器打开 dist/ 打包产物，/shop-api/* 代理到 DummyJSON
 * 效果等同于线上 Cloudflare Pages 的 _worker.js
 *
 * 用法：
 *   node src/shop_system/serve.js
 *   浏览器打开 http://localhost:8081
 *
 * 依赖：纯 Node.js 标准库，不需要 npm install
 */
const { createServer } = require('http');
const { readFile } = require('fs');
const { join, extname } = require('path');
const https = require('https');

const PORT = 8081;
const DIST = join(__dirname, '..', '..', 'dist', 'shop-system');

// 文件类型映射
const MIME = {
  '.html': 'text/html;charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.json': 'application/json',
  '.ico':  'image/x-icon',
};

// ====== 服务器 ======
createServer((req, res) => {
  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Expose-Headers', 'x-total-count');

  // OPTIONS 预检
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.writeHead(200);
    return res.end();
  }

  // ====== /shop-api/* → 代理到 dummyjson ======
  if (req.url.startsWith('/shop-api')) {
    // 去掉 /shop-api 前缀，拼到 dummyjson
    const targetPath = req.url.replace('/shop-api', '');
    const target = 'https://dummyjson.com' + targetPath;

    // 转发原始请求头（Content-Type 等对 POST 请求至关重要）
    const forwardHeaders = { ...req.headers };
    // 去掉只对客户端有意义的 host/connection，避免干扰代理
    delete forwardHeaders.host;
    delete forwardHeaders.connection;

    const options = {
      method: req.method,
      headers: forwardHeaders,
    };

    const proxyReq = https.request(target, options, (proxyRes) => {
      // 去掉 transfer-encoding: chunked（Node 自动处理）
      const headers = { ...proxyRes.headers };
      delete headers['transfer-encoding'];
      res.writeHead(proxyRes.statusCode, headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', () => { res.writeHead(502); res.end('Proxy error'); });

    // 转发请求体（POST/PUT 等）
    req.pipe(proxyReq);
    return;
  }

  // ====== 静态文件 ======
  let file = req.url.split('?')[0].split('#')[0] || '/';
  if (file === '/' || file.endsWith('/')) file += 'index.html';
  const fp = join(DIST, file);

  readFile(fp, (err, data) => {
    if (err) {
      // SPA 路由兜底 → index.html
      readFile(join(DIST, 'index.html'), (e2, d2) => {
        res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
        res.end(e2 ? 'Not Found' : d2);
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[extname(fp)] || 'application/octet-stream' });
    res.end(data);
  });

}).listen(PORT, () => {
  console.log(`\n  📦 静态目录: ${DIST}`);
  console.log(`  🔗 代理: /shop-api/* -> https://dummyjson.com`);
  console.log(`  🌐 http://localhost:${PORT}\n`);
});
