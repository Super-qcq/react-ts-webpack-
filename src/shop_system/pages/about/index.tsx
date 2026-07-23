import React from 'react';
import { Card, Button, Typography, Descriptions, Tag, Timeline, Space } from 'antd';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { ApiOutlined, CodeOutlined, SyncOutlined, CheckCircleOutlined } from '@ant-design/icons';
import './style/index.less';

const { Title, Paragraph } = Typography;

// 🌟 TS 接口
interface AboutProps {
  navigate: NavigateFunction;
}

// 🌟 类式组件
class AboutClass extends React.Component<AboutProps> {
  render(): React.ReactNode {
    const { navigate } = this.props;
    return (
      <div className="shop-about">
        <Card variant="borderless" className="about-card">
          <Title level={2}> 电商管理系统</Title>
          <Paragraph type="secondary">
            架构：React 19 + TypeScript 6 + Webpack 5 + Ant Design 6 + SPA HashRouter
          </Paragraph>

          {/* 🌟 技术栈表格 */}
          <div className="info-section">
            <Card
              title={
                <Space>
                  <CodeOutlined />
                  技术栈
                </Space>
              }
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label={<Tag color="blue">React</Tag>}>
                  19.x 类式组件 + 函数式组件
                </Descriptions.Item>
                <Descriptions.Item label={<Tag color="volcano">TypeScript</Tag>}>
                  6.x 接口 / 泛型
                </Descriptions.Item>
                <Descriptions.Item label={<Tag color="orange">Webpack</Tag>}>
                  5.x 多模块 / 代码分割
                </Descriptions.Item>
                <Descriptions.Item label={<Tag color="red">Ant Design</Tag>}>
                  6.x Card / Table / Statistic
                </Descriptions.Item>
                <Descriptions.Item label={<Tag color="purple">API</Tag>}>
                  /shop-api → DummyJSON（100+商品）
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="更新日志" size="small" style={{ marginBottom: 16 }}>
              <Timeline
                items={[
                  {
                    color: 'blue',
                    children: (
                      <div>
                        <Tag>2026-07-20</Tag>商品中心（搜索 + 分类 + 折扣标签）
                      </div>
                    ),
                  },
                  {
                    color: 'green',
                    children: (
                      <div>
                        <Tag>2026-07-20</Tag>购物车订单 + 客户管理
                      </div>
                    ),
                  },
                  {
                    color: 'orange',
                    dot: <CheckCircleOutlined />,
                    children: (
                      <div>
                        <Tag>2026-07-20</Tag>/shop-api 代理 → DummyJSON
                      </div>
                    ),
                  },
                ]}
              />
            </Card>

            <Card
              title={
                <Space>
                  <ApiOutlined />
                  代理架构
                </Space>
              }
              size="small"
            >
              <Tag icon={<SyncOutlined spin />} color="processing">
                开发：localhost:8080/shop-api/* → dummyjson.com
              </Tag>
              <br />
              <Tag icon={<ApiOutlined />} color="default" style={{ marginTop: 8 }}>
                生产：_worker.js 内嵌代理（Cloudflare Pages）
              </Tag>
            </Card>
          </div>

          <Button type="primary" onClick={() => navigate('/home')} style={{ marginTop: 20 }}>
            返回商品中心
          </Button>
        </Card>
      </div>
    );
  }
}

const About = (): React.ReactNode => {
  const navigate = useNavigate();
  return <AboutClass navigate={navigate} />;
};

export default About;
