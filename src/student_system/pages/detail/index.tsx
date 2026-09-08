import { Typography } from 'antd';
import { IdcardOutlined } from '@ant-design/icons';
import StudentDetail from './component/StudentDetail';

const { Title } = Typography;

/** 学生详情 — 标题 + StudentDetail */
const Detail = () => (
  <div>
    <Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
      <IdcardOutlined /> 学生详情
    </Title>
    <StudentDetail />
  </div>
);

export default Detail;
