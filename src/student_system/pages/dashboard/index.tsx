import { Typography } from 'antd';
import { DashboardOutlined } from '@ant-design/icons';
import DashboardStats from './component/DashboardStats';

const { Title } = Typography;

/** 数据看板 — 标题 + DashboardStats */
const Dashboard = () => (
  <div>
    <Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
      <DashboardOutlined /> 数据看板
    </Title>
    <DashboardStats />
  </div>
);

export default Dashboard;
