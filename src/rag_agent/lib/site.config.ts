/**
 * site.config.ts —— 前端"站点级"配置（换学校/换场景时只改这里，逻辑不动）
 *
 * 用法：所有"某某大学/某某助手/引导语"等字样统一从这里取；
 * 换学校/换场景 = 改本文件（或改成读后端下发的配置），不碰组件逻辑。
 */
export const SITE = {
  // ---- 换学校/换场景，主要改这一组 ----
  school: '陕西理工大学', // 学校名称
  appLabel: '智能校务问答', // 品牌后半（如"智能校务问答"）
  assistantName: '校务助手', // 助手身份称呼
  // ---- 由上面字段拼出来的文案（一般不用手改） ----
  navBrand: '陕西理工大学 · 智能校务问答', // 顶栏品牌
  greeting: '你好，我是陕西理工大学校务助手，可以问我招生、教务、奖助学金、毕业学位等问题。',
  inputPlaceholder:
    '例如：\n我是陕西理工大学计算机学院研究生，正在准备秋招；\n回答请尽量简洁、分点；\n请称呼我为「同学」。',
  // ---- 场景相关的"快捷示例问题"（换场景：改成你希望用户上来就问的示例） ----
  quickExamples: ['国家奖学金多少钱？', '如何申请生源地助学贷款？'],
  quickHint: '',
};

// 让上面拼出的字段与 school/appLabel/assistantName 保持同步：
SITE.navBrand = `${SITE.school} · ${SITE.appLabel}`;
SITE.greeting = `你好，我是${SITE.school}${SITE.assistantName}，可以问我招生、教务、奖助学金、毕业学位等问题。`;
SITE.inputPlaceholder =
  `例如：\n我是${SITE.school}计算机学院研究生，正在准备秋招；\n回答请尽量简洁、分点；\n请称呼我为「同学」。`;
SITE.quickHint = `试试：${SITE.quickExamples.map((q) => `「${q}」`).join('')}`;

/**
 * CFG —— 前端"运行时参数"（请求/轮询/默认阈值等"量"）
 * 换环境/换场景想改这些量，只改这里，组件逻辑不动。
 */
export const CFG = {
  apiTimeoutMs: 90_000, // axios 请求超时（毫秒）
  retrieveTopK: 6, // 提问默认检索召回条数（与后端 RETRIEVE_TOP_K 对应）
  semanticThresholdDefault: 0.85, // 监控台语义缓存阈值初始/回退值
  indexPollMs: 2000, // 全量建索引进度轮询间隔（毫秒）
};

export default SITE;
