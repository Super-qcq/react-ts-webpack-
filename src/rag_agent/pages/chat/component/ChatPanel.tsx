import React, { useRef, useState } from 'react';
import {
  Button,
  Drawer,
  Empty,
  Input,
  List,
  Segmented,
  Space,
  Tag,
  Collapse,
  Progress,
  Spin,
  Popconfirm,
  Modal,
  Tooltip,
  AutoComplete,
  message,
} from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  DatabaseOutlined,
  HistoryOutlined,
  PlusOutlined,
  DeleteOutlined,
  StopOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import type { ChatHit, SessionInfo, HistoryMessage } from '../../../types';
import { sendChat, streamChat, fetchSessions, fetchSessionHistory, deleteSession, fetchGlobalMemory, saveGlobalMemory, createSession, listMemoryUsers } from '../../../api';
import { getCurrentUser, setCurrentUser } from '../../../lib/auth';
import SITE, { CFG } from '../../../lib/site.config';
import '../style/index.less';

// ====== 消息类型 ======
interface ChatMsg {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
  sources?: string[];
  confidence?: number;
  hits?: ChatHit[];
  elapsed_ms?: number;
}

let msgSeq = 0;

// ===== 全局聊天状态（跨路由切换保持，组件卸载不中断请求）=====
// 原因：React 路由切换时 ChatPanel 组件会卸载，组件内的 state/refs 全部销毁，
// 导致正在进行的流式请求被中断、聊天记录丢失。
// 解决：把核心状态提到模块级全局变量，组件挂载时恢复、卸载时不清除，
// 这样切到监控台再回来，请求还在跑、消息还在、不会中断。
const globalChatState: {
  userId: string;
  threadId: string; // 当前会话(thread)：短期记忆/历史按它存
  msgs: ChatMsg[];
  loading: boolean;
  abortController: AbortController | null;
  streamBuffer: string;
  streamDone: boolean;
} = {
  userId: 'demo-user',
  threadId: '',
  msgs: [],
  loading: false,
  abortController: null,
  streamBuffer: '',
  streamDone: false,
};

/**
 * ChatPanel — 核心对话组件
 * 支持两种模式：
 *   - 结构化：一次请求返回 answer/sources/confidence，前端用打字机逐字渲染
 *   - 流式：SSE 逐字推送，真实打字机效果
 */
