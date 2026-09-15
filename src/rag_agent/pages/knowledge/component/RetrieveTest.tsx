import React, { useState } from 'react';
import { Card, Input, Button, Slider, List, Tag, Space, Typography, message } from 'antd';
import { SearchOutlined, FileSearchOutlined } from '@ant-design/icons';
import type { RetrieveResult } from '../../../types';
import { retrieveTest } from '../../../api';
import '../style/index.less';

const { Text } = Typography;

/**
 * RetrieveTest — 检索测试与调参
 * 输入问题，观察各片段的余弦相似度分布，辅助确定 score_threshold 阈值。
 */
const RetrieveTest = () => {
  const [query, setQuery] = useState('转专业需要什么条件');
  const [topK, setTopK] = useState(4);
  const [threshold, setThreshold] = useState(0.4);
  const [result, setResult] = useState<RetrieveResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = () => {
    if (!query.trim()) return;
    setLoading(true);
    retrieveTest(query, topK, threshold)
      .then(setResult)
      .catch((e) => message.error('检索失败：' + e.message))
      .finally(() => setLoading(false));
  };

  return (
    <Card
      className="kb-card"
      size="small"
      title={
        <Space>
          <FileSearchOutlined /> 检索测试与阈值调参
        </Space>
      }
      style={{ marginTop: 16 }}
    >
      <div className="kb-toolbar">
        <Input.Search
          placeholder="输入检索问题"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onSearch={run}
          enterButton={<Button type="primary" icon={<SearchOutlined />} loading={loading} />}
          style={{ maxWidth: 460 }}
        />
        <Space size="large">
          <div>
            <Text type="secondary">Top-K：{topK}</Text>
            <Slider min={1} max={10} value={topK} onChange={setTopK} style={{ width: 140 }} />
          </div>
          <div>
            <Text type="secondary">阈值：{threshold.toFixed(2)}</Text>
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={threshold}
              onChange={setThreshold}
              style={{ width: 140 }}
            />
          </div>
        </Space>
      </div>

      {result && (
        <List
          size="small"
          dataSource={result.hits}
          renderItem={(h, i) => (
            <List.Item>
              <div className="hit-item">
                <div className="hit-meta">
                  <Tag color="geekblue">#{i + 1}</Tag>
                  <span>{h.source}</span>
                  <Tag color={h.pass_threshold ? 'green' : 'red'}>
                    score {h.score}
                    {h.pass_threshold ? ' ✓过阈值' : ' ✗低于阈值'}
                  </Tag>
                </div>
                <div className="hit-text">{h.text}</div>
              </div>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default RetrieveTest;
