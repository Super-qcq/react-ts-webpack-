/**
 * 本地生产环境模拟服务器（Node.js 版）
 * ==========================================
 * 作用：直接用浏览器打开 dist/ 打包产物，/kb-api/* 代理到 Python 后端
 * 效果等同于线上 Cloudflare Pages 的 _worker.js
 *
 * 用法：
 *   node src/rag_agent/serve.js
 *   浏览器打开 http://localhost:8081
 *
 * 依赖：纯 Node.js 标准库，不需要 npm install
 */
const { createServer } = require('http');
const { readFile } = require('fs');
const { join, extname } = require('path');
const http = require('http');

const PORT = 8081;
const DIST = join(__dirname, '..', '..', 'dist', 'rag-agent');
const BACKEND = 'http://127.0.0.1:8003';

// 文件类型映射
const MIME = {
  '.html': 'text/html;charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
};

// ====== 服务器 ======
createServer((req, res) => {
  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Expose-Headers', '*');

  // OPTIONS 预检
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.writeHead(200);
    return res.end();
  }

  // ====== /kb-api/* → 代理到 Python 后端 ======
  if (req.url.startsWith('/kb-api')) {
    const proxyReq = http.request(
      BACKEND + req.url,
      { method: req.method, headers: req.headers },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      },
    );
    proxyReq.on('error', () => {
      res.writeHead(502);
      res.end('Backend proxy error');
    });
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
      req.pipe(proxyReq);
    } else {
      proxyReq.end();
    }
    return;
  }

  // ====== 静态文件 ======
  let file = req.url.split('?')[0].split('#')[0];
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
  console.log(`  🔗 代理: /kb-api/* -> ${BACKEND}`);
  console.log(`  🌐 http://localhost:${PORT}\n`);
});
