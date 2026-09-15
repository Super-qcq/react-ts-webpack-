/**
 * auth.ts —— 身份来源抽象层（集中一处，方便以后接登录）
 *
 * 【设计意图】全项目里"当前用户是谁"只从这里取；将来做登录系统时，
 * 只需把 getCurrentUser/setCurrentUser 的实现换成"登录态"(token/会话/用户信息)，
 * 业务组件(聊天/历史/长期记忆)一行都不用改。
 *
 * 现在=演示用：内置几个身份 + 允许自定义，保存在 localStorage（换浏览器则回到默认）。
 */
const STORAGE_KEY = 'rag_chat_user';

/** 演示身份候选（Select/提示用，允许用户输任意名字） */
export const DEMO_USERS = ['小明', '老师', '新生', 'demo-user'];

/** 读取当前身份（可显式为空：表示"还没选身份，待新建"）
 *  - localStorage 里【从未存过】→ 回默认 demo-user（老行为/兼容首次打开）
 *  - 存过但存成空串 '' → 返回 ''（"无身份/待新建"，不自动回 demo-user）
 */
export function getCurrentUser(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return 'demo-user'; // 从未设置 → 默认演示身份
    return raw.trim();                    // 显式设置过（可能为空）→ 原样返回
  } catch {
    /* localStorage 不可用时忽略 */
  }
  return 'demo-user';
}

/** 写入当前身份（登录系统接入后，这里改成存登录返回的用户） */
export function setCurrentUser(user: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, user);
  } catch {
    /* 忽略 */
  }
}
