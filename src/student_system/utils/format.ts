/**
 * 工具函数 — 格式化
 * 放：纯函数，和 React/组件无关
 */

/** 长文本截断：超过 maxLen 加 … */
export function truncate(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

/** 数字简写：1200 -> "1.2k" */
export function compactNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

/** 邮箱脱敏：zhangsan@gmail.com -> zha***@gmail.com */
export function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!domain) return email;
  return name.slice(0, 3) + '***@' + domain;
}
