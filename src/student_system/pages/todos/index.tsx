import { Typography } from 'antd';
import { UnorderedListOutlined } from '@ant-design/icons';
import TodoTable from './component/TodoTable';

const { Title } = Typography;

/** Todos 页面 — 标题 + TodoTable */
const Todos = () => (
  <div>
    <Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
      <UnorderedListOutlined /> 待办事项
    </Title>
    <TodoTable />
  </div>
);

export default Todos;
