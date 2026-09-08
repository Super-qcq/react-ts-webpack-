import React from 'react';
import {
  Card,
  Row,
  Col,
  Tag,
  Space,
  message,
  Spin,
  Empty,
  Pagination,
  Modal,
  Descriptions,
  Image,
  Rate,
  Typography,
} from 'antd';
import {
  CoffeeOutlined,
  ClockCircleOutlined,
  FireOutlined,
  RiseOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { Recipe, PageParams } from '../../../types';
import { fetchRecipes } from '../../../api';
import '../style/index.less';

const { Title } = Typography;

interface RecipeGridState {
  recipes: Recipe[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  detail: Recipe | null;
}

class RecipeGrid extends React.Component<object, RecipeGridState> {
  state: RecipeGridState = {
    recipes: [],
    loading: true,
    currentPage: 1,
    pageSize: 8,
    total: 0,
    detail: null,
  };

  componentDidMount(): void {
    this.fetchData();
  }

  fetchData = (): void => {
    this.setState({ loading: true });
    const skip = (this.state.currentPage - 1) * this.state.pageSize;
    const params: PageParams = { limit: this.state.pageSize, skip };
    fetchRecipes(params)
      .then(({ list, total }) => this.setState({ recipes: list, total }))
      .catch((e) => {
        message.error('请求失败');
        console.error(e);
      })
      .finally(() => this.setState({ loading: false }));
  };

  handlePageChange = (page: number, size: number): void => {
    this.setState({ currentPage: page, pageSize: size }, () => this.fetchData());
  };

  showDetail = (recipe: Recipe): void => {
    this.setState({ detail: recipe });
  };

  closeDetail = (): void => {
    this.setState({ detail: null });
  };

  render(): React.ReactNode {
    const { recipes, loading, currentPage, pageSize, total, detail } = this.state;

    return (
      <div className="recipe-page">
        {/* 🌟 菜谱卡片网格 */}
        <Spin spinning={loading}>
          {recipes.length > 0 ? (
            <Row gutter={[16, 20]}>
              {recipes.map((r: Recipe) => (
                <Col xs={24} sm={12} md={8} lg={6} key={r.id}>
                  <Card
                    hoverable
                    className="recipe-card"
                    onClick={() => this.showDetail(r)}
                    cover={<img className="recipe-thumb" src={r.image} alt={r.name} />}
                  >
                    <Card.Meta
                      title={<span className="recipe-name">{r.name}</span>}
                      description={
                        <>
                          <p className="recipe-desc">
                            {r.cuisine} · {r.mealType.join(' / ')}
                          </p>
                          <Space size={4} wrap>
                            <Tag color="volcano" icon={<FireOutlined />}>
                              {r.difficulty}
                            </Tag>
                            <Tag color="geekblue" icon={<ClockCircleOutlined />}>
                              {r.prepTimeMinutes + r.cookTimeMinutes}分钟
                            </Tag>
                            <Tag color="green" icon={<TeamOutlined />}>
                              {r.servings}人份
                            </Tag>
                          </Space>
                          <div style={{ marginTop: 8 }}>
                            <Rate
                              disabled
                              defaultValue={Math.round(r.rating)}
                              count={5}
                              style={{ fontSize: 13 }}
                            />
                          </div>
                        </>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            !loading && <Empty description="没有找到菜谱" />
          )}
        </Spin>

        <div className="pagination-bar">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={this.handlePageChange}
            showSizeChanger
            showTotal={(t) => `共 ${t} 道菜谱`}
          />
        </div>

        {/* 🌟 菜谱详情弹窗 */}
        <Modal
          open={!!detail}
          onCancel={this.closeDetail}
          footer={null}
          width={720}
          title={detail?.name}
        >
          {detail && (
            <Row gutter={24}>
              <Col span={10}>
                <Image
                  src={detail.image}
                  alt={detail.name}
                  style={{ width: '100%', borderRadius: 8 }}
                />
                <Descriptions column={1} size="small" bordered style={{ marginTop: 12 }}>
                  <Descriptions.Item label="菜系">
                    <Tag color="blue">{detail.cuisine}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="难度">
                    <Tag color="volcano">{detail.difficulty}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="准备/烹饪">
                    {detail.prepTimeMinutes} / {detail.cookTimeMinutes} 分钟
                  </Descriptions.Item>
                  <Descriptions.Item label="份量">
                    <TeamOutlined /> {detail.servings} 人份
                  </Descriptions.Item>
                  <Descriptions.Item label="热量">
                    <RiseOutlined /> {detail.caloriesPerServing} kcal/份
                  </Descriptions.Item>
                  <Descriptions.Item label="评分">
                    <Rate disabled defaultValue={Math.round(detail.rating)} count={5} />
                    <span style={{ marginLeft: 8, color: '#888' }}>
                      {detail.reviewCount} 条评价
                    </span>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={14}>
                <Title level={5}>
                  <CoffeeOutlined /> 食材清单
                </Title>
                <Space size={4} wrap style={{ marginBottom: 16 }}>
                  {detail.ingredients.map((ing) => (
                    <Tag className="ingredient-tag" color="processing" key={ing}>
                      {ing}
                    </Tag>
                  ))}
                </Space>
                <Title level={5}>烹饪步骤</Title>
                <ol style={{ paddingLeft: 20, color: '#666', lineHeight: 2 }}>
                  {detail.instructions.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </Col>
            </Row>
          )}
        </Modal>
      </div>
    );
  }
}

export default RecipeGrid;
