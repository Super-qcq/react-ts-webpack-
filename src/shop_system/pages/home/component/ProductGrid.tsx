import React from 'react';
import {
  Card,
  Row,
  Col,
  Input,
  Select,
  Space,
  Tag,
  message,
  Spin,
  Empty,
  Pagination,
  Badge,
  Modal,
  Descriptions,
  Image,
  Rate,
  Button,
  Tooltip,
} from 'antd';
import {
  ShoppingOutlined,
  TagOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  HeartFilled,
} from '@ant-design/icons';
import type { Product } from '../../../types';
import { fetchProducts, fetchCategories, addToCart } from '../../../api';
import '../style/index.less';

// 🌟 TS 接口
interface CategoryItem {
  slug: string;
  name: string;
}
interface ProductGridState {
  products: Product[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  searchKeyword: string;
  category: string;
  sortBy: '' | 'price-asc' | 'price-desc' | 'rating';
  categories: CategoryItem[];
  // 🌟 交互状态
  detailProduct: Product | null; // 商品详情弹窗
  favorites: number[]; // 收藏列表（本地 state）
  cartCount: number; // 购物车计数
}

class ProductGrid extends React.Component<object, ProductGridState> {
  catColors: Record<string, string> = {};

  state: ProductGridState = {
    products: [],
    loading: true,
    currentPage: 1,
    pageSize: 12,
    total: 0,
    searchKeyword: '',
    category: '',
    sortBy: '',
    categories: [],
    detailProduct: null,
    favorites: [],
    cartCount: 0,
  };

  componentDidMount(): void {
    this.loadCategories();
    this.fetchData();
  }

  // 🔧 加载分类
  loadCategories = (): void => {
    fetchCategories()
      .then((cats) => this.setState({ categories: cats }))
      .catch(() => {});
  };

  // 🔧 分类颜色
  getColor = (key: string): string => {
    if (!this.catColors[key]) {
      this.catColors[key] = `hsl(${Math.floor(Math.random() * 360)}, 55%, 50%)`;
    }
    return this.catColors[key];
  };

  // 🌟 请求商品
  fetchData = (): void => {
    const { currentPage, pageSize, searchKeyword, category } = this.state;
    this.setState({ loading: true });
    const skip = (currentPage - 1) * pageSize;
    const params: Record<string, string | number> = { limit: pageSize, skip };
    if (searchKeyword) params.q = searchKeyword;
    if (category) params.category = category;
    fetchProducts(params)
      .then(({ list, total }) => this.setState({ products: list, total }))
      .catch((e) => {
        message.error('请求失败');
        console.error(e);
      })
      .finally(() => this.setState({ loading: false }));
  };

  // 🌟 排序
  getSortedProducts = (): Product[] => {
    const { products, sortBy } = this.state;
    const sorted = [...products];
    if (sortBy === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  };

  handlePageChange = (page: number, size: number): void => {
    this.setState({ currentPage: page, pageSize: size }, () => this.fetchData());
  };

  handleSearch = (): void => {
    this.setState({ currentPage: 1 }, () => this.fetchData());
  };

  handleCategoryChange = (catSlug: string): void => {
    this.setState({ category: catSlug, currentPage: 1 }, () => this.fetchData());
  };

  // 🌟 切换收藏
  toggleFavorite = (id: number, e: React.MouseEvent): void => {
    e.stopPropagation();
    const { favorites } = this.state;
    this.setState({
      favorites: favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id],
    });
  };

  // 🌟 加入购物车（真实 API）
  handleAddToCart = (product: Product, e: React.MouseEvent): void => {
    e.stopPropagation();
    addToCart(1, product.id, 1)
      .then(() => {
        message.success(`已将「${product.title}」加入购物车`);
        this.setState((s) => ({ cartCount: s.cartCount + 1 }));
      })
      .catch(() => message.error('加入购物车失败'));
  };

  // 🌟 打开商品详情
  showDetail = (product: Product): void => {
    this.setState({ detailProduct: product });
  };
  closeDetail = (): void => {
    this.setState({ detailProduct: null });
  };

