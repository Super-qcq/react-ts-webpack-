import React from 'react';
import {
  Input,
  Space,
  Tag,
  message,
  Row,
  Col,
  Statistic,
  Card,
  Avatar,
  Typography,
  Pagination,
  Spin,
  Empty,
} from 'antd';
import {
  SearchOutlined,
  SoundOutlined,
  UserOutlined,
  EyeOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { Post, PageParams } from '../../../types';
import { fetchPosts } from '../../../api';
import '../style/index.less';

const { Paragraph } = Typography;

interface PostTableState {
  data: Post[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  searchUserId: string;
}

class PostTable extends React.Component<object, PostTableState> {
  state: PostTableState = {
    data: [],
    loading: false,
    currentPage: 1,
    pageSize: 6,
    total: 0,
    searchUserId: '',
  };

  componentDidMount(): void {
    this.fetchData();
  }

  fetchData = (): void => {
    this.setState({ loading: true });
    const { currentPage, pageSize, searchUserId } = this.state;
    const params: PageParams = { _page: currentPage, _limit: pageSize };
    if (searchUserId) params.userId = searchUserId;
    fetchPosts(params)
      .then(({ data, total }) => this.setState({ data, total }))
      .catch((e) => {
        message.error('请求失败');
        console.error(e);
      })
      .finally(() => this.setState({ loading: false }));
  };

  handlePageChange = (page: number, size: number): void => {
    this.setState({ currentPage: page, pageSize: size }, () => this.fetchData());
  };

  handleSearch = (): void => {
    this.setState({ currentPage: 1 }, () => this.fetchData());
  };

  render(): React.ReactNode {
    const { data, loading, currentPage, pageSize, total, searchUserId } = this.state;
    const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#1677ff', '#52c41a'];

    return (
      <div className="post-list">
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card hoverable>
              <Statistic
                title="公告总数"
                value={total}
                prefix={<SoundOutlined />}
                styles={{ content: { color: '#1677ff', fontWeight: 700 } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card hoverable>
              <Statistic
                title="每页条数"
                value={pageSize}
                prefix={<EyeOutlined />}
                styles={{ content: { color: '#52c41a', fontWeight: 700 } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card hoverable>
              <Statistic
                title="总页数"
                value={Math.ceil(total / pageSize)}
                suffix="页"
                styles={{ content: { color: '#fa8c16', fontWeight: 700 } }}
              />
            </Card>
          </Col>
        </Row>

        <Space style={{ marginBottom: 20 }}>
          <Input
            placeholder="按用户ID筛选…"
            value={searchUserId}
            onChange={(e) => this.setState({ searchUserId: e.target.value })}
            onPressEnter={this.handleSearch}
            style={{ width: 180 }}
            prefix={<SearchOutlined />}
            allowClear
          />
          <Tag color="blue">共 {total} 条</Tag>
        </Space>

        <Spin spinning={loading}>
          {data.length > 0 ? (
            <>
              {data.map((item: Post, idx: number) => (
                <div key={item.id} style={{ marginBottom: 12 }}>
                  <Card
                    hoverable
                    className="post-card"
                    title={
                      <Space>
                        <Avatar style={{ background: colors[idx % colors.length] }} gap={8}>
                          <UserOutlined />
                        </Avatar>
                        <span className="post-title">{item.title}</span>
                      </Space>
                    }
                    extra={
                      <Space>
                        <Tag color="geekblue" icon={<UserOutlined />}>
                          用户 {item.userId}
                        </Tag>
                        <Tag color="default" icon={<ClockCircleOutlined />}>
                          #{item.id}
                        </Tag>
                      </Space>
                    }
                  >
                    <Paragraph
                      ellipsis={{ rows: 2, expandable: true, symbol: '展开全文' }}
                      className="post-body"
                    >
                      {item.body}
                    </Paragraph>
                  </Card>
                </div>
              ))}
              <div className="pagination-wrapper" style={{ marginTop: 24, textAlign: 'center' }}>
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={total}
                  onChange={this.handlePageChange}
                  showSizeChanger
                  showTotal={(t) => `共 ${t} 条公告`}
                />
              </div>
            </>
          ) : (
            !loading && <Empty description="暂无公告" />
          )}
        </Spin>
      </div>
    );
  }
}

export default PostTable;
