# components/ — 共享组件

**放什么**：被 2 个以上页面复用的 UI 组件。

**不放什么**：只被一个页面用到的组件（那些放在页面自己的 `pages/xxx/component/` 下）。

---

## 示例

### ProductCard.tsx（商品卡片）

假设首页和购物车页都需要展示商品卡片，把 ProductGrid 里的卡片逻辑抽出来：

```tsx
// components/ProductCard.tsx
import React from 'react';
import { Card, Badge, Tag, Space, Button, Tooltip } from 'antd';
import { ShoppingCartOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import type { Product } from '../types';
import './ProductCard.less';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onAddToCart: (product: Product) => void;
  onShowDetail: (product: Product) => void;
}

class ProductCard extends React.Component<ProductCardProps> {
  render(): React.ReactNode {
    const { product, isFavorite, onToggleFavorite, onAddToCart, onShowDetail } = this.props;
    return (
      // ... 卡片 JSX
    );
  }
}

export default ProductCard;
```

在页面里用：

```tsx
import ProductCard from '../../components/ProductCard';

<ProductCard
  product={p}
  isFavorite={favorites.includes(p.id)}
  onToggleFavorite={this.toggleFavorite}
  onAddToCart={this.handleAddToCart}
  onShowDetail={this.showDetail}
/>
```

### StatPanel.tsx（统计面板）

首页和购物车页都有 Statistic 卡片行，抽一个通用组件：

```tsx
// components/StatPanel.tsx
import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';

interface StatItem { title: string; value: number | string; prefix?: React.ReactNode; suffix?: string; color?: string; }

interface StatPanelProps { items: StatItem[]; }

const StatPanel: React.FC<StatPanelProps> = ({ items }) => (
  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
    {items.map((item, i) => (
      <Col xs={24} sm={24 / items.length} key={i}>
        <Card hoverable>
          <Statistic title={item.title} value={item.value} prefix={item.prefix} suffix={item.suffix} valueStyle={{ color: item.color || '#1677ff', fontWeight: 700 }} />
        </Card>
      </Col>
    ))}
  </Row>
);

export default StatPanel;
```
