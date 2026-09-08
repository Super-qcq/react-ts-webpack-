import React from 'react';
import {
  Card,
  List,
  Avatar,
  Tag,
  Space,
  message,
  Spin,
  Empty,
  Pagination,
  Row,
  Col,
  Statistic,
} from 'antd';
import { CommentOutlined, UserOutlined, MessageOutlined, FireOutlined } from '@ant-design/icons';
import type { PostComment, PageParams } from '../../../types';
import { fetchComments as fetchAllComments } from '../../../api';
import '../style/index.less';

interface CommentSquareState {
  comments: PostComment[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
}

class CommentSquare extends React.Component<object, CommentSquareState> {
  state: CommentSquareState = {
    comments: [],
    loading: true,
    currentPage: 1,
    pageSize: 10,
    total: 0,
  };

  componentDidMount(): void {
    this.fetchData();
  }

  fetchData = (): void => {
    this.setState({ loading: true });
    const skip = (this.state.currentPage - 1) * this.state.pageSize;
    const params: PageParams = { limit: this.state.pageSize, skip };
    fetchAllComments(params)
      .then(({ list, total }) => this.setState({ comments: list, total }))
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
    const { comments, loading, currentPage, pageSize, total } = this.state;
    const uniqueUsers = new Set(comments.map((c) => c.user.username)).size;

    return (
      <div className="comment-square">
        {/* 🌟 统计信息 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card hoverable>
              <Statistic
                title="评论总数"
                value={total}
                prefix={<CommentOutlined />}
                styles={{ content: { color: '#1677ff', fontWeight: 700 } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card hoverable>
              <Statistic
                title="当前评论用户数"
                value={uniqueUsers}
                prefix={<UserOutlined />}
                styles={{ content: { color: '#52c41a', fontWeight: 700 } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card hoverable>
              <Statistic
                title="数据来源"
                value="/shop-api/comments"
                prefix={<FireOutlined />}
                valueStyle={{ fontSize: 14 }}
              />
            </Card>
          </Col>
        </Row>

        {/* 🌟 评论列表 */}
        <Spin spinning={loading}>
          {comments.length > 0 ? (
            <>
              <List
                itemLayout="horizontal"
                dataSource={comments}
                renderItem={(c: PostComment) => (
                  <List.Item>
                    <Card className="comment-card" style={{ width: '100%' }}>
                      <List.Item.Meta
                        avatar={
                          <Avatar icon={<UserOutlined />} style={{ background: '#722ed1' }} />
                        }
                        title={
                          <Space>
                            <Tag color="purple">{c.user.fullName}</Tag>
                            <Tag color="default">@{c.user.username}</Tag>
                            <Tag color="blue">
                              <MessageOutlined /> 帖子 {c.postId}
                            </Tag>
                          </Space>
                        }
                        description={
                          <p className="comment-body" style={{ marginBottom: 0 }}>
                            {c.body}
                          </p>
                        }
                      />
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

export default CommentSquare;
