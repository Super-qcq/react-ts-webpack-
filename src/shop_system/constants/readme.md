# constants/ — 常量 / 配置

**放什么**：全局公用的常量值、枚举、配置对象。

**不放什么**：只在单个组件里用的字符串、颜色，直接写组件里。

---

## 示例

### index.ts — 业务常量

```ts
// constants/index.ts

/** 分页默认值 */
export const PAGE_DEFAULTS = {
  pageSize: 12,
  pageSizeOptions: ['12', '24', '48'] as string[],
} as const;

/** 商品排序方式 */
export const SORT_OPTIONS = [
  { value: 'price-asc',  label: '价格从低到高' },
  { value: 'price-desc', label: '价格从高到低' },
  { value: 'rating',     label: '评分最高' },
] as const;

/** 商品分类颜色池 */
export const CATEGORY_COLORS = [
  '#f56a00', '#7265e6', '#ffbf00', '#00a2ae',
  '#1677ff', '#52c41a', '#eb2f96', '#722ed1',
];

/** 相册封面色 */
export const ALBUM_COVERS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

/** API 基础路径 */
export const API_BASE = '/shop-api';
```
