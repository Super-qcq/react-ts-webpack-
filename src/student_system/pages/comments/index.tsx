import { Typography } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import CommentTable from './component/CommentTable';

const { Title } = Typography;

/** Comments 页面 — 标题 + CommentTable */
const Comments = () => (
  <div>
    <Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
      <MessageOutlined /> 评论留言
    </Title>
    <CommentTable />
  </div>
);

export default Comments;
