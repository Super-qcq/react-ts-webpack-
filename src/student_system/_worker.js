/**
 * Cloudflare Pages 专属代理 — 生产环境 API 反向代理
 * =====================================================
 * ⚠️  仅对 Cloudflare Pages 生效！阿里云 / Vercel / Netlify 等平台不会识别此文件。
 *
 * 原理：
 *   Cloudflare Pages 会自动扫描打包产物根目录，发现 _worker.js 文件后
 *   将其注册为整个站点的请求入口——所有请求先经过这里，再决定返回静态文件还是代理转发。
 *   → 不需要单独建 Worker，不需要配路由，部署即生效。
 *
 * 本地开发不受影响（走 webpack devServer.proxy）。
 *
 * 请求链路：
 *   浏览器 axios.get('/api/users')
 *     → react-ts-webpack.pages.dev/api/users
 *     → _worker.js 拦截匹配 /api/*
 *     → 转发到 https://jsonplaceholder.typicode.com/users
 *     → 返回数据 + 放行 x-total-count 响应头（前端分页用）
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 拦截 /api/* → 转发到 JSONPlaceholder
    if (url.pathname.startsWith('/api')) {
      const targetPath = url.pathname.replace(/^\/api/, '');
      const targetUrl = `https://jsonplaceholder.typicode.com${targetPath}${url.search}`;

      const modifiedRequest = new Request(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });

      const response = await fetch(modifiedRequest);

      // 确保前端 axios 能读到 x-total-count 响应头（分页用）
      const newResponse = new Response(response.body, response);
      newResponse.headers.set('Access-Control-Expose-Headers', 'x-total-count');
      return newResponse;
    }

    // 非 /api 请求 → 返回 Pages 静态文件
    return env.ASSETS.fetch(request);
  }
};
