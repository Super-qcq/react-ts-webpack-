import { Typography } from 'antd';
import { SoundOutlined } from '@ant-design/icons';
import PostTable from './component/PostTable';

const { Title } = Typography;

/** Posts 页面 — 只负责标题，数据逻辑交给 PostTable */
const Posts = () => (
  <div>
    <Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
      <SoundOutlined /> 校园公告
    </Title>
    <PostTable />
  </div>
);

export default Posts;
