import { Typography, Tag, Space, Segmented } from 'antd';
import { MessageOutlined, ThunderboltOutlined } from '@ant-design/icons';
import ChatPanel from './component/ChatPanel';
import SITE from '../../lib/site.config';

const { Title, Paragraph } = Typography;

/**
 * Chat 页面 — 智能问答
 * 职责：标题 + 说明 + 引入 ChatPanel（核心对话组件）
 */
const Chat = () => {
  return (
    <div>
      <Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>
        <MessageOutlined /> {SITE.appLabel}
      </Title>
      <Paragraph type="secondary" style={{ marginBottom: 16 }}>
        基于 RAG（检索增强生成）+ 新版 LangChain Agent + 中间件构建的知识问答，
        采用「流式打字机」输出（逐字响应、可中途打断）。
      </Paragraph>

      <Space style={{ marginBottom: 20 }} wrap>
        <Tag icon={<ThunderboltOutlined />} color="blue">
          RAG：Milvus 向量检索
        </Tag>
        <Tag color="green">Agent：create_agent + 中间件</Tag>
        <Tag color="purple">记忆：PostgresSaver / PostgresStore</Tag>
      </Space>

      <ChatPanel />
    </div>
  );
};

export default Chat;
