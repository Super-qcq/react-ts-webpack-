import { Typography } from 'antd';
import { CameraOutlined } from '@ant-design/icons';
import PhotoGallery from './component/PhotoGallery';

const { Title } = Typography;

/** Photos 页面 — 标题 + PhotoGallery */
const Photos = () => (
  <div>
    <Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
      <CameraOutlined /> 校园相册
    </Title>
    <PhotoGallery />
  </div>
);

export default Photos;
