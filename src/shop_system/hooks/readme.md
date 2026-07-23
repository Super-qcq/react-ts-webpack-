# hooks/ — 自定义 Hooks

**放什么**：多个组件都会用到的状态逻辑（必须是函数式组件才能用 Hook）。

**不放什么**：类式组件用不了 Hook，你的项目以类式组件为主，这里暂时不需要。保留目录给未来。

---

## 示例（等你写函数式组件时用）

### useFavorites.ts — 收藏逻辑

```ts
// hooks/useFavorites.ts
import { useState, useCallback } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggle = useCallback((id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }, []);

  const isFavorite = useCallback((id: number) => favorites.includes(id), [favorites]);

  return { favorites, toggle, isFavorite };
}

// 组件里：const { favorites, toggle, isFavorite } = useFavorites();
```

### useDebounce.ts — 防抖

```ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// 搜索框：const keyword = useDebounce(inputValue, 300);
// 用户停止输入 300ms 后才发起搜索请求
```