  render(): React.ReactNode {
    const {
      products,
      loading,
      currentPage,
      pageSize,
      total,
      searchKeyword,
      category,
      categories,
      sortBy,
      detailProduct,
      favorites,
      cartCount,
    } = this.state;
    const sortedProducts = this.getSortedProducts();

    return (
      <div className="product-grid">
        {/* 🌟 顶部操作栏 */}
        <Space style={{ marginBottom: 24 }} size="middle" wrap>
          <Input.Search
            placeholder="搜索商品…"
            value={searchKeyword}
            onChange={(e) => this.setState({ searchKeyword: e.target.value })}
            onSearch={this.handleSearch}
            style={{ width: 280 }}
            allowClear
          />
          <Select
            placeholder="全部分类"
            value={category || undefined}
            onChange={this.handleCategoryChange}
            allowClear
            style={{ minWidth: 140 }}
            options={categories.map((c) => ({ value: c.slug, label: c.name }))}
          />
          <Select
            placeholder="排序方式"
            value={sortBy || undefined}
            onChange={(v) => this.setState({ sortBy: v || '' })}
            style={{ minWidth: 130 }}
            options={[
              { value: 'price-asc', label: '价格从低到高' },
              { value: 'price-desc', label: '价格从高到低' },
              { value: 'rating', label: '评分最高' },
            ]}
          />
          <Tag color="red">
            <ShoppingOutlined /> {total} 件
          </Tag>
          <Tag color="blue">
            <HeartOutlined /> 收藏 {favorites.length}
          </Tag>
          <Badge count={cartCount} offset={[-4, 0]}>
            <Tag color="green">
              <ShoppingCartOutlined />
            </Tag>
          </Badge>
        </Space>

        {/* 🌟 商品卡片网格 */}
        <Spin spinning={loading}>
          {products.length > 0 ? (
            <Row gutter={[16, 20]}>
              {sortedProducts.map((p: Product) => {
                const isFav = favorites.includes(p.id);
                return (
                  <Col xs={24} sm={12} md={8} lg={6} key={p.id}>
                    <Badge.Ribbon text={`-${Math.round(p.discountPercentage)}%`} color="red">
                      <Card
                        hoverable
                        className="product-card"
                        onClick={() => this.showDetail(p)}
                        cover={<img className="product-thumb" src={p.thumbnail} alt={p.title} />}
                        actions={[
                          <Tooltip title="加入购物车" key="cart">
                            <Button
                              type="text"
                              icon={<ShoppingCartOutlined />}
                              onClick={(e) => this.handleAddToCart(p, e)}
                            />
                          </Tooltip>,
                          <Tooltip title={isFav ? '取消收藏' : '收藏'} key="fav">
                            <Button
                              type="text"
                              icon={
                                isFav ? (
                                  <HeartFilled style={{ color: '#ff4d4f' }} />
                                ) : (
                                  <HeartOutlined />
                                )
                              }
                              onClick={(e) => this.toggleFavorite(p.id, e)}
                            />
                          </Tooltip>,
                          <Rate
                            disabled
                            defaultValue={Math.round(p.rating)}
                            count={1}
                            key="rate"
                            style={{ fontSize: 14 }}
                          />,
                        ]}
                      >
                        <Card.Meta
                          title={<span className="product-title">{p.title}</span>}
                          description={
                            <>
                              <p className="product-desc">{p.description.slice(0, 60)}…</p>
                              <Space>
                                <span className="product-price">${p.price}</span>
                                <span className="product-original">
                                  ${Math.round(p.price / (1 - p.discountPercentage / 100))}
                                </span>
                              </Space>
                              <br />
                              <Tag
                                color={this.getColor(p.category)}
                                icon={<TagOutlined />}
                                style={{ marginTop: 6 }}
                              >
                                {p.category}
                              </Tag>
                              <Tag color="default">{p.brand}</Tag>
                            </>
                          }
                        />
                      </Card>
                    </Badge.Ribbon>
                  </Col>
                );
              })}
            </Row>
          ) : (
            !loading && <Empty description="没有找到商品" />
          )}
        </Spin>

        <div className="pagination-bar">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={this.handlePageChange}
            showSizeChanger
            showQuickJumper
            pageSizeOptions={['12', '24', '48']}
            showTotal={(t) => `共 ${t} 件商品`}
          />
        </div>

        {/* 🌟 商品详情弹窗 */}
        <Modal
          open={!!detailProduct}
          onCancel={this.closeDetail}
          footer={null}
          width={700}
          title={detailProduct?.title}
        >
          {detailProduct && (
            <Row gutter={24}>
              <Col span={10}>
                <Image
                  src={detailProduct.thumbnail}
                  alt={detailProduct.title}
                  style={{ width: '100%', borderRadius: 8 }}
                />
                <Row gutter={8} style={{ marginTop: 8 }}>
                  {detailProduct.images.slice(0, 3).map((img, i) => (
                    <Col span={8} key={i}>
                      <Image
                        src={img}
                        style={{ height: 80, objectFit: 'cover', borderRadius: 4 }}
                      />
                    </Col>
                  ))}
                </Row>
              </Col>
              <Col span={14}>
                <Descriptions column={1} size="small" bordered>
                  <Descriptions.Item label="价格">
                    <span className="product-price">${detailProduct.price}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="折扣">
                    <Tag color="red">-{Math.round(detailProduct.discountPercentage)}%</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="评分">
                    <Rate disabled defaultValue={Math.round(detailProduct.rating)} />
                  </Descriptions.Item>
                  <Descriptions.Item label="库存">
                    <Tag color="green">{detailProduct.stock} 件</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="品牌">
                    <Tag>{detailProduct.brand}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="分类">
                    <Tag color={this.getColor(detailProduct.category)}>
                      {detailProduct.category}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="标签">
                    {detailProduct.tags.map((t) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </Descriptions.Item>
                </Descriptions>
                <p style={{ marginTop: 16, color: '#666', lineHeight: 1.8 }}>
                  {detailProduct.description}
                </p>
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={() => {
                    addToCart(1, detailProduct.id, 1)
                      .then(() => {
                        message.success('已加入购物车');
                        this.setState((s) => ({ cartCount: s.cartCount + 1 }));
                      })
                      .catch(() => message.error('失败'));
                  }}
                  style={{ marginTop: 16 }}
                  block
                >
                  加入购物车
                </Button>
              </Col>
            </Row>
          )}
        </Modal>
      </div>
    );
  }
}

export default ProductGrid;
