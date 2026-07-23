import { Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import UserTable from './component/UserTable';

const { Title } = Typography;

/** 客户管理 — 标题 + UserTable */
const Users = () => (
  <div>
    <Title level={4} style={{ marginTop: 0, marginBottom: 20 }}>
      <UserOutlined /> 客户管理
    </Title>
    <UserTable />
  </div>
);

export default Users;
