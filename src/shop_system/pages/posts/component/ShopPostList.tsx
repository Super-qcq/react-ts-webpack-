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
  Avatar,
  Typography,
  Statistic,
  Button,
  List,
} from 'antd';
import {
  FileTextOutlined,
  EyeOutlined,
  LikeOutlined,
  DislikeOutlined,
  CommentOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ShopPost, PostComment, PageParams } from '../../../types';
import { fetchShopPosts, fetchPostComments } from '../../../api';
import '../style/index.less';

const { Paragraph } = Typography;

interface ShopPostListState {
  posts: ShopPost[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  // 🌟 评论弹窗状态
  detailPost: ShopPost | null;
  comments: PostComment[];
  commentsLoading: boolean;
}

class ShopPostList extends React.Component<object, ShopPostListState> {
  state: ShopPostListState = {
    posts: [],
    loading: true,
    currentPage: 1,
    pageSize: 5,
    total: 0,
    detailPost: null,
    comments: [],
    commentsLoading: false,
  };

  componentDidMount(): void {
    this.fetchData();
  }

  fetchData = (): void => {
    this.setState({ loading: true });
    const skip = (this.state.currentPage - 1) * this.state.pageSize;
    const params: PageParams = { limit: this.state.pageSize, skip };
    fetchShopPosts(params)
      .then(({ list, total }) => this.setState({ posts: list, total }))
      .catch((e) => {
        message.error('请求失败');
        console.error(e);
      })
      .finally(() => this.setState({ loading: false }));
  };

  handlePageChange = (page: number, size: number): void => {
    this.setState({ currentPage: page, pageSize: size }, () => this.fetchData());
  };

  // 🌟 查看评论（真实 API）
  showComments = (post: ShopPost): void => {
    this.setState({ detailPost: post, comments: [], commentsLoading: true });
    fetchPostComments(post.id)
      .then(({ list }) => this.setState({ comments: list }))
      .catch((e) => {
        message.error('评论加载失败');
        console.error(e);
      })
      .finally(() => this.setState({ commentsLoading: false }));
  };

  closeComments = (): void => {
    this.setState({ detailPost: null, comments: [] });
  };

  render(): React.ReactNode {
    const { posts, loading, currentPage, pageSize, total, detailPost, comments, commentsLoading } =
      this.state;
    const totalViews = posts.reduce((s, p) => s + p.views, 0);
    const totalLikes = posts.reduce((s, p) => s + p.reactions.likes, 0);

    return (
      <div className="shop-post-page">
        {/* 🌟 统计信息 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card hoverable className="post-stat">
              <Statistic
                title="资讯总数"
                value={total}
                prefix={<FileTextOutlined />}
                styles={{ content: { color: '#1677ff', fontWeight: 700 } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card hoverable className="post-stat">
              <Statistic
                title="当前浏览量"
                value={totalViews}
                prefix={<EyeOutlined />}
                styles={{ content: { color: '#52c41a', fontWeight: 700 } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card hoverable className="post-stat">
              <Statistic
                title="当前点赞数"
                value={totalLikes}
                prefix={<LikeOutlined />}
                styles={{ content: { color: '#fa8c16', fontWeight: 700 } }}
              />
            </Card>
          </Col>
        </Row>

        {/* 🌟 资讯列表 */}
        <Spin spinning={loading}>
          {posts.length > 0 ? (
            <>
              {posts.map((p: ShopPost) => (
                <div key={p.id} style={{ marginBottom: 16 }}>
                  <Card
                    hoverable
                    className="post-item"
                    title={
                      <Space>
                        <Avatar style={{ background: '#1677ff' }} icon={<UserOutlined />} />
                        <span className="post-title">{p.title}</span>
                      </Space>
                    }
                    extra={
                      <Space>
                        <Tag color="default">用户 {p.userId}</Tag>
                        <Tag color="blue" icon={<EyeOutlined />}>
                          {p.views}
                        </Tag>
                      </Space>
                    }
                    actions={[
                      <Button
                        key="like"
                        type="text"
                        icon={<LikeOutlined />}
                        disabled
                        style={{ color: '#1677ff' }}
                      >
                        {p.reactions.likes}
                      </Button>,
                      <Button
                        key="dislike"
                        type="text"
                        icon={<DislikeOutlined />}
                        disabled
                        style={{ color: '#ff4d4f' }}
                      >
                        {p.reactions.dislikes}
                      </Button>,
                      <Button
                        key="comment"
                        type="text"
                        icon={<CommentOutlined />}
                        onClick={() => this.showComments(p)}
                      >
                        查看评论
                      </Button>,
                    ]}
                  >
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                      <Paragraph
                        ellipsis={{ rows: 2, expandable: true, symbol: '展开全文' }}
                        className="post-body"
                      >
                        {p.body}
                      </Paragraph>
                      <Space size={4} wrap>
                        {p.tags.map((t) => (
                          <Tag color="geekblue" key={t}>
                            #{t}
                          </Tag>
                        ))}
                      </Space>
                    </Space>
                  </Card>
                </div>
              ))}
              <div className="pagination-bar">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={total}
                  onChange={this.handlePageChange}
                  showSizeChanger
                  showTotal={(t) => `共 ${t} 篇资讯`}
                />
              </div>
            </>
          ) : (
            !loading && <Empty description="暂无资讯" />
          )}
        </Spin>

        {/* 🌟 评论弹窗（真实 API） */}
        <Modal
          open={!!detailPost}
          onCancel={this.closeComments}
          footer={null}
          title={`评论 — ${detailPost?.title}`}
          width={640}
        >
          <Spin spinning={commentsLoading}>
            {comments.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={comments}
                renderItem={(c: PostComment) => (
                  <List.Item className="comment-item">
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} style={{ background: '#722ed1' }} />}
                      title={
                        <Space>
                          <Tag color="purple">{c.user.username}</Tag>
                          <Tag color="default">{c.user.fullName}</Tag>
                        </Space>
                      }
                      description={<Paragraph style={{ marginBottom: 0 }}>{c.body}</Paragraph>}
                    />
                  </List.Item>
                )}
              />
            ) : (
              !commentsLoading && <Empty description="暂无评论" />
            )}
          </Spin>
        </Modal>
      </div>
    );
  }
}

export default ShopPostList;
