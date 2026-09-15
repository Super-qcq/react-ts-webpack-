/**
 * 智能校务问答平台 — 统一 API 请求层
 * /kb-api/* → webpack devServer.proxy → Python 后端 localhost:8001
 * 类型定义见 ../types
 */
import axios from 'axios';
import { CFG } from '../lib/site.config';
import type {
  ChatResponse,
  ChatRequest,
  KnowledgeFile,
  IndexResult,
  MonitorOverview,
  RetrieveResult,
  SessionInfo,
  HistoryResponse,
} from '../types';

// ====== axios 统一配置 ======
// 超时由配置(CFG.apiTimeoutMs)控制：Agent 调用第三方 LLM 可能较慢，但绝不无限等待。
const http = axios.create({ timeout: CFG.apiTimeoutMs });

// ====== 对话模块 ======

/** 结构化问答（Agent + RAG + ToolStrategy 结构化输出） */
export async function sendChat(req: ChatRequest): Promise<ChatResponse> {
  const res = await http.post<ChatResponse>('/kb-api/chat', req);
  return res.data;
}

/**
 * 流式对话（SSE 打字机）
 * 使用 fetch + ReadableStream 解析 SSE 事件，支持中途取消。
 * 事件协议：event: meta / delta / error
 *
 * 【踩坑记录】后端 sse-starlette 输出的事件分隔符是 CRLF（\r\n\r\n），
 * 早期用 \n\n 切分导致一个事件都解析不到（流式"没反应"），
 * 现已改为按「空行」切分，同时兼容 \r\n\r\n 与 \n\n。
 */
