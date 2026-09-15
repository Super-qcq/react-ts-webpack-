/**
 * Cloudflare Pages 专属代理 — 生产环境 API 反向代理
 * =====================================================
 * 请求链路（生产）：
 *   浏览器 axios.post('/kb-api/chat')
 *     → 站点域名/kb-api/chat
 *     → _worker.js 拦截匹配 /kb-api/*
 *     → 转发到 Python 后端 http://localhost:8003/kb-api/chat（生产请改为线上地址）
 *     → 返回数据
 *
 * 本地开发不受影响（走 webpack devServer.proxy）。
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 拦截 /kb-api/* → 转发到后端 API
    if (url.pathname.startsWith('/kb-api')) {
      const targetBase = (env && env.BACKEND_ORIGIN) || 'http://localhost:8003';
      const targetUrl = `${targetBase}${url.pathname}${url.search}`;

      const modifiedRequest = new Request(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });

      return await fetch(modifiedRequest);
    }

    // 非 /kb-api 请求 → 返回 Pages 静态文件
    return env.ASSETS.fetch(request);
  },
};
