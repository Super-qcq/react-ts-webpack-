import { Typography } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import ShopPostList from './component/ShopPostList';

const { Title } = Typography;

/** 商城资讯 — 标题 + ShopPostList */
const Posts = () => (
  <div>
    <Title level={4} style={{ marginTop: 0, marginBottom: 20 }}>
      <FileTextOutlined /> 商城资讯
    </Title>
    <ShopPostList />
  </div>
);

export default Posts;
