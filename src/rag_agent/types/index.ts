/**
 * 智能校务问答平台 — 类型定义
 * 所有业务实体的 TS 接口集中在这里
 */

// ====== 对话模块 ======

/** 检索命中的知识片段 */
export interface ChatHit {
  text: string;
  source: string;
  score: number;
}

/** 结构化问答响应（Agent 返回 answer + sources + confidence） */
export interface ChatResponse {
  answer: string;
  sources: string[];
  confidence: number;
  hits: ChatHit[];
  elapsed_ms: number;
  session_id: string;
}

/** 对话请求体（身份 user_id 与 会话 thread_id 分开：短期记忆跟 thread，长期偏好跟 user） */
export interface ChatRequest {
  question: string;
  user_id: string;   // 身份：长期记忆(store 偏好)归属
  thread_id?: string; // 会话：短期记忆(历史)按它存；缺省由后端回退用 user_id
  role?: string;
  top_k?: number;
}

/** SSE 流式对话事件 */
export interface StreamEvent {
  event: 'meta' | 'delta' | 'error' | 'done';
  data: Record<string, unknown>;
}

// ====== 会话历史模块（LangGraph PostgresSaver 持久化回放） ======

/** 会话列表项（后端 GET /kb-api/sessions 返回） */
export interface SessionInfo {
  thread_id: string;
  title: string;
  user_msgs: number;
  assistant_msgs: number;
  last_ts: string;
}

/** 单条历史消息（后端 GET /kb-api/sessions/{thread_id} 返回） */
export interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
  sources: string[];
  confidence?: number;
  ts: string;
}

/** 单个会话完整历史 */
export interface HistoryResponse {
  thread_id: string;
  messages: HistoryMessage[];
}

// ====== 知识库管理模块 ======

/** 知识库文件信息 */
export interface KnowledgeFile {
  name: string;
  size: number;
  indexed: boolean;
}

/** 建索引结果 */
export interface IndexResult {
  indexed_files: string[];
  inserted_chunks: number;
  failed: string[];
}

/** 检索测试返回 */
export interface RetrieveResult {
  hits: Array<ChatHit & { pass_threshold: boolean }>;
  threshold: number;
}

// ====== 监控模块 ======

/** 审计调用日志（来自后端自定义中间件） */
export interface AuditLog {
  type: 'model' | 'tool';
  tool?: string;
  model?: string;
  args?: Record<string, string>;
  elapsed_ms?: number;
  ok?: boolean;
  error?: string;
  ts?: string;
}

/** 会话统计 */
export interface SessionStats {
  total: number;
  ok: number;
  failed: number;
  avg_elapsed_ms: number;
}

/** 运行配置快照 */
export interface RuntimeConfig {
  chat_model: string;
  chat_provider: string;
  embed_model: string;
  embed_dim: number;
  milvus_uri: string;
  milvus_collection: string;
  chunk_size: number;
  chunk_overlap: number;
  retrieve_top_k: number;
  score_threshold: number;
  model_call_limit: number;
  summary_trigger_tokens: number;
  db_url: string;
  semantic_threshold?: string; // 当前生效的语义缓存命中阈值（.env 默认 或 页面热调）
  cache_enabled?: boolean;
  cache_ttl?: number;
  cache_max_entries?: number;
  redis_host?: string;
  redis_db?: number;
}

/** 监控总览 */
export interface CacheItem {
  key: string;
  question: string;
  stored_at: string;
  age_seconds: number;
  hit_count?: number;  // 该缓存被命中的次数
  source?: string;     // 缓存来源：redis / pg
}
/** 语义簇展开的别名：一个问法如何命中这份答案（原句命中 / 作为母答案被相近问法命中） */
export interface CacheAlias {
  question: string;
  exact_hit: number;   // 该问法被原样再问命中的次数
  source_hit: number;  // 该问法是"母答案"时，被其它相近问法语义命中的次数
  is_source?: boolean; // true = 本问法行是母答案记录（其它问法语义命中的接收者）
  last_hit_at: string; // 最近一次命中，空串=从未
}
/** 语义簇：同一份答案（可被多个同义问法复用）的监控单元 */
export interface CacheCluster {
  sig: string;
  representative: string;   // 代表问法（命中最多）
  answer_preview: string;
  total_hit: number;        // 该答案累计被复用次数（口径与顶部"命中"一致）
  pg_hit: number;
  redis_hit: number;
  storage: 'PG+Redis' | 'PG' | 'Redis';
  stored_at: string;
  age_seconds: number;
  last_hit_at: string;
  aliases: CacheAlias[];
  redis_keys: string[];     // 该簇对应的 Redis 短 key（供删除）
}
/** 接口层面缓存统计（Redis 缓存最终回答） */
export interface InterfaceCache {
  entries: number;       // 缓存条目数
  hit_count: number;     // 累计命中次数
  miss_count: number;    // 累计未命中次数
  hit_rate: number;      // 命中率百分比
  items: CacheItem[];    // 缓存条目列表（单 key 粒度，兼容保留）
  attempts?: number;     // 命中尝试总次数 = hit + miss
  saved_calls?: number;  // 省下的模型调用次数 = hit_count
  cluster_count?: number; // 语义簇个数（一行 = 一份答案）
  clusters?: CacheCluster[]; // 语义簇列表（企业级监控粒度）
}
export interface CacheStats {
  enabled: boolean;
  entries: number;
  max_entries: number;
  ttl_seconds: number;
  hit_count: number;
  miss_count: number;
  hit_rate: number;
  items: CacheItem[];
  interface_cache?: InterfaceCache;  // 接口层面缓存（Redis）
}
export interface MonitorOverview {
  collection: string;
  chunk_count: number;
  sources: string[];
  session_stats: SessionStats;
  audit_logs: AuditLog[];
  cache_stats: CacheStats;
  config: RuntimeConfig;
}
