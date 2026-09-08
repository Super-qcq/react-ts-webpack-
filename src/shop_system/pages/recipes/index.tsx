import { Typography } from 'antd';
import { CoffeeOutlined } from '@ant-design/icons';
import RecipeGrid from './component/RecipeGrid';

const { Title } = Typography;

/** 菜谱中心 — 标题 + RecipeGrid */
const Recipes = () => (
  <div>
    <Title level={4} style={{ marginTop: 0, marginBottom: 20 }}>
      <CoffeeOutlined /> 菜谱中心
    </Title>
    <RecipeGrid />
  </div>
);

export default Recipes;
