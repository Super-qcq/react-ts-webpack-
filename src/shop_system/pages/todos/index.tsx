import { Typography } from 'antd';
import { CheckSquareOutlined } from '@ant-design/icons';
import ShopTodoTable from './component/ShopTodoTable';

const { Title } = Typography;

/** 商城待办 — 标题 + ShopTodoTable */
const Todos = () => (
  <div>
    <Title level={4} style={{ marginTop: 0, marginBottom: 20 }}>
      <CheckSquareOutlined /> 待办清单
    </Title>
    <ShopTodoTable />
  </div>
);

export default Todos;