const ChatPanel = () => {
  const [mode] = useState<'structured' | 'stream'>('stream'); // 固定流式回答（企业级标准）
  const [userId, setUserId] = useState(() => getCurrentUser() || 'demo-user'); // 身份：统一走 auth 抽象层（便于将来接登录）
  const [idDraft, setIdDraft] = useState(userId); // 身份输入框草稿（失焦确认=切身份）
  const [threadId, setThreadId] = useState(globalChatState.threadId); // 当前会话(thread)：短期记忆/历史按它存
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<ChatMsg[]>(globalChatState.msgs); // 从全局恢复
  const [loading, setLoading] = useState(globalChatState.loading); // 从全局恢复
  // ===== 历史会话（LangGraph PostgresSaver 记忆回放） =====
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState<SessionInfo[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null); // 删除会话时的加载状态，防二次点击
  // ===== 全局长期记忆（CLAUDE.md 式自定义设定：写什么，每次问答都自动带上）=====
  const [memOpen, setMemOpen] = useState(false);
  const [memText, setMemText] = useState('');
  const [memLoading, setMemLoading] = useState(false);
  const [memSaving, setMemSaving] = useState(false);
  // abortController 存在全局，组件卸载不中断正在进行的请求
  const abortRef = useRef<AbortController | null>(globalChatState.abortController); // 从全局恢复，组件卸载不中断
  const threadRef = useRef<string>(globalChatState.threadId); // 当前会话 thread（ref 同步，供闭包读最新值）
  const genRef = useRef(0); // "会话/身份代际"：切换即 +1，旧流回调校验代际后丢弃，防串号
  const switchPromiseRef = useRef<Promise<void> | null>(null); // 在途的"切身份"（防并发重复建会话）
  // 记录 userId 输入框获得焦点时的值（失焦时据此判断用户是否切换了身份）
  const userIdRef = useRef(getCurrentUser() || 'demo-user');
  const listRef = useRef<HTMLDivElement>(null);

  // ===== 身份下拉候选：与监控台【同一名单】 =====
  // 谁真实出现过（聊过/新建过会话/存过偏好）就列谁；监控台「删除该用户」后刷新即不再有他；
  // 也可直接输入一个新名字 → 切换时自动新建（该用户随之出现在监控台）。
  const [identityOptions, setIdentityOptions] = useState<string[]>([]);
  const refreshIdentityUsers = () => {
    listMemoryUsers()
      .then((d) => setIdentityOptions(d.users ?? []))
      .catch(() => setIdentityOptions([])); // 拉取失败宁可不列，也不编造用户
  };
  React.useEffect(() => {
    refreshIdentityUsers();
  }, []);

  // ===== 全局状态同步：state 变化时写回全局对象（切页面不丢）=====
  React.useEffect(() => {
    globalChatState.userId = userId;
    globalChatState.threadId = threadRef.current;
    globalChatState.msgs = msgs;
    globalChatState.loading = loading;
    globalChatState.abortController = abortRef.current;
    globalChatState.streamBuffer = streamBuffer.current;
    globalChatState.streamDone = streamDone.current;
  }, [userId, threadId, msgs, loading]);

  // ===== 挂载恢复：切走期间流在后台完成后，回切要自动把答案补回界面 =====
  // 背景：请求的 onDone/收尾闭包绑定在【卸载时】的那次组件上，切回后不会自动上屏；
  // 而历史抽屉是"点开才实时拉"，所以会出现"聊天没回复、历史却有一问一答"的错位。
  // 修复：只要最后一条是"助手但没内容/仍在 streaming"的空泡，就带重试地从后端历史
  //       补全（因为后端答完必已写库），直到拿到有内容的回答或确认彻底中断。
  React.useEffect(() => {
    const mountedUserId = userIdRef.current;
    // 若缓冲里有残余文本，先把已到的内容继续弹出来（打字机）
    if (globalChatState.loading && globalChatState.streamBuffer.length > 0) {
      setTimeout(() => {
        if (userIdRef.current !== mountedUserId) return;
        if (streamRaf.current == null) streamRaf.current = requestAnimationFrame(typewriterStep);
      }, 100);
    }
    const lastMsg = globalChatState.msgs[globalChatState.msgs.length - 1];
    const stuck =
      !!lastMsg &&
      lastMsg.role === 'assistant' &&
      (!lastMsg.content || lastMsg.streaming); // 空/仍在转圈的助手气泡 = 疑似没补上

    // 动态重试等后端写完（模型可能较慢 / 多次重试）。约每 0.4~5s 递增一次，最多 ~40 次(几分钟)；命中或结束即停。
    let tries = 0;
    const MAX_TRIES = 40;
    const restore = () => {
      if (userIdRef.current !== mountedUserId) return; // 期间切了会话则不覆盖
      tries += 1;
      fetchSessionHistory(threadRef.current || userIdRef.current)
        .then((detail) => {
          if (userIdRef.current !== mountedUserId) return;
          const src = detail?.messages || [];
          const restored = src.map((m: any, i: number) => ({
            id: i + 1,
            role: m.role,
            content: m.content || '',
            sources: m.sources,
            confidence: m.confidence,
            hits: m.hits,
            streaming: false,
          }));
          const hasAnswer = restored.some((m) => m.role === 'assistant' && !!m.content);
          if (restored.length > 0 && hasAnswer) {
            // 恢复成功：把后端已答好的完整历史放回界面，结束转圈
            setMsgs(restored);
            globalChatState.msgs = restored;
            setLoading(false);
            globalChatState.loading = false;
            globalChatState.streamDone = true;
            scrollBottom();
            return;
          }
          // 后端是否已彻底结束（旧请求的 finally 会把全局 loading 置 false、done 置 true）
          const ended = !globalChatState.loading && globalChatState.streamDone;
          if (ended || tries >= MAX_TRIES) {
            // 【关键】无论何种收场都复位 loading，避免"气泡已占位但右下角还卡着终止/发送"
            setLoading(false);
            globalChatState.loading = false;
            if (ended) {
              // 确认真结束却始终无内容 → 才给占位（真中断）
              setMsgs((prev) => {
                const updated = [...prev];
                if (updated.length > 0 && !updated[updated.length - 1].content) {
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: '（请求中断，请重新发送）',
                    streaming: false,
                  };
                }
                return updated;
              });
            }
            return;
          }
          // 尚未结束：递增退避，继续等后端写完
          const delay = Math.min(5000, 400 + tries * 400);
          setTimeout(restore, delay);
        })
        .catch(() => {
          // 网络错误不打断；等后端可用后用户可手动从历史打开
        });
    };

    if (stuck) {
      // 已结束但空 → 立刻补；仍在跑 → 稍候首拉后由重试覆盖晚完成的场景
      const delay = globalChatState.loading ? 400 : 0;
      setTimeout(restore, delay);
    }
  }, []);
  // 流式"逐字打字机"动画缓冲：
  //   后端 SSE 每个 delta 可能是很大的一块文本（DeepSeek 一次吐一大段），
  //   若直接 append 会"一下全出来"、没有打字机感觉。
  //   这里把 delta 先进 buffer，由定时器每次取 2 个字符弹到界面，
  //   无论后端块多大、多快到达，视觉上都是平滑逐字输出。
  //
  //   【关键】streamDone 标记后端是否已结束。结束后 buffer 里剩余的文本
  //   也必须由定时器"继续逐字弹完"，而不是一次性塞入——
  //   早期实现 onDone 时把剩余 buffer 全塞进 content，后端响应快时
  //   用户看到的就是"缓冲完一口气全出来"（打字机失效）。现在改为
  //   弹完后才自动收尾（清除定时器 + 结束 loading）。
  // 直接引用全局 streamBuffer（字符串是值类型，创建新对象会导致切回来时不同步）
  // 用一个全局代理对象，current 始终指向 globalChatState.streamBuffer
  const streamBuffer = new Proxy({} as { current: string }, {
    get: (_, prop) => prop === 'current' ? globalChatState.streamBuffer : undefined,
    set: (_, prop, value) => { if (prop === 'current') { globalChatState.streamBuffer = value; } return true; },
  });
  const streamRaf = useRef<number | null>(null);
  // streamDone 也用全局代理，切页面不丢状态
  const streamDone = new Proxy({} as { current: boolean }, {
    get: (_, prop) => prop === 'current' ? globalChatState.streamDone : undefined,
    set: (_, prop, value) => { if (prop === 'current') { globalChatState.streamDone = value; } return true; },
  });

  // 滚动到底部
  const scrollBottom = () => {
    setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }, 30);
  };

  const pushMsg = (m: ChatMsg) => {
    setMsgs((prev) => [...prev, m]);
    scrollBottom();
  };

  const updateLast = (patch: Partial<ChatMsg> | ((m: ChatMsg) => Partial<ChatMsg>)) => {
    setMsgs((prev) => {
      const next = [...prev];
      if (next.length) {
        const last = next[next.length - 1];
        next[next.length - 1] = {
          ...last,
          ...(typeof patch === 'function' ? patch(last) : patch),
        };
      }
      return next;
    });
  };

  // ===== 【企业级】打断收尾：保留已输出的回答，不清空、不覆盖 =====
  // 用户连发第二条 / 点「停止」时，旧请求被取消——但已经生成并打到屏幕上的内容
  // 应该像 ChatGPT/Claude 那样保留在对话里，而不是整段替换成"已取消"。
  // 做法：把打字机缓冲里"还没弹出来"的残余文本一并并入该消息，然后结束 streaming；
  // 只有真正一个字都没产出时，才给占位文案"（已停止）"。
  const flushRemainder = () => {
    if (streamRaf.current != null) {
      cancelAnimationFrame(streamRaf.current);
      streamRaf.current = null;
    }
    const remainder = streamBuffer.current;
    streamBuffer.current = '';
    updateLast((m) => {
      const content = (m.content || '') + remainder;
      return { content: content || '（已停止）', streaming: false };
    });
  };

  // ===== 流式逐字打字机：requestAnimationFrame 驱动 =====
  //   【关键】为什么不用 setInterval + setState 逐字？
  //   React 18 会对同一事件循环内的多次 setState 做自动批处理（合并成一次渲染），
  //   即使 setInterval 每 20ms 弹 2 字，68 次 setState 也可能只渲染 1 次 →
  //   用户看到"缓冲完一口气全出"。改用 requestAnimationFrame：
  //   每帧是独立的渲染时机，每帧 setState 都会真正提交一次渲染，保证逐字可见。
  const typewriterStep = () => {
    streamRaf.current = null;
    const buf = streamBuffer.current;
    if (buf.length > 0) {
      // 每帧弹出 2 个字符，形成"打字"节奏
      const take = buf.slice(0, 2);
      streamBuffer.current = buf.slice(2);
      updateLast((m) => ({ content: m.content + take }));
      scrollBottom(); // 每弹一次字都跟随滚动到底
    }
    if (streamBuffer.current.length === 0) {
      // 缓冲弹空：
      //   - 后端已结束 → 收尾（清状态 + 结束 loading）
      //   - 后端未结束 → 暂停，等下一批 delta 到来再重启（避免空转）
      if (streamDone.current) {
        updateLast({ streaming: false });
        scrollBottom();
      }
      return;
    }
    // 缓冲还有剩余 → 下一帧继续弹
    streamRaf.current = requestAnimationFrame(typewriterStep);
  };

  // 启动/重启打字机（幂等：已有 rAF 在跑则不重复创建）
  const ensureTypewriter = () => {
    if (streamRaf.current != null) return;
    streamRaf.current = requestAnimationFrame(typewriterStep);
  };

  // 后端结束：只标记 done；剩余缓冲由打字机继续逐字弹完，弹完自动收尾
  const finishStream = () => {
    streamDone.current = true;
    if (streamBuffer.current.length === 0 && streamRaf.current == null) {
      // 缓冲已空且无 rAF 在跑 → 直接收尾
      updateLast({ streaming: false });
      scrollBottom();
    } else if (streamBuffer.current.length > 0 && streamRaf.current == null) {
      // 缓冲还有剩余但 rAF 停了 → 重启把剩余弹完
      ensureTypewriter();
    }
  };

  // ===== 后端历史消息 → 界面消息（统一恢复/切换会话用）=====
  const toChatMsgs = (src: HistoryMessage[]): ChatMsg[] =>
    src.map((m) => ({
      id: ++msgSeq,
      role: m.role,
      content: m.content,
      sources: m.sources,
      confidence: m.confidence,
      hits: (m as HistoryMessage & { hits?: ChatHit[] }).hits,
      streaming: false,
    }));

  // ===== 取消在途流并"丢弃"（切身份/切会话/新建时用）：代际+1，旧回调不再写界面 =====
  const cancelStream = () => {
    genRef.current += 1; // 旧流回调将校验到代际变化而忽略 → 防串号
    abortRef.current?.abort();
    streamDone.current = true;
    if (streamRaf.current != null) {
      cancelAnimationFrame(streamRaf.current);
      streamRaf.current = null;
    }
    streamBuffer.current = '';
    setLoading(false);
    globalChatState.loading = false;
  };

  // ===== 设置"当前会话"（同步 state/ref/全局三处）=====
  const setThread = (tid: string) => {
    threadRef.current = tid;
    setThreadId(tid);
    globalChatState.threadId = tid;
  };

  // ===== 切换身份 = 切换会话空间（身份选择后进入：最近会话，没有则自动建空会话）=====
  const doSwitchIdentity = async (nextRaw: string) => {
    const next = (nextRaw || '').trim();
    if (!next) return;
    if (next === userId) return; // 同身份无动作（被删身份不会因失焦而复活；要新建请输入/选不同名字）
    cancelStream(); // 换身份先停当前在途流（防旧流写进新界面）
    setUserId(next);
    setCurrentUser(next); // 持久化身份（auth 抽象层）
    userIdRef.current = next; // 同步 ref（供"自动落位"等闭包读最新值）
    setMsgs([]);
    globalChatState.msgs = [];
    try {
      const list = await fetchSessions(next);
      if (list.length > 0) {
        // 服务端已按最近活跃倒序 → 打开最新一条
        const top = list[0];
        const res = await fetchSessionHistory(top.thread_id);
        setThread(top.thread_id);
        const restored = toChatMsgs(res.messages);
        setMsgs(restored);
        globalChatState.msgs = restored;
      } else {
        // 该身份还没有任何会话 → 自动新建一个空白会话作为当前工作台
        const r = await createSession(next);
        setThread(r.thread_id);
      }
      scrollBottom();
      message.info(`已切换到身份「${next}」`);
      refreshIdentityUsers(); // 新输入的名字已建会话 → 让下拉与监控台同步更新
    } catch (e) {
      message.error(`切换身份失败：${(e as Error).message}`);
    }
  };

  // 【并发去重】若已有"切身份"在途 → 复用它（等它把会话建好），
  // 避免"失焦触发一次建 A + 发送又触发一次建 B"→ 产生多余空会话。
  const switchIdentity = (nextRaw: string): Promise<void> => {
    if (switchPromiseRef.current) return switchPromiseRef.current;
    const p = Promise.resolve(doSwitchIdentity(nextRaw));
    switchPromiseRef.current = p;
    p.finally(() => { switchPromiseRef.current = null; });
    return p;
  };

  // ===== 身份输入提交：选中/回车/失焦都走这里（切换身份 = 进入其会话与偏好）=====
  const commitIdentity = async (raw: string) => {
    const v = (raw || '').trim();
    if (!v) {
      setIdDraft(userId); // 空 → 回退当前身份
      return;
    }
    await switchIdentity(v); // 同身份已在 switchIdentity 内 no-op
    setIdDraft(getCurrentUser());
  };

  // ===== 自动落位：当前身份若已失效 → 完全清空，不默认选人、不自动开别人的会话 =====
  // 规则：
  //  当前身份还在名单里 → 正常（若界面不是它则切到它）；
  //  当前身份已不在名单（被删/从未建）/ 为空 → 聊天页清空、身份清空，等你手动选或新建；
  //  绝不自动替用户选"第一个用户"。
  const goBlank = () => {
    setCurrentUser('');
    userIdRef.current = '';
    setUserId('');
    setIdDraft('');
    setThread('');
    threadRef.current = '';
    setMsgs([]);
    globalChatState.msgs = [];
    refreshIdentityUsers();
  };

  const ensureValidIdentity = async () => {
    const users = await listMemoryUsers().then((d) => d.users ?? []).catch(() => null);
    if (users === null) return; // 名单查不到就不动，避免误清
    const cur = (getCurrentUser() || '').trim();
    if (!cur) { goBlank(); return; }
    if (users.includes(cur)) {
      // 当前身份仍有效；若持久化身份与界面不一致（例如刚切换到它）→ 同步到界面
      if (cur !== userIdRef.current) {
        setCurrentUser(cur);
        await switchIdentity(cur);
      }
      return;
    }
    // 当前身份已不存在 → 清空，不默认选任何用户
    goBlank();
  };

  // 加载时若"当前身份有效但还没打开任何会话" → 自动回到该身份最近会话。
  // 解决：刷新/切回后若总是从空会话开始，同一身份会越问越裂成多个会话。
  const ensureCurrentSession = async () => {
    const cur = userIdRef.current || getCurrentUser() || '';
    if (!cur || threadRef.current) return;
    if (loading) return;
    try {
      const list = await fetchSessions(cur);
      if (list.length) {
        const top = list[0]; // 服务端已按最近活跃倒序
        const res = await fetchSessionHistory(top.thread_id);
        setThread(top.thread_id);
        const restored = toChatMsgs(res.messages);
        setMsgs(restored);
        globalChatState.msgs = restored;
        scrollBottom();
      }
    } catch {
      /* 拉不到就静默，不打断用户 */
    }
  };

  // 进入聊天页：先"自动落位"身份（删了的清空），身份有效再回到最近会话；
  // 切回可见时只做身份校验（不强制打断你正在输入的新会话）。
  React.useEffect(() => {
    const t = setTimeout(async () => {
      await ensureValidIdentity();
      await ensureCurrentSession();
    }, 0);
    const onVisible = () => { if (document.visibilityState === 'visible') ensureValidIdentity(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      clearTimeout(t);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, []);

  // ===== 历史会话：打开抽屉，拉取"当前身份名下"的会话列表 =====
  const openHistory = async () => {
    // 没选/没建用户 → 抽屉不许打开、也无数据可看（空身份不可能有"谁的会话"）
    const uid = userIdRef.current || getCurrentUser() || '';
    if (!uid) {
      message.warning('请先在顶栏选择或新建一个用户，再看历史');
      return;
    }
    setHistoryList([]);
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const list = await fetchSessions(uid); // 只列当前身份的会话（user/thread 分层）
      setHistoryList(list);
    } catch (e) {
      message.error(`读取会话列表失败：${(e as Error).message}`);
    } finally {
      setHistoryLoading(false);
    }
  };

  // ===== 打开某条会话：只切换"会话(thread)"，身份(userId)保持不变 =====
  const loadHistory = async (s: SessionInfo) => {
    // 【防呆】点开的正是"当前正在回答中"的会话 → 不打断、不覆盖
    if (threadRef.current === s.thread_id && loading) {
      message.info('该会话正在回答中，请稍候再查看～');
      return;
    }
    setHistoryLoading(true);
    try {
      if (threadRef.current !== s.thread_id) {
        cancelStream(); // 切到另一个会话：停当前在途流（代际+1，旧回调丢弃）
      }
      const res = await fetchSessionHistory(s.thread_id);
      const history = toChatMsgs(res.messages);
      setThread(s.thread_id); // 只切会话；身份仍是谁选的谁
      setMsgs(history);
      globalChatState.msgs = history;
      setHistoryOpen(false);
      scrollBottom();
      if (history.length === 0) message.info('该会话暂无有效消息');
    } catch (e) {
      message.error(`加载历史失败：${(e as Error).message}`);
    } finally {
      setHistoryLoading(false);
    }
  };

  // ===== 新建会话：给"当前身份"开一个新 thread（由后端生成并登记归属）=====
  const handleNewChat = async () => {
    // 没选/没建用户 → 不能建会话（后端会因空 user_id 返回 422），先引导选身份
    const uid = userIdRef.current || getCurrentUser() || '';
    if (!uid) {
      message.warning('请先在顶栏选择或新建一个用户（输入名字后回车），再新建会话');
      return;
    }
    cancelStream(); // 若有在途流先停（丢弃，防串号）
    try {
      const r = await createSession(uid);
      setThread(r.thread_id);
      setMsgs([]);
      globalChatState.msgs = [];
      message.success('已新建会话，可以开始提问了');
    } catch (e) {
      message.error(`新建会话失败：${(e as Error).message}`);
    }
  };

  // ===== 全局长期记忆：打开编辑框（加载当前正文） =====
  const openMemory = () => {
    setMemOpen(true);
    setMemText('');
    setMemLoading(true);
    fetchGlobalMemory()
      .then((d) => setMemText(d.content))
      .catch((e) => message.error('读取记忆失败：' + (e as Error).message))
      .finally(() => setMemLoading(false));
  };

  // ===== 全局长期记忆：保存（后端会自动清空接口缓存，保证下次提问即按新设定生成）=====
  const saveMemory = () => {
    setMemSaving(true);
    saveGlobalMemory(memText)
      .then(() => {
        message.success('已保存，下次提问生效（旧缓存已清空）');
        setMemOpen(false);
      })
      .catch((e) => message.error('保存失败：' + (e as Error).message))
      .finally(() => setMemSaving(false));
  };

  // ===== 删除历史会话（后端联动清理记忆库：短期三表 + 长期 store） =====
  const handleDeleteSession = async (s: SessionInfo) => {
    setDeletingThreadId(s.thread_id); // 删除中：按钮变 loading，防二次点击
    try {
      const res = await deleteSession(s.thread_id);
      // 先删除完再弹成功（用户体验：确认操作真正完成）
      message.success(`已删除会话 ${s.thread_id}`);
      // 删除后刷新"当前身份"名下会话
      const list = await fetchSessions(userId);
      setHistoryList(list);
      // 若删的正是当前正在查看的会话 → 清空当前会话（下次发送会自动补一个新会话）
      if (threadRef.current === s.thread_id) {
        cancelStream();
        setThread('');
        setMsgs([]);
        globalChatState.msgs = [];
      }
    } catch (e) {
      message.error(`删除失败：${(e as Error).message}`);
    } finally {
      setDeletingThreadId(null); // 删除完成（成功或失败）都清除加载状态
    }
  };

  // ===== 时间格式化：后端返回 ISO UTC（2026-09-04T11:23:44.502178+00:00），转成本地时区可读格式 =====
  const formatTs = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso; // 解析失败则原样返回
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  };

  // ===== 发送 =====

  const handleSend = async () => {
    const question = input.trim();
    if (!question) return;
    // ① 顶栏若还有"未提交的名字" → 先提交身份（切到它并建好当前会话），再发。
    //    解决"先输消息→再输用户→点发送"时 身份/会话竞态、多建空会话(0问0答"新对话")的问题。
    const draft = (idDraft || '').trim();
    if (draft && draft !== userIdRef.current) {
      await commitIdentity(draft);
    }
    // ② 身份以 ref 为准（state 是异步更新的，闭包里要用最新值，避免发错 user_id）
    const uid = userIdRef.current || getCurrentUser() || '';
    if (!uid) {
      message.warning('请先在顶栏选择或新建一个用户（输入名字后回车），再发送。');
      return;
    }
    // ③ 若"切身份"仍在途（失焦/回车刚触发、正在建会话）→ 等它完成，
    //    否则并发会多建一个空会话、消息落到另一个线程（历史裂开）。
    if (switchPromiseRef.current) {
      await switchPromiseRef.current;
    }
    // 【企业级交互】如果上一次请求还在进行，先取消再发新的
    // （输入框loading时不禁用，用户可以随时打断重发）
    if (loading) {
      abortRef.current?.abort();
      streamDone.current = true;
      // 【防呆】只收尾"正在生成中的那条"（最后一条 assistant 为空/仍转圈）
      const tail = msgs[msgs.length - 1];
      const tailIsInflight = !!tail && tail.role === 'assistant' && (!tail.content || tail.streaming);
      if (tailIsInflight) {
        flushRemainder(); // 打断保留已输出
      } else {
        streamBuffer.current = '';
      }
      setLoading(false);
      globalChatState.loading = false;
    }
    // ③ 确保有"当前会话"(thread)：没有则给当前身份新建一个（commitIdentity 建好了就直接用它）
    let tid = threadRef.current;
    if (!tid) {
      try {
        const r = await createSession(uid);
        tid = r.thread_id;
        setThread(tid);
      } catch (e) {
        message.error(`新建会话失败：${(e as Error).message}`);
        return;
      }
    }
    const gen = genRef.current; // 本次请求代际：中途切身份/新建会 +1 → 旧回调丢弃（防串号）
    let streamModelErr = false; // 流式里识别到"模型调用失败"原文 → 改为友好提示
    setInput('');
    pushMsg({ id: ++msgSeq, role: 'user', content: question });
    pushMsg({ id: ++msgSeq, role: 'assistant', content: '', streaming: true });
    setLoading(true);

    try {
      if (mode === 'structured') {
        // ---- 结构化模式：RAG + Agent + ToolStrategy ----
        const res = await sendChat({ question, user_id: uid, thread_id: tid, top_k: CFG.retrieveTopK });
        if (genRef.current !== gen) return; // 期间切走则丢弃结果
        updateLast({
          content: res.answer,
          sources: res.sources,
          confidence: res.confidence,
          hits: res.hits,
          elapsed_ms: res.elapsed_ms,
          streaming: false,
        });
        scrollBottom();
      } else {
        // ---- 流式模式：SSE 真实打字机 ----
        abortRef.current = new AbortController();
        globalChatState.abortController = abortRef.current;
        streamDone.current = false;
        globalChatState.streamDone = false;
        await streamChat(
          { question, user_id: uid, thread_id: tid, top_k: CFG.retrieveTopK },
          {
            onDelta: (text) => {
              if (genRef.current !== gen) return; // 已切走：丢弃该增量，防写进新会话
              // 识别"模型重试失败"的原始错误文案（如 Model call failed / AssertionError），
              // 不播原文，稍后由 onDone 统一替换成友好提示
              if (text.includes('Model call failed') || text.includes('AssertionError')) {
                streamModelErr = true;
                return;
              }
              streamBuffer.current += text;
              ensureTypewriter();
            },
            onMeta: (data) => {
              if (genRef.current !== gen) return;
              if (Array.isArray(data.hits) && data.hits.length > 0) {
                updateLast({ hits: data.hits as ChatHit[] });
              }
            },
            onError: (msg) => {
              if (genRef.current === gen) message.error(msg);
            },
            onDone: () => {
              if (genRef.current !== gen) return;
              finishStream(); // 只标记结束，剩余缓冲继续逐字弹完
              if (streamModelErr) {
                // 模型调用失败：把气泡替换成友好文案（不再显示中间件原始报错）
                setLoading(false);
                globalChatState.loading = false;
                updateLast({
                  content: '抱歉，回答服务暂时出了点问题（模型未返回有效内容），请稍后重试或换个问法。',
                  streaming: false,
                });
              }
            },
          },
          abortRef.current.signal,
        );
      }
    } catch (e) {
      const err = e as Error;
      if (genRef.current === gen && err.name !== 'AbortError') {
        finishStream();
        updateLast({ content: `\n（请求失败：${err.message}）`, streaming: false });
      }
    } finally {
      if (genRef.current === gen) {
        setLoading(false);
        globalChatState.loading = false;
      }
    }
  };

  // ===== 渲染助手消息（含引用来源卡片） =====
  const renderAssistant = (m: ChatMsg) => (
    <div className="chat-bubble assistant">
      <div className="chat-role">
        <RobotOutlined /> {SITE.assistantName}
        {m.elapsed_ms != null && <span className="chat-time">耗时 {m.elapsed_ms}ms</span>}
      </div>
      <div className="chat-text">
        {m.content || (m.streaming ? <Spin size="small" /> : '')}
      </div>
      {/* 引用来源 + 置信度 */}
      {(m.sources && m.sources.length > 0) || m.confidence != null ? (
        <div className="chat-refs">
          <Space size={6} wrap style={{ marginBottom: 6 }}>
            {m.confidence != null && (
              <Tag color={m.confidence >= 0.7 ? 'green' : m.confidence >= 0.4 ? 'orange' : 'red'}>
                置信度 {(m.confidence * 100).toFixed(0)}%
              </Tag>
            )}
            {(m.sources || []).map((s) => (
              <Tag key={s} color="blue">
                <DatabaseOutlined /> {s}
              </Tag>
            ))}
          </Space>
          {m.hits && m.hits.length > 0 && (
            <Collapse
              size="small"
              ghost
              items={[
                {
                  key: 'hits',
                  label: `查看检索命中片段（${m.hits.length} 条）`,
                  children: (
                    <div className="hit-list">
                      {m.hits.map((h, i) => (
                        <div className="hit-item" key={i}>
                          <div className="hit-meta">
                            <Tag color="geekblue">#{i + 1}</Tag>
                            <span>{h.source}</span>
                            <Tag color="purple">score {h.score}</Tag>
                          </div>
                          <div className="hit-text">{h.text}</div>
                        </div>
                      ))}
                    </div>
                  ),
                },
              ]}
            />
          )}
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="chat-panel">
      {/* 顶栏：左=会话/设定操作，右=当前身份 ID（决定短期对话历史 & 长期偏好归属） */}
      <div className="chat-toolbar">
        <Space size={6} wrap>
          <Button type="primary" ghost icon={<PlusOutlined />} onClick={handleNewChat} disabled={!userId}>
            新建会话
          </Button>
          <Button icon={<HistoryOutlined />} onClick={openHistory} disabled={!userId}>
            历史会话
          </Button>
          <Tooltip title="类似 Claude Code 的 CLAUDE.md / 助手的「自定义指令」：在这里写的内容，每次提问都会自动带给助手（全局一份，不分会话、不分用户）">
            <Button icon={<SettingOutlined />} onClick={openMemory}>
              全局设定
            </Button>
          </Tooltip>
        </Space>
        <div className="chat-id">
          <span className="chat-id-label">身份</span>
          <Tooltip
            title={
              '身份 = "我是谁"（决定长期偏好 Store 的归属；进入后自动打开该身份最近会话）。\n' +
              '新建会话 = 在当前身份下另开一段对话（thread 系统自动生成）。\n' +
              '短期记忆按"会话"存、长期偏好按"身份"存、全局设定不分人每轮注入。'
            }
          >
            <AutoComplete
              className="chat-id-input"
              value={idDraft}
              options={identityOptions.map((u) => ({ value: u }))}
              placeholder="选已有身份；或输入新名字后 回车/点出 = 创建新用户"
              onChange={(v) => setIdDraft(v ?? '')}
              onSelect={(v) => commitIdentity(v)}
              onBlur={() => commitIdentity(idDraft)}
              onDropdownVisibleChange={(open) => {
                if (open) refreshIdentityUsers(); // 打开即刷新：监控台刚删的，这里立刻消失
              }}
              allowClear
            />
          </Tooltip>
        </div>
      </div>
      {/* 记忆分层语义说明（身份/会话/全局各管各，一目了然） */}
      <div className="chat-id-caption">
        <RobotOutlined /> 身份 <b>{userId}</b> · 当前会话{' '}
        {threadId ? <b style={{ color: '#1677ff' }}>{threadId.slice(0, 8)}…</b> : '（尚未开始，发送将自动新建）'}
        —— 短期记忆按<b>会话</b>存、长期偏好按<b>身份</b>存、全局设定不分人每轮注入。切换身份=进入 ta 的会话与偏好；「新建会话」= 给当前身份另开一段。
        <Tooltip title={'短期=PostgresSaver(checkpointer)按 thread 存；长期=PostgresStore(store)按 users.<身份>.preferences 存；全局设定文件不分人，每轮注入。'}>
          <QuestionCircleOutlined style={{ color: '#bfbfbf', marginLeft: 6, cursor: 'help' }} />
        </Tooltip>
      </div>

      {/* 消息列表 */}
      <div className="chat-list" ref={listRef}>
        {msgs.length === 0 && (
          <div className="chat-empty">
            <RobotOutlined style={{ fontSize: 40, color: '#bfbfbf' }} />
            <p>{SITE.greeting}</p>
            <p className="chat-hint">{SITE.quickHint}</p>
          </div>
        )}
        {msgs.map((m) =>
          m.role === 'user' ? (
            <div className="chat-bubble user" key={m.id}>
              <div className="chat-role">
                <UserOutlined /> {userId}
              </div>
              <div className="chat-text">{m.content}</div>
            </div>
          ) : (
            <div key={m.id}>{renderAssistant(m)}</div>
          ),
        )}
      </div>

      {/* 输入区 */}
      <div className="chat-input">
        <Input.TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入你的问题，Enter 发送 / Shift+Enter 换行"
          autoSize={{ minRows: 1, maxRows: 6 }} // 输入框随内容增长、过长自动换行（不无限拉高）
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          // 【企业级交互】loading时不禁用输入框：用户可以继续输入，
          // 点击发送时自动取消上一次请求（见 handleSend 开头）
        />
        {/* 【企业级交互】流式模式下：发送中显示"终止"按钮，点击可中断当前请求 */}
        {mode === 'stream' && loading ? (
          <Button
            danger
            icon={<StopOutlined />}
            onClick={() => {
              abortRef.current?.abort();
              streamDone.current = true;
              // 【企业级】「停止」同样只收尾正在生成的那条，已完成的历史轮次不动
              const tail = msgs[msgs.length - 1];
              const tailIsInflight = !!tail && tail.role === 'assistant' && (!tail.content || tail.streaming);
              if (tailIsInflight) flushRemainder();
              else streamBuffer.current = '';
              setLoading(false);
              message.info('已停止回答');
            }}
          >
            终止
          </Button>
        ) : (
          <Button type="primary" icon={<SendOutlined />} onClick={handleSend}>
            发送
          </Button>
        )}
      </div>
      {/* ===== 历史会话抽屉（LangGraph PostgresSaver 记忆回放） ===== */}
      <Drawer
        title="历史会话"
        placement="right"
        width={380}
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      >
        <Spin spinning={historyLoading}>
          {historyList.length === 0 ? (
            <Empty description="暂无历史会话" />
          ) : (
            <List
              dataSource={historyList}
              renderItem={(s) => (
                <List.Item
                  style={{ cursor: 'pointer', padding: '10px 4px' }}
                  onClick={() => loadHistory(s)}
                  actions={[
                    // 删除按钮：冒泡拦截，避免触发整行 onClick(loadHistory)
                    <Popconfirm
                      key="del"
                      title="删除该会话？"
                      description="删除该会话的短期记忆与历史；该身份的长期偏好(Store)会保留。不可恢复。"
                      okText="删除"
                      okButtonProps={{ danger: true }}
                      cancelText="取消"
                      onConfirm={(e) => {
                        if (e) e.stopPropagation();
                        handleDeleteSession(s);
                      }}
                    >
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        loading={deletingThreadId === s.thread_id}
                        disabled={deletingThreadId !== null && deletingThreadId !== s.thread_id}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space wrap>
                        <span>{s.title}</span>
                        <Tag color="blue">{s.thread_id}</Tag>
                      </Space>
                    }
                    description={`${s.user_msgs} 问 / ${s.assistant_msgs} 答 · ${formatTs(s.last_ts)}`}
                  />
                </List.Item>
              )}
            />
          )}
        </Spin>
      </Drawer>

      {/* ===== 全局设定编辑框（类似 CLAUDE.md / 自定义指令） ===== */}
      <Modal
        title="全局设定（类似 CLAUDE.md / 自定义指令）"
        open={memOpen}
        onCancel={() => setMemOpen(false)}
        onOk={saveMemory}
        okText="保存"
        confirmLoading={memSaving}
        width={680}
        maskClosable={false}
      >
        <Spin spinning={memLoading}>
          <p style={{ color: '#888', marginBottom: 8 }}>
            写在这里的内容 = 你对助手的"总设定/人格与规则"，每次提问都会自动带上（<b>全局一份，不分会话、不分用户</b>）。
            它和 Store 长期记忆不同：Store 是 AI 按"身份 ID"自动记某个人的偏好；这里是你不分对象手写的总纲。
            保存后旧缓存自动清空，下次提问立即按新设定回答。
          </p>
          <Input.TextArea
            value={memText}
            onChange={(e) => setMemText(e.target.value)}
            placeholder={SITE.inputPlaceholder}
            autoSize={{ minRows: 3, maxRows: 18 }} // 初始不铺太高，随内容增长、过长换行
            disabled={memLoading}
          />
        </Spin>
      </Modal>
    </div>
  );
};

export default ChatPanel;