export async function streamChat(
  req: ChatRequest,
  handlers: {
    onDelta: (text: string) => void;
    onMeta?: (data: Record<string, unknown>) => void;
    onError?: (msg: string) => void;
    onDone?: (data: Record<string, unknown>) => void;
  },
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch('/kb-api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
    signal,
  });
  if (!res.ok || !res.body) {
    throw new Error(`流式请求失败: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  // 解析一个 SSE 事件的原始文本块（不含末尾空行分隔符）
  const dispatchBlock = (block: string) => {
    if (!block.trim()) return;
    const lines = block.split(/\r?\n/); // 兼容 CRLF / LF 两种换行
    let event = 'message';
    const dataLines: string[] = [];
    lines.forEach((line) => {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
    });
    const dataStr = dataLines.join('\n');
    if (!dataStr) return;
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(dataStr);
    } catch {
      return;
    }
    if (event === 'delta') handlers.onDelta(String(data.content ?? ''));
    else if (event === 'meta') handlers.onMeta?.(data);
    else if (event === 'error') handlers.onError?.(String(data.error ?? '未知错误'));
  };

  // 循环读取流
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // 按「空行」切分事件（SSE 规范：空行 = 事件边界）
    let idx: number;
    while ((idx = buffer.search(/\r?\n\r?\n/)) >= 0) {
      const block = buffer.slice(0, idx);
      const sep = buffer.slice(idx).match(/^\r?\n\r?\n/);
      buffer = buffer.slice(idx + (sep ? sep[0].length : 2));
      dispatchBlock(block);
    }
  }
  // 尾部残留
  if (buffer.trim()) dispatchBlock(buffer);
  handlers.onDone?.({ done: true });
}

// ====== 知识库管理模块 ======

// ====== 会话历史模块（LangGraph PostgresSaver 记忆回放） ======

/** 会话列表（可按身份过滤；thread 归属 user，来自 session_index） */
export async function fetchSessions(userId?: string): Promise<SessionInfo[]> {
  const q = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
  const res = await http.get<SessionInfo[]>(`/kb-api/sessions${q}`);
  return res.data;
}

/** 为某身份新建一个空白会话（thread_id 由后端生成并登记归属） */
export async function createSession(userId: string): Promise<{ ok: boolean; thread_id: string; user_id: string }> {
  const res = await http.post('/kb-api/sessions', { user_id: userId });
  return res.data;
}

/** 单个会话完整历史消息（点开历史会话时加载） */
export async function fetchSessionHistory(threadId: string): Promise<HistoryResponse> {
  const res = await http.get<HistoryResponse>(`/kb-api/sessions/${encodeURIComponent(threadId)}`);
  return res.data;
}

/** 删除某个会话（后端联动清理短期记忆三表 + 长期记忆 store） */
export async function deleteSession(threadId: string): Promise<{ deleted: Record<string, number> }> {
  const res = await http.delete<{ deleted: Record<string, number> }>(`/kb-api/sessions/${encodeURIComponent(threadId)}`);
  return res.data;
}

/** 知识库文件列表 */
export async function fetchDocuments(): Promise<KnowledgeFile[]> {
  const res = await http.get<KnowledgeFile[]>('/kb-api/documents');
  return res.data;
}

/** 启动全量建索引（异步，立即返回，后台执行） */
export async function startIndexAll(): Promise<{ status: string; message: string }> {
  const res = await http.post('/kb-api/documents/index');
  return res.data;
}

/** 查询全量建索引状态 */
export async function getIndexStatus(): Promise<{ running: boolean; progress: number; result: IndexResult | null }> {
  const res = await http.get('/kb-api/documents/index/status');
  return res.data;
}

/** 上传文件并建索引 */
export async function uploadDocument(file: File): Promise<IndexResult> {
  const form = new FormData();
  form.append('file', file);
  const res = await http.post<IndexResult>('/kb-api/documents/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

/** 删除知识库文件 在网络请求中，URL 只能包含标准的 ASCII 字符（如英文字母、数字和少数符号）。如果 URL 的参数中包含中文、空格、特殊标点（如 &、=、?、/、#），直接拼在 URL 里会导致 URL 解析错乱。

encodeURIComponent 的工作就是把这些特殊字符或非 ASCII 字符转换为 % 加上对应十六进制 UTF-8 编码 的形式。*/
export async function deleteDocument(name: string): Promise<void> {
  await http.delete(`/kb-api/documents/${encodeURIComponent(name)}`);
}

/** 重建指定文件的索引（删除旧向量 → 重新加载/切割/向量化 → 入库）。
 * 单文件操作，只处理这一个文件，其余已入库文件不受影响。 */
export async function reindexDocument(name: string): Promise<IndexResult> {
  const res = await http.post<IndexResult>(`/kb-api/documents/${encodeURIComponent(name)}/reindex`);
  return res.data;
}

/** 检索测试 */
export async function retrieveTest(query: string, topK: number, threshold: number): Promise<RetrieveResult> {
  const res = await http.post<RetrieveResult>('/kb-api/retrieve', {
    query,
    top_k: topK,
    score_threshold: threshold,
  });
  return res.data;
}

// ====== 全局长期记忆（CLAUDE.md 式自定义设定）======

/** 读取全局长期记忆正文（供编辑框回显） */
export async function fetchGlobalMemory(): Promise<{ content: string; char_count: number }> {
  const res = await http.get('/kb-api/global-memory');
  return res.data;
}

/** 覆盖保存全局长期记忆正文（后端会清空接口缓存，保证下次提问立即按新设定生成） */
export async function saveGlobalMemory(content: string): Promise<{ ok: boolean; char_count: number; cleared: number }> {
  const res = await http.post('/kb-api/global-memory', { content });
  return res.data;
}

// ====== 监控模块 ======

/** 监控总览（可传 user_id：缓存/命中统计只看该用户） */
export async function fetchMonitor(userId?: string): Promise<MonitorOverview> {
  const q = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
  const res = await http.get<MonitorOverview>(`/kb-api/monitor/overview${q}`);
  return res.data;
}

/** 运行时调整语义缓存命中阈值（监控台热调，立即对后续提问生效） */
export async function setSemanticThreshold(threshold: number): Promise<{ ok: boolean; current: number }> {
  const res = await http.post('/kb-api/monitor/cache-threshold', { threshold });
  return res.data;
}

// ====== 长期记忆 store（PostgresStore · 按用户偏好）======

/** 长期记忆一条记录 */
export interface MemoryPref {
  user_id: string;
  key: string;
  value: string;
  updated_at: string;
}

/** 列出用户已保存的长期偏好（可传 user_id 只看某人） */
export async function listMemoryPrefs(userId?: string): Promise<{ ok: boolean; total: number; items: MemoryPref[] }> {
  const q = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
  const res = await http.get(`/kb-api/memory/preferences${q}`);
  return res.data;
}

/** 列出"已存在的用户"（有会话或已有偏好者；供手动设置长期记忆的下拉选择，不手填） */
export async function listMemoryUsers(): Promise<{ ok: boolean; users: string[] }> {
  const res = await http.get('/kb-api/memory/users');
  return res.data;
}

/** 手动写入一条长期偏好（等价于 AI 对话中调用 save_user_preference） */
export async function addMemoryPref(userId: string, key: string, value: string): Promise<{ ok: boolean }> {
  const res = await http.post('/kb-api/memory/preferences', { user_id: userId, key, value });
  return res.data;
}

/** 删除某用户的一条长期偏好 */
export async function deleteMemoryPref(userId: string, key: string): Promise<{ ok: boolean; deleted: number }> {
  const res = await http.delete('/kb-api/memory/preferences', { data: { user_id: userId, key } });
  return res.data;
}

/** 级联删除一个身份(用户)的全部数据（长期偏好 + 名下所有会话历史 + 归属登记） */
export async function deleteMemoryUser(userId: string): Promise<{ ok: boolean; deleted: Record<string, number> }> {
  const res = await http.delete(`/kb-api/memory/users/${encodeURIComponent(userId)}`);
  return res.data;
}
