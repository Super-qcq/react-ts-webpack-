/**
 * Cloudflare Pages 专属代理 — 电商系统生产环境
 * /shop-api/* → https://dummyjson.com/*
 * 仅对 Cloudflare Pages 生效。
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/shop-api')) {
      const targetPath = url.pathname.replace(/^\/shop-api/, '');
      const targetUrl = `https://dummyjson.com${targetPath}${url.search}`;
      const modifiedRequest = new Request(targetUrl, {
        method: request.method, headers: request.headers, body: request.body,
      });
      const response = await fetch(modifiedRequest);
      const newResponse = new Response(response.body, response);
      newResponse.headers.set('Access-Control-Expose-Headers', 'x-total-count');
      return newResponse;
    }
    return env.ASSETS.fetch(request);
  }
};
