import { Typography } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import ProductGrid from './component/ProductGrid';

const { Title } = Typography;

/** 商品中心 — 标题 + 商品网格 */
const Home = () => (
  <div>
    <Title level={4} style={{ marginTop: 0, marginBottom: 20 }}>
      <ShoppingOutlined /> 商品中心
    </Title>
    <ProductGrid />
  </div>
);

export default Home;
