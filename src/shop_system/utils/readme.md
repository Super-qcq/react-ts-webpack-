# utils/ — 工具函数

**放什么**：多个地方会用到的纯函数（和 React/组件无关的）。

**不放什么**：只在单个组件里用的函数，直接写组件里。

---

## 示例

### format.ts — 格式化函数

```ts
// utils/format.ts

/** 金额转 ¥ 格式：999 → "¥999.00" */
export function formatPrice(price: number): string {
  return `¥${price.toFixed(2)}`;
}

/** 折扣价计算：原价 100，折扣 20% → 80 */
export function calcDiscount(price: number, discountPercent: number): number {
  return Math.round(price * (1 - discountPercent / 100));
}

/** 长文本截断：hello world... → hello wo… */
export function truncate(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

/** 数字简写：1200 → "1.2k" */
export function compactNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}
```

### storage.ts — 本地存储封装

```ts
// utils/storage.ts

/** 收藏列表：存 localStorage，刷新不丢 */
export function getFavorites(): number[] {
  try { return JSON.parse(localStorage.getItem('favorites') || '[]'); } catch { return []; }
}

export function toggleFavorite(id: number): number[] {
  const list = getFavorites();
  const next = list.includes(id) ? list.filter((f) => f !== id) : [...list, id];
  localStorage.setItem('favorites', JSON.stringify(next));
  return next;
}
```

### request.ts — 统一请求封装

```ts
// utils/request.ts
import axios from 'axios';
import { message } from 'antd';

/** 自动处理错误提示的 axios 实例 */
const request = axios.create({ timeout: 10000 });

request.interceptors.response.use(
  (res) => res,
  (err) => {
    message.error(`请求失败：${err.message}`);
    return Promise.reject(err);
  }
);

export default request;
```
