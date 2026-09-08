import React from 'react';
import {
  Card,
  List,
  Tag,
  Space,
  message,
  Button,
  Spin,
  Empty,
  Typography,
  Row,
  Col,
  Statistic,
  Pagination,
} from 'antd';
import { BulbOutlined, SyncOutlined, FireOutlined, UserOutlined } from '@ant-design/icons';
import type { Quote, PageParams } from '../../../types';
import { fetchQuotes, fetchRandomQuote } from '../../../api';
import '../style/index.less';

const { Paragraph } = Typography;

interface QuoteListState {
  random: Quote | null;
  quotes: Quote[];
  loading: boolean;
  randomLoading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
}

class QuoteList extends React.Component<object, QuoteListState> {
  state: QuoteListState = {
    random: null,
    quotes: [],
    loading: true,
    randomLoading: false,
    currentPage: 1,
    pageSize: 10,
    total: 0,
  };

  componentDidMount(): void {
    this.fetchData();
    this.fetchRandom();
  }

  fetchData = (): void => {
    this.setState({ loading: true });
    const skip = (this.state.currentPage - 1) * this.state.pageSize;
    const params: PageParams = { limit: this.state.pageSize, skip };
    fetchQuotes(params)
      .then(({ list, total }) => this.setState({ quotes: list, total }))
      .catch((e) => {
        message.error('请求失败');
        console.error(e);
      })
      .finally(() => this.setState({ loading: false }));
  };

  fetchRandom = (): void => {
    this.setState({ randomLoading: true });
    fetchRandomQuote()
      .then((quote) => this.setState({ random: quote }))
      .catch((e) => {
        message.error('随机一言获取失败');
        console.error(e);
      })
      .finally(() => this.setState({ randomLoading: false }));
  };

  handlePageChange = (page: number, size: number): void => {
    this.setState({ currentPage: page, pageSize: size }, () => this.fetchData());
  };

  render(): React.ReactNode {
    const { random, quotes, loading, randomLoading, currentPage, pageSize, total } = this.state;
    const authors = new Set(quotes.map((q) => q.author));

    return (
      <div className="quote-page">
        {/* 🌟 随机一言展示区 */}
        <Card className="quote-hero" variant="borderless">
          <Spin spinning={randomLoading}>
            <div className="quote-icon">
              <BulbOutlined />
            </div>
            <div className="quote-text">「{random ? random.quote : '正在加载一言…'}」</div>
            <div className="quote-author">—— {random ? random.author : 'DummyJSON'}</div>
            <Button
              type="primary"
              ghost
              icon={<SyncOutlined />}
              onClick={this.fetchRandom}
              style={{ marginTop: 16 }}
            >
              换一句
            </Button>
          </Spin>
        </Card>

        {/* 🌟 统计信息 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card hoverable>
              <Statistic
                title="名言总数"
                value={total}
                prefix={<BulbOutlined />}
                styles={{ content: { color: '#1677ff', fontWeight: 700 } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card hoverable>
              <Statistic
                title="当前作者数"
                value={authors.size}
                prefix={<UserOutlined />}
                styles={{ content: { color: '#52c41a', fontWeight: 700 } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card hoverable>
              <Statistic
                title="数据来源"
                value="/shop-api/quotes"
                prefix={<FireOutlined />}
                valueStyle={{ fontSize: 14 }}
              />
            </Card>
          </Col>
        </Row>

        {/* 🌟 名言列表 */}
        <Spin spinning={loading}>
          {quotes.length > 0 ? (
            <>
              <List
                className="quote-list"
                dataSource={quotes}
                renderItem={(item: Quote) => (
                  <List.Item>
                    <Card className="quote-item" style={{ width: '100%' }}>
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        <Paragraph style={{ marginBottom: 0, fontSize: 15 }}>
                          「{item.quote}」
                        </Paragraph>
                        <Space>
                          <Tag color="purple" icon={<UserOutlined />}>
                            {item.author}
                          </Tag>
                          <Tag color="default">#{item.id}</Tag>
                        </Space>
                      </Space>
                    </Card>
                  </List.Item>
                )}
              />
              <div className="pagination-bar">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={total}
                  onChange={this.handlePageChange}
                  showSizeChanger
                  showTotal={(t) => `共 ${t} 条一言`}
                />
              </div>
            </>
          ) : (
            !loading && <Empty description="暂无一言" />
          )}
        </Spin>
      </div>
    );
  }
}

export default QuoteList;
