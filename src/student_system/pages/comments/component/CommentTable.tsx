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
import { SearchOutlined, MessageOutlined, MailOutlined } from '@ant-design/icons';
import type { Comment, PageParams } from '../../../types';
import { fetchComments } from '../../../api';
import '../style/index.less';

const { Paragraph } = Typography;

interface CommentTableState {
  data: Comment[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  searchPostId: string;
}

class CommentTable extends React.Component<object, CommentTableState> {
  state: CommentTableState = {
    data: [],
    loading: false,
    currentPage: 1,
    pageSize: 8,
    total: 0,
    searchPostId: '',
  };

  componentDidMount(): void {
    this.fetchData();
  }

  fetchData = (): void => {
    this.setState({ loading: true });
    const { currentPage, pageSize, searchPostId } = this.state;
    const params: PageParams = { _page: currentPage, _limit: pageSize };
    if (searchPostId) params.postId = searchPostId;
    fetchComments(params)
      .then(({ data, total }) => this.setState({ data, total }))
      .catch((e) => {
        message.error('请求失败');
        console.error(e);
      })
      .finally(() => this.setState({ loading: false }));
  };

  handlePageChange = (page: number): void => {
    this.setState({ currentPage: page }, () => this.fetchData());
  };

  handleSearch = (): void => {
    this.setState({ currentPage: 1 }, () => this.fetchData());
  };

  render(): React.ReactNode {
    const { data, loading, currentPage, pageSize, total, searchPostId } = this.state;
    const colors = [
      '#1677ff',
      '#52c41a',
      '#fa8c16',
      '#722ed1',
      '#eb2f96',
      '#13c2c2',
      '#f5222d',
      '#faad14',
    ];

    return (
      <div className="comment-list">
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card hoverable>
              <Statistic
                title="评论总数"
                value={total}
                prefix={<MessageOutlined />}
                styles={{ content: { color: '#13c2c2', fontWeight: 700 } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card hoverable>
              <Statistic
                title="涉及帖子"
                value={new Set(data.map((c) => c.postId)).size}
                prefix={<SearchOutlined />}
                styles={{ content: { color: '#722ed1', fontWeight: 700 } }}
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
            placeholder="按帖子ID筛选…"
            value={searchPostId}
            onChange={(e) => this.setState({ searchPostId: e.target.value })}
            onPressEnter={this.handleSearch}
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
            allowClear
          />
          <Tag color="cyan">共 {total} 条评论</Tag>
        </Space>

        <Spin spinning={loading}>
          {data.length > 0 ? (
            <>
              {data.map((item: Comment, idx: number) => (
                <div key={item.id} style={{ marginBottom: 8 }}>
                  <div className="comment-item">
                    <Avatar
                      size={44}
                      className="comment-avatar"
                      style={{ background: colors[idx % colors.length] }}
                    >
                      {item.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Card size="small" className="comment-bubble">
                      <div className="comment-header">
                        <Space size={8}>
                          <span className="comment-author">{item.name}</span>
                          <span className="comment-email">
                            <MailOutlined /> {item.email}
                          </span>
                        </Space>
                        <Tag color="orange">帖子#{item.postId}</Tag>
                      </div>
                      <Paragraph className="comment-body">{item.body}</Paragraph>
                    </Card>
                  </div>
                </div>
              ))}
              <div className="pagination-wrapper" style={{ marginTop: 24, textAlign: 'center' }}>
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={total}
                  onChange={this.handlePageChange}
                  showTotal={(t) => `共 ${t} 条评论`}
                />
              </div>
            </>
          ) : (
            !loading && <Empty description="暂无评论" />
          )}
        </Spin>
      </div>
    );
  }
}

export default CommentTable;
