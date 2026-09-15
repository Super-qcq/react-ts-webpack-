import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Descriptions, Button, message, Space, InputNumber, Input, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DatabaseOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ToolOutlined,
  RobotOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  ClearOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { AuditLog, MonitorOverview, CacheCluster, CacheAlias } from '../../../types';
import { fetchMonitor, setSemanticThreshold, listMemoryPrefs, addMemoryPref, deleteMemoryPref, deleteMemoryUser, listMemoryUsers } from '../../../api';
import type { MemoryPref } from '../../../api';
import { getCurrentUser, setCurrentUser } from '../../../lib/auth';
import { CFG } from '../../../lib/site.config';
import axios from 'axios';
import '../style/index.less';

/**
 * MonitorPanel — 监控总览面板
 * 展示：向量库统计 / 会话统计 / 审计调用链 / 运行配置
 */
const MonitorPanel = () => {
  const [data, setData] = useState<MonitorOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [, setTick] = useState(0);            // 倒计时刷新节拍（每秒触发一次重渲染）
  const [loadedAt, setLoadedAt] = useState(0); // 最近一次数据加载完成的时刻(ms)，用于本地推进剩余时间
  // ===== 语义缓存命中阈值（运行时热调，同义命中灵敏度）=====
  const [thrDraft, setThrDraft] = useState(CFG.semanticThresholdDefault);
  const [thrSaving, setThrSaving] = useState(false);
  // ===== 长期记忆 store（PostgresStore · 按用户偏好）=====
  const [memItems, setMemItems] = useState<MemoryPref[]>([]);
  const [memLoad, setMemLoad] = useState(false);
  const [memSaving, setMemSaving] = useState(false);
  const [memUsers, setMemUsers] = useState<string[]>([]); // 已存在的用户（下拉可选，不手填）
  const [memU, setMemU] = useState<string>(''); // 选中的用户：表格只显示他、也对他增/改/删（清空=显示全部）
  const [memKeys, setMemKeys] = useState<string[]>([]); // 该用户已存的偏好键（key 下拉候选）
  const [keySearch, setKeySearch] = useState(''); // key 搜索词（用于"列表没有可新建"）
  const [memK, setMemK] = useState('');
  const [memV, setMemV] = useState('');

  const loadMemory = () => {
    setMemLoad(true);
    listMemoryPrefs()
      .then((d) => setMemItems(d.items ?? []))
      .catch((e) => message.error('读取长期记忆失败：' + e.message))
      .finally(() => setMemLoad(false));
  };

  // 选中某用户后，拉取其已存偏好键作为"key 下拉"候选（也允许输入新 key）
  const loadKeysOf = (u: string) => {
    if (!u) {
      setMemKeys([]);
      return;
    }
    listMemoryPrefs(u)
      .then((d) => setMemKeys(Array.from(new Set((d.items || []).map((it) => it.key)))))
      .catch(() => setMemKeys([]));
  };

  const loadUsers = () => {
    listMemoryUsers()
      .then((d) => setMemUsers(d.users ?? []))
      .catch(() => {
        /* 拉取用户列表失败不打扰，手动行会被禁用 */
      });
  };

  useEffect(() => {
    loadMemory();
    loadUsers();
  }, []);

  // 【体验】新增/编辑行默认选中"聊天页当前身份"（若是真实存在的用户），并自动带出其偏好键；
  // 仍可下拉切换其它真实用户（监控台 = 管理视角，能看全部）。
  useEffect(() => {
    if (memU || memUsers.length === 0) return;
    const cur = getCurrentUser();
    if (memUsers.includes(cur)) {
      setMemU(cur);
      loadKeysOf(cur);
    }
  }, [memUsers]);

  // 手动写入一条长期偏好（只能给"已存在的用户"设置，见下拉来源 listMemoryUsers）
  const addPref = () => {
    if (!memU) {
      message.warning('请先从下拉选择一个用户（需先让该用户在对话里聊过/新建过会话）');
      return;
    }
    if (!memK.trim() || !memV.trim()) {
      message.warning('请填写 key 和 value');
      return;
    }
    setMemSaving(true);
    addMemoryPref(memU, memK.trim(), memV.trim())
      .then(() => {
        message.success(`已写入 ${memU}：${memK.trim()} = ${memV.trim()}`);
        setMemK('');
        setMemV('');
        setKeySearch('');
        loadMemory();
        loadKeysOf(memU); // 刷新该用户的 key 候选（刚可能新增了键）
        load(); // 后端已清该用户缓存 → 缓存监控表刷新
      })
      .catch((e) => message.error('写入失败：' + e.message))
      .finally(() => setMemSaving(false));
  };

  // 切换"新增行"的用户 → 重置键/值并拉取该用户的键
  const changeUser = (u: string) => {
    const uid = u ?? '';
    setMemU(uid);
    setMemK('');
    setMemV('');
    setKeySearch('');
    loadKeysOf(uid);
  };

  // 选"已有键" → 把当前值载入输入框（可改可加=覆盖更新）；输入新键 → 清空让用户填新值
  const changeKey = (k: string | undefined) => {
    const key = k ?? '';
    setMemK(key);
    setKeySearch('');
    const item = memItems.find((i) => i.user_id === memU && i.key === key);
    setMemV(item ? item.value : '');
  };

  // 级联删除一个身份(用户)：长期偏好 + 名下所有会话历史 + 归属登记（二次确认）
  const delUser = () => {
    if (!memU) {
      message.warning('请先选择一个用户');
      return;
    }
    if (!window.confirm(`确定删除用户「${memU}」吗？\n将级联删除：\n· 其全部长期偏好\n· 其名下所有会话与短期历史\n此操作不可恢复！`)) return;
    deleteMemoryUser(memU)
      .then(() => {
        message.success(`已删除用户 ${memU} 的全部数据`);
        // 若删的正是"聊天页当前身份"，把持久化的当前身份清空——
        // 回到聊天页后会自动变成"空白新会话、不默认选任何用户"（由 ChatPanel 自动落位处理）
        if (getCurrentUser() === memU) {
          setCurrentUser('');
        }
        setMemU('');
        setMemK('');
        setMemV('');
        setMemKeys([]);
        loadMemory();
        loadUsers();
        load(); // 该用户缓存/统计已被后端清 → 缓存监控表立即刷新（不再要点"刷新"）
      })
      .catch((e) => message.error('删除失败：' + e.message));
  };

  // 删除一条长期偏好
  const delPref = (userId: string, key: string) => {
    deleteMemoryPref(userId, key)
      .then(() => {
        message.success(`已删除 ${userId} 的 ${key}`);
        loadMemory();
        load(); // 偏好变了 → 该用户缓存已被后端清，缓存表同步刷新
      })
      .catch((e) => message.error('删除失败：' + e.message));
  };

  const load = () => {
    setLoading(true);
    // 缓存/命中统计"跟着当前选中的用户走"（选空=全部）
    fetchMonitor(memU || undefined)
      .then((d) => {
        setData(d);
        setLoadedAt(Date.now()); // 记录本次数据的时间基点
        // 回显当前生效的语义阈值（来自 .env 默认 或 页面热调覆盖）
        const cur = Number(d.config?.semantic_threshold);
        if (!Number.isNaN(cur)) setThrDraft(cur);
      })
      .catch((e) => message.error('加载监控失败：' + e.message))
      .finally(() => setLoading(false));
  };

  // 应用新的语义命中阈值（调低 → 同义问题更容易并中缓存，但误命中风险略升）
  const applyThreshold = () => {
    setThrSaving(true);
    setSemanticThreshold(thrDraft)
      .then((res) => {
        message.success(`已生效：语义命中阈值 ≥ ${res.current}`);
        load();
      })
      .catch((e) => message.error('阈值调整失败：' + e.message))
      .finally(() => setThrSaving(false));
  };

  // 清空缓存：选了用户=只清该用户；没选=清全部
  const handleClearCache = () => {
    const scope = memU ? `用户「${memU}」` : '全部用户';
    const ask = memU
      ? `确定清空 ${scope} 的缓存与命中统计吗？（不影响其它用户）`
      : '确定清空【全部用户】的缓存吗？此操作不可撤销！';
    if (window.confirm(ask)) {
      const q = memU ? `?user_id=${encodeURIComponent(memU)}` : '';
      axios.delete(`/kb-api/cache${q}`)
        .then((res) => {
          if (res.data.ok) {
            message.success(`已清空 ${scope} 缓存（${res.data.deleted} 条）`);
            load();
          } else {
            message.error('清空失败: ' + (res.data.error || 'Unknown'));
          }
        })
        .catch((e) => message.error('清空失败: ' + e.message));
    }
  };

  useEffect(() => {
    load(); // 挂载 & 切换选中用户时都刷新（缓存跟着当前选中用户走）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memU]);

  // 【剩余时间动态倒计时】每秒触发一次重渲染；"剩余时间"列在本地用 loadedAt 推进
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const auditColumns: ColumnsType<AuditLog> = [
    {
      title: '类型',
      dataIndex: 'type',
      width: 90,
      render: (t: string) =>
        t === 'model' ? <Tag color="blue"><RobotOutlined /> 模型</Tag> : <Tag color="green"><ToolOutlined /> 工具</Tag>,
    },
    {
      title: '工具 / 模型',
      dataIndex: 'tool',
      render: (v, r) => v || r.model || '-',
    },
    {
      title: '参数摘要',
      dataIndex: 'args',
      render: (args?: Record<string, string>) =>
        args ? Object.entries(args).map(([k, v]) => `${k}=${v}`).join(', ') : '-',
    },
    {
      title: '耗时(ms)',
      dataIndex: 'elapsed_ms',
      width: 110,
      align: 'right',
      render: (v?: number) => (v != null ? v : '-'),
    },
    {
      title: '状态',
      dataIndex: 'ok',
      width: 90,
      align: 'center',
      render: (v?: boolean) => (v ? <Tag color="green">成功</Tag> : <Tag color="red">失败</Tag>),
    },
    {
      title: '时间',
      dataIndex: 'ts',
      width: 160,
      render: (v?: string) => v || '-',
    },
  ];

  // 【语义簇监控】展开子表：这份答案下有哪些问法、各自如何命中
  const aliasColumns: ColumnsType<CacheAlias> = [
    {
      title: '问法', dataIndex: 'question', ellipsis: true,
      render: (q: string, r: CacheAlias) => {
        // 纯"相近命中间接问法"：没被原样再问、也不是母答案本身 → 标注它其实触发过命中(计入母记录)
        const mergedIntoMother = !r.is_source && r.exact_hit === 0 && r.source_hit === 0 && !!r.last_hit_at;
        return (
          <span>
            {q}
            {r.is_source && <Tag color="geekblue" style={{ marginLeft: 6 }}>母答案</Tag>}
            {mergedIntoMother && <Tag color="purple" style={{ marginLeft: 6 }}>相近命中·计入母记录</Tag>}
          </span>
        );
      },
    },
    {
      title: '原句再问', dataIndex: 'exact_hit', width: 100, align: 'center',
      render: (v: number) => (v > 0 ? <Tag color="green">{v}次</Tag> : <span style={{ color: '#bfbfbf' }}>—</span>),
    },
    {
      title: '被相近问法命中', dataIndex: 'source_hit', width: 140, align: 'center',
      render: (v: number, r: CacheAlias) => (r.is_source && v > 0 ? <Tag color="blue">{v}次</Tag>
        : <span style={{ color: '#bfbfbf' }}>—</span>),
    },
    { title: '最近命中', dataIndex: 'last_hit_at', width: 165, render: (v?: string) => v || '-' },
  ];

  // 【语义簇监控】缓存表格列：一行 = 一份答案（同一份 answer 被同义问法复用会聚成一行）
  const clusterColumns: ColumnsType<CacheCluster> = [
    { title: '代表问题', dataIndex: 'representative', ellipsis: true },
    {
      title: '答案摘要', dataIndex: 'answer_preview', ellipsis: true,
      render: (v: string) => (v ? <span style={{ color: '#595959' }}>{v}</span> : '-'),
    },
    {
      title: '总命中', dataIndex: 'total_hit', width: 90, align: 'center',
      render: (v: number) => (v > 0 ? <Tag color="green">{v}次</Tag> : <Tag color="default">0次</Tag>),
    },
    {
      title: '同义问法', dataIndex: 'aliases', width: 100, align: 'center',
      render: (_: any, r: CacheCluster) => <Tag color="purple">{r.aliases.length} 个</Tag>,
    },
    {
      title: '存储', dataIndex: 'storage', width: 100, align: 'center',
      render: (v: string) => {
        if (v === 'PG+Redis') return <Tag color="geekblue">PG+Redis</Tag>;
        if (v === 'PG') return <Tag color="blue">PG 本体</Tag>;
        return <Tag color="red">Redis</Tag>;
      },
    },
    { title: '最近命中', dataIndex: 'last_hit_at', width: 160, render: (v?: string) => v || '-' },
    { title: '存入时间', dataIndex: 'stored_at', width: 165 },
    {
      title: '剩余时间', dataIndex: 'age_seconds', width: 100, align: 'right',
      render: (v: number) => {
        const ttl = cache?.ttl_seconds || 3600;
        // 【动态倒计时】age_seconds 是取数据那一刻的快照；用 loadedAt 把秒数在本地持续推进
        const elapsed = loadedAt ? Math.floor((Date.now() - loadedAt) / 1000) : 0;
        const remain = Math.max(0, ttl - (v || 0) - elapsed);
        const min = Math.floor(remain / 60);
        const sec = remain % 60;
        return <span style={{ color: remain < 300 ? '#faad14' : '#52c41a' }}>{min}分{sec}秒</span>;
      },
    },
  ];

  // ===== 长期记忆 store 列：展示每个用户"被记住了什么" =====
  const memColumns: ColumnsType<MemoryPref> = [
    { title: '用户', dataIndex: 'user_id', width: 170, render: (v: string) => <Tag color="geekblue">{v}</Tag> },
    { title: '偏好键', dataIndex: 'key', width: 150, render: (v: string) => <b>{v}</b> },
    { title: '值', dataIndex: 'value', ellipsis: true },
    { title: '更新时间', dataIndex: 'updated_at', width: 175, render: (v?: string) => v || '-' },
    {
      title: '操作', width: 70, align: 'center',
      render: (_: any, r: MemoryPref) => (
        <Button type="text" danger size="small" onClick={() => delPref(r.user_id, r.key)}>
          删除
        </Button>
      ),
    },
  ];

  const cfg = data?.config;
  // 缓存/命中统计严格跟着"选中用户"走：没选用户 → 不显示任何缓存
  const cache = memU ? data?.cache_stats : null;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>
          刷新
        </Button>
      </Space>

      {/* 顶部统计卡 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="向量库分块数"
              value={data?.chunk_count ?? 0}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="知识库来源文件" value={data?.sources.length ?? 0} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="成功会话"
              value={data?.session_stats.ok ?? 0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="平均耗时(ms)"
              value={data?.session_stats.avg_elapsed_ms ?? 0}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="接口缓存命中率（命中=未调模型）"
              value={cache?.interface_cache?.hit_rate ?? 0}
              suffix="%"
              valueStyle={{ color: (cache?.interface_cache?.hit_rate ?? 0) > 0 ? '#52c41a' : '#bfbfbf' }}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 审计调用链 */}
        <Col span={16}>
          <Card
            size="small"
            title="中间件审计调用链（模型 / 工具）"
            className="monitor-card"
          >
            <Table<AuditLog>
              rowKey={(r, i) => `${i}-${r.ts}`}
              columns={auditColumns}
              dataSource={data?.audit_logs ?? []}
              size="small"
              pagination={{ pageSize: 8, showSizeChanger: false }}
              scroll={{ y: 320 }}
            />
          </Card>
        </Col>

        {/* 运行配置 */}
        <Col span={8}>
          <Card size="small" title="运行配置" className="monitor-card">
            {cfg ? (
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="对话模型">{cfg.chat_model} ({cfg.chat_provider})</Descriptions.Item>
                <Descriptions.Item label="嵌入模型">{cfg.embed_model} · {cfg.embed_dim}维</Descriptions.Item>
                <Descriptions.Item label="向量库">{cfg.milvus_uri} / {cfg.milvus_collection}</Descriptions.Item>
                <Descriptions.Item label="切割参数">chunk={cfg.chunk_size} overlap={cfg.chunk_overlap}</Descriptions.Item>
                <Descriptions.Item label="检索 Top-K / 阈值">{cfg.retrieve_top_k} / {cfg.score_threshold}</Descriptions.Item>
                <Descriptions.Item label="模型调用上限">{cfg.model_call_limit}</Descriptions.Item>
                <Descriptions.Item label="摘要触发">{cfg.summary_trigger_tokens} tokens</Descriptions.Item>
                <Descriptions.Item label="记忆库">{cfg.db_url}</Descriptions.Item>
                <Descriptions.Item label="缓存开关">{cfg.cache_enabled ? '已开启' : '已关闭'}</Descriptions.Item>
                <Descriptions.Item label="缓存过期时间">{cfg.cache_ttl}</Descriptions.Item>
                <Descriptions.Item label="缓存最大条目">{cfg.cache_max_entries} 条</Descriptions.Item>
                <Descriptions.Item label="Redis 地址">{cfg.redis_host} (DB {cfg.redis_db})</Descriptions.Item>
                <Descriptions.Item label="语义缓存阈值">相似度 ≥ {cfg.semantic_threshold}</Descriptions.Item>
              </Descriptions>
            ) : (
              '暂无配置数据'
            )}
          </Card>
        </Col>
      </Row>

      {/* 缓存条目表格（展示当前内存中有哪些问题被缓存了） */}
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            size="small"
            title={
              <Space>
                <span>响应缓存（接口层面短路拦截{memU ? ` · 仅 ${memU}` : ' · 未选择用户'}）</span>
                <Tag color="green">命中率 {(cache?.interface_cache?.hit_rate ?? 0)}%（{cache?.interface_cache?.hit_count ?? 0} 次命中 = 省下 {cache?.interface_cache?.saved_calls ?? 0} 次模型调用）</Tag>
                <Tag color="orange">未命中 {cache?.interface_cache?.miss_count ?? 0}</Tag>
                <Tag color="purple">{cache?.interface_cache?.cluster_count ?? 0} 份答案</Tag>
                <Tag color="default">TTL {cache?.ttl_seconds ?? 0}s</Tag>
              </Space>
            }
            extra={
              <Button
                type="text"
                size="small"
                danger
                icon={<ClearOutlined />}
                onClick={handleClearCache}
              >
                {memU ? `清空${memU}的缓存` : '清空全部缓存'}
              </Button>
            }
            className="monitor-card"
          >
            {/* 语义命中阈值热调：.env 作默认，这里运行时生效（影响之后提问） */}
            <div
              style={{
                marginBottom: 12,
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ color: '#595959' }}>语义命中阈值 ≥</span>
              <InputNumber
                min={0.5}
                max={0.95}
                step={0.01}
                value={thrDraft}
                onChange={(v) => setThrDraft(v ?? CFG.semanticThresholdDefault)}
                style={{ width: 90 }}
                disabled={thrSaving}
              />
              <Button size="small" type="primary" loading={thrSaving} onClick={applyThreshold}>
                应用
              </Button>
              <span style={{ color: '#bfbfbf', fontSize: 12 }}>
                调低 → 同义问题更容易命中同一份缓存（如「地址是」≈「学校在哪里」）；仅影响之后的提问
              </span>
            </div>
            <Table<CacheCluster>
              rowKey="sig"
              columns={clusterColumns}
              dataSource={cache?.interface_cache?.clusters ?? []}
              size="small"
              pagination={{ pageSize: 10, showSizeChanger: false }}
              expandable={{
                expandedRowRender: (r) => (
                  <Table<CacheAlias>
                    rowKey={(a, i) => `${i}-${a.question}`}
                    columns={aliasColumns}
                    dataSource={r.aliases ?? []}
                    size="small"
                    pagination={false}
                  />
                ),
                rowExpandable: (r) => (r.aliases ?? []).length > 1,
              }}
              locale={{ emptyText: memU ? '暂无缓存（提问后会自动缓存最终回答）' : '未选择用户：先在「选择用户」里选一个（或新建）再查看其缓存' }}
            />
          </Card>
        </Col>
      </Row>

      {/* ===== 长期记忆 store（PostgresStore · 按用户偏好）===== */}
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            size="small"
            title={
              <Space>
                <span>长期记忆（PostgresStore · 按用户偏好）</span>
                <Tag color="blue">AI 自动记</Tag>
                <Tag color="green">跨会话生效</Tag>
              </Space>
            }
            extra={
              <Button size="small" icon={<ReloadOutlined />} onClick={loadMemory}>
                刷新
              </Button>
            }
            className="monitor-card"
          >
            <p style={{ color: '#888', marginBottom: 8, fontSize: 12 }}>
              在聊天里说「我是计算机学院大三学生」这类身份/偏好 → 系统会把它存到该身份的长期画像（归属 = 当前身份）。
              新增/编辑<b>只能从"已存在的用户"里选</b>（在对话里聊过/新建过会话才会出现），不能凭空造用户。
              新增行默认用当前聊天身份；选已有键会载入当前值，改后保存=覆盖更新；也可输入新键新建。删除该用户=级联删除其全部数据。
            </p>
            <div
              style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}
            >
              <Select
                placeholder="选择用户：选谁，下面表格就显示谁（默认=当前身份）"
                value={memU || undefined}
                onChange={(v) => changeUser(v ?? '')}
                options={memUsers.map((u) => ({ value: u, label: u }))}
                style={{ width: 250 }}
                showSearch
                optionFilterProp="label"
                allowClear
              />
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                disabled={!memU}
                onClick={delUser}
                style={{ marginRight: 8 }}
              >
                删除该用户
              </Button>
              {/* key：下拉选已有(带箭头)，搜索不存在时可"新建"该键；选已有键会把当前值载入下方输入框 */}
              <Select
                showSearch
                allowClear
                placeholder="偏好键：下拉选已有，或搜不到就新建"
                value={memK || undefined}
                onChange={changeKey}
                onSearch={(s) => setKeySearch(s ?? '')}
                options={[
                  ...memKeys.map((k) => ({ value: k, label: k })),
                  ...(keySearch.trim() && !memKeys.includes(keySearch.trim())
                    ? [{ value: keySearch.trim(), label: `新建「${keySearch.trim()}」` }]
                    : []),
                ]}
                style={{ width: 230 }}
              />
              <Input placeholder="值，如 打篮球、踢足球（选已有键=覆盖更新其值）" value={memV} onChange={(e) => setMemV(e.target.value)} style={{ width: 230 }} />
              <Button type="primary" size="small" loading={memSaving} onClick={addPref}>
                写入 / 更新
              </Button>
            </div>
            <p style={{ color: '#bfbfbf', marginBottom: 8, fontSize: 12 }}>
              上面选中谁，表格就只显示谁的偏好，也就能给谁新增/改值/删除；不选（清空）则显示全部真实用户。默认进来是「聊天页当前身份」。
            </p>
            <Table<MemoryPref>
              rowKey={(r) => `${r.user_id}:${r.key}`}
              columns={memColumns}
              dataSource={memU ? memItems.filter((r) => r.user_id === memU) : memItems}
              loading={memLoad}
              size="small"
              pagination={false}
              locale={{ emptyText: '还没有任何长期偏好：去聊天里说一句「我是计算机学院的」试试，或手动写入一条' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MonitorPanel;
