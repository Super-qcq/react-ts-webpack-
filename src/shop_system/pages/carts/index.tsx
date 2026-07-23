import { Typography } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import CartTable from './component/CartTable';

const { Title } = Typography;

/** 购物车页 — 标题 + CartTable */
const Carts = () => (
  <div>
    <Title level={4} style={{ marginTop: 0, marginBottom: 20 }}>
      <ShoppingCartOutlined /> 购物车
    </Title>
    <CartTable />
  </div>
);

export default Carts;
