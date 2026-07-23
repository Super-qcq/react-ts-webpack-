import React from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Space,
  List,
  Avatar,
  Divider,
  message,
  Typography,
  Spin,
  Empty,
} from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import type { Cart } from '../../../types';
import { fetchCarts } from '../../../api';
import '../style/index.less';

const { Text } = Typography;

// 🌟 TS 接口
interface CartTableState {
  carts: Cart[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
}

class CartTable extends React.Component<object, CartTableState> {
  state: CartTableState = {
    carts: [],
    loading: true,
    currentPage: 1,
    pageSize: 6,
    total: 0,
  };

  componentDidMount(): void {
    this.fetchData();
  }

  fetchData = (): void => {
    this.setState({ loading: true });
    const skip = (this.state.currentPage - 1) * this.state.pageSize;
    fetchCarts({ limit: this.state.pageSize, skip })
      .then(({ list, total }) => this.setState({ carts: list, total }))
      .catch((e) => {
        message.error('请求失败');
        console.error(e);
      })
      .finally(() => this.setState({ loading: false }));
  };

  handlePageChange = (page: number, size: number): void => {
    this.setState({ currentPage: page, pageSize: size }, () => this.fetchData());
  };

  render(): React.ReactNode {
    const { carts, loading, currentPage, pageSize, total } = this.state;

    // 🌟 汇总
    const totalAmount = carts.reduce((s, c) => s + c.total, 0);
    const totalProducts = carts.reduce((s, c) => s + c.totalProducts, 0);
    const totalDiscount = carts.reduce((s, c) => s + (c.total - c.discountedTotal), 0);

    return (
      <div className="cart-page">
        {/* 🌟 统计卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={6}>
            <Card hoverable>
              <Statistic
                title="订单总数"
                value={total}
                prefix={<ShoppingCartOutlined />}
                styles={{ content: { color: '#1677ff', fontWeight: 700 } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card hoverable>
              <Statistic
                title="商品总数"
                value={totalProducts}
                prefix={<GiftOutlined />}
                styles={{ content: { color: '#52c41a', fontWeight: 700 } }}
                suffix="件"
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card hoverable>
              <Statistic
                title="消费总额"
                value={totalAmount}
                prefix={<DollarOutlined />}
                styles={{ content: { color: '#f5222d', fontWeight: 700 } }}
                precision={2}
                suffix="$"
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card hoverable>
              <Statistic
                title="优惠总额"
                value={totalDiscount}
                prefix={<GiftOutlined />}
                styles={{ content: { color: '#722ed1', fontWeight: 700 } }}
                precision={2}
                suffix="$"
              />
            </Card>
          </Col>
        </Row>

        {/* 🌟 购物车列表 */}
        <Spin spinning={loading}>
          {carts.length > 0 ? (
            <List<Cart>
              dataSource={carts}
              pagination={{
                current: currentPage,
                pageSize,
                total,
                onChange: this.handlePageChange,
                showSizeChanger: true,
                showTotal: (t) => `共 ${t} 个订单`,
              }}
              renderItem={(cart: Cart) => (
                <List.Item style={{ padding: 0, marginBottom: 16 }}>
                  <Card
                    className="cart-card"
                    style={{ width: '100%' }}
                    title={
                      <div className="cart-header">
                        <Space>
                          <Tag color="geekblue" icon={<ShoppingCartOutlined />}>
                            订单 #{cart.id}
                          </Tag>
                          <Tag color="default" icon={<UserOutlined />}>
                            用户 {cart.userId}
                          </Tag>
                        </Space>
                        <Space>
                          <Text type="secondary">
                            共 {cart.totalProducts} 件 · {cart.totalQuantity} 个
                          </Text>
                        </Space>
                      </div>
                    }
                    extra={<span className="cart-total">${cart.discountedTotal.toFixed(2)}</span>}
                  >
                    {cart.products.map((p, i) => (
                      <React.Fragment key={p.id}>
                        {i > 0 && <Divider style={{ margin: '10px 0' }} />}
                        <div className="cart-product">
                          <Avatar
                            shape="square"
                            size={60}
                            src={p.thumbnail}
                            className="cart-thumb"
                          />
                          <div style={{ flex: 1 }}>
                            <Text strong>{p.title}</Text>
                            <br />
                            <Space size={8}>
                              <Tag color="blue">
                                ${p.price} × {p.quantity}
                              </Tag>
                              <Tag color="purple">小计 ${p.total.toFixed(2)}</Tag>
                              {p.discountPercentage > 0 && (
                                <Tag color="red">-{Math.round(p.discountPercentage)}%</Tag>
                              )}
                            </Space>
                          </div>
                          <Text strong style={{ color: '#f5222d', fontSize: 16 }}>
                            ${p.discountedTotal.toFixed(2)}
                          </Text>
                        </div>
                      </React.Fragment>
                    ))}
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            !loading && <Empty description="暂无订单" />
          )}
        </Spin>
      </div>
    );
  }
}

export default CartTable;
