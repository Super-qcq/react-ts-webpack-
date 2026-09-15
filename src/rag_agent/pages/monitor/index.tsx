import { Typography, Tag, Space } from 'antd';
import { DashboardOutlined, EyeOutlined } from '@ant-design/icons';
import MonitorPanel from './component/MonitorPanel';

const { Title, Paragraph } = Typography;

/**
 * Monitor 页面 — 监控台
 * 职责：向量库状态 + 会话统计 + 中间件审计调用链 + 运行配置
 */
const Monitor = () => {
  return (
    <div>
      <Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>
        <DashboardOutlined /> 系统监控台
      </Title>
      <Paragraph type="secondary" style={{ marginBottom: 16 }}>
        实时查看知识库向量统计、会话指标，以及自定义中间件记录的模型/工具调用审计链。
      </Paragraph>

      <Space style={{ marginBottom: 20 }} wrap>
        <Tag icon={<EyeOutlined />} color="blue">
          审计中间件（Wrap-style）
        </Tag>
        <Tag color="green">PostgresSaver 会话记忆</Tag>
        <Tag color="purple">PostgresStore 长期记忆</Tag>
      </Space>

      <MonitorPanel />
    </div>
  );
};

export default Monitor;
