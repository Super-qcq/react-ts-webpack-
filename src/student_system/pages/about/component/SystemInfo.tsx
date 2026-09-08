import React from 'react';
import { Descriptions, Tag, Timeline, Progress, Card, Row, Col, Statistic, Space } from 'antd';
import {
  CodeOutlined,
  BuildOutlined,
  ApiOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import '../style/index.less';

// 🌟 TS 接口
interface TechStackItem {
  label: string;
  version: string;
  tag: string;
  desc: string;
}
interface ChangelogItem {
  time: string;
  content: string;
  color?: string;
}
interface CapabilityItem {
  label: string;
  value: number;
  suffix: string;
}
interface SystemInfoState {
  techStack: TechStackItem[];
  changelog: ChangelogItem[];
  capabilities: CapabilityItem[];
}

class SystemInfo extends React.Component<object, SystemInfoState> {
  state: SystemInfoState = {
    techStack: [
      { label: 'React', version: '19.x', tag: 'blue', desc: '类式组件 + 函数式组件混用' },
      { label: 'TypeScript', version: '6.x', tag: 'volcano', desc: '接口 / 泛型 / 枚举全覆盖' },
      { label: 'Webpack', version: '5.x', tag: 'orange', desc: '多入口 / 代码分割 / 缓存' },
      {
        label: 'Ant Design',
        version: '6.x',
        tag: 'red',
        desc: 'Table / Card / Statistic / Timeline',
      },
      { label: 'React Router', version: '7.x', tag: 'green', desc: 'HashRouter SPA 路由' },
      { label: 'Axios', version: '1.x', tag: 'purple', desc: '/api 代理 → JSONPlaceholder' },
    ],
    changelog: [
      { time: '2026-07-20', content: '9 个页面全覆盖 JSONPlaceholder 全部 API', color: 'blue' },
      { time: '2026-07-20', content: '数据看板：Promise.all 并发聚合 6 类 API', color: 'cyan' },
      { time: '2026-07-20', content: '学生详情：嵌套资源 /users/:id/posts 等', color: 'cyan' },
      {
        time: '2026-07-20',
        content: '组件拆分：每页 index.tsx + component + style',
        color: 'green',
      },
      { time: '2026-07-20', content: 'API 层集中管理 + TS 类型统一', color: 'orange' },
      { time: '2026-07-20', content: '_worker.js 代理 + Cloudflare Pages 部署', color: 'red' },
    ],
    capabilities: [
      { label: 'TypeScript 覆盖率', value: 100, suffix: '%' },
      { label: '页面组件数', value: 16, suffix: '个' },
      { label: 'API 端点数', value: 6, suffix: '个' },
    ],
  };

  render(): React.ReactNode {
    const { techStack, changelog, capabilities } = this.state;

    return (
      <div className="system-info">
        <Card
          title={
            <Space>
              <CodeOutlined />
              技术栈概览
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Descriptions bordered size="small" column={1}>
            {techStack.map((item) => (
              <Descriptions.Item
                key={item.label}
                label={
                  <Space>
                    <Tag color={item.tag}>{item.label}</Tag>
                    <span style={{ fontWeight: 'bold' }}>{item.version}</span>
                  </Space>
                }
              >
                {item.desc}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </Card>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          {capabilities.map((cap) => (
            <Col span={8} key={cap.label}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title={cap.label}
                  value={cap.value}
                  suffix={cap.suffix}
                  prefix={<ThunderboltOutlined />}
                  styles={{ content: { color: '#1677ff' } }}
                />
                <Progress percent={cap.value} showInfo={false} strokeColor="#1677ff" size="small" />
              </Card>
            </Col>
          ))}
        </Row>

        <Card
          title={
            <Space>
              <BuildOutlined />
              更新日志
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Timeline
            items={changelog.map((item) => ({
              color: item.color || 'blue',
              icon: item.color === 'green' ? <CheckCircleOutlined /> : undefined,
              content: (
                <div>
                  <Tag color="default">{item.time}</Tag>
                  {item.content}
                </div>
              ),
            }))}
          />
        </Card>

        <Card
          title={
            <Space>
              <ApiOutlined />
              API 代理架构
            </Space>
          }
          size="small"
        >
          <Tag icon={<SyncOutlined spin />} color="processing">
            开发：localhost:8080/api/* → devServer → jsonplaceholder
          </Tag>
          <br />
          <Tag icon={<ApiOutlined />} color="default" style={{ marginTop: 8 }}>
            生产：_worker.js 内嵌代理（Cloudflare Pages）
          </Tag>
        </Card>
      </div>
    );
  }
}

export default SystemInfo;
