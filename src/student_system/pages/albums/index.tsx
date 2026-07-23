import { Typography } from 'antd';
import { FolderOutlined } from '@ant-design/icons';
import AlbumList from './component/AlbumList';

const { Title } = Typography;

/** Albums 页面 — 标题 + AlbumList */
const Albums = () => (
  <div>
    <Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
      <FolderOutlined /> 相册列表
    </Title>
    <AlbumList />
  </div>
);

export default Albums;
