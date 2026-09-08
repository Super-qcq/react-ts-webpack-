import { Typography } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import CommentSquare from './component/CommentSquare';

const { Title } = Typography;

/** 评论广场 — 标题 + CommentSquare */
const Comments = () => (
  <div>
    <Title level={4} style={{ marginTop: 0, marginBottom: 20 }}>
      <MessageOutlined /> 评论广场
    </Title>
    <CommentSquare />
  </div>
);

export default Comments;
