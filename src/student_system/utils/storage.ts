/**
 * 工具函数 — 本地存储
 * 封装 localStorage，带 try-catch 防私密模式报错
 */

/** 读 */
export function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** 写 */
export function setItem(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 无痕模式 / 存储满 */
  }
}

/** 删 */
export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}
