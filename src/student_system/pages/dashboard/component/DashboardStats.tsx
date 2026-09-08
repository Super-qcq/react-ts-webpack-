import React from 'react';
import { Row, Col, Card, Statistic, Progress, List, Tag, Avatar, message, Spin, Empty } from 'antd';
import {
  TeamOutlined,
  SoundOutlined,
  MessageOutlined,
  FolderOutlined,
  CheckSquareOutlined,
  CameraOutlined,
  FireOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { Post } from '../../../types';
import {
  fetchStudents,
  fetchPosts,
  fetchComments,
  fetchAlbums,
  fetchTodos,
  fetchPhotos,
} from '../../../api';
import '../style/index.less';

// 🌟 TS 接口
interface DashboardStatsState {
  loading: boolean;
  students: number;
  posts: number;
  comments: number;
  albums: number;
  photos: number;
  todos: number;
  doneTodos: number;
  recentPosts: Post[];
}

class DashboardStats extends React.Component<object, DashboardStatsState> {
  state: DashboardStatsState = {
    loading: true,
    students: 0,
    posts: 0,
    comments: 0,
    albums: 0,
    photos: 0,
    todos: 0,
    doneTodos: 0,
    recentPosts: [],
  };

  componentDidMount(): void {
    this.fetchData();
  }

  // 🌟 并发请求 6 个真实 API（JSONPlaceholder 全部资源）
  fetchData = (): void => {
    this.setState({ loading: true });
    Promise.all([
      fetchStudents({ _limit: 1 }),
      fetchPosts({ _limit: 5 }),
      fetchComments({ _limit: 1 }),
      fetchAlbums({ _limit: 1 }),
      fetchTodos({ _limit: 200 }),
      fetchPhotos({ _limit: 1 }),
    ])
      .then(([students, posts, comments, albums, todos, photos]) => {
        const doneTodos = todos.data.filter((t) => t.completed).length;
        this.setState({
          students: students.total,
          posts: posts.total,
          comments: comments.total,
          albums: albums.total,
          photos: photos.total,
          todos: todos.total,
          doneTodos,
          recentPosts: posts.data,
        });
      })
      .catch((e) => {
        message.error('请求失败');
        console.error(e);
      })
      .finally(() => this.setState({ loading: false }));
  };

  render(): React.ReactNode {
    const { loading, students, posts, comments, albums, photos, todos, doneTodos, recentPosts } =
      this.state;
    const donePercent = todos > 0 ? Math.round((doneTodos / todos) * 100) : 0;

    return (
      <div className="dashboard">
        <Spin spinning={loading}>
          {/* 🌟 核心统计卡片 */}
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8} md={4}>
              <Card hoverable className="stat-card">
                <Statistic
                  title="学生总数"
                  value={students}
                  prefix={<TeamOutlined />}
                  styles={{ content: { color: '#1677ff', fontWeight: 700 } }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card hoverable className="stat-card">
                <Statistic
                  title="公告总数"
                  value={posts}
                  prefix={<SoundOutlined />}
                  styles={{ content: { color: '#722ed1', fontWeight: 700 } }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card hoverable className="stat-card">
                <Statistic
                  title="评论总数"
                  value={comments}
                  prefix={<MessageOutlined />}
                  styles={{ content: { color: '#13c2c2', fontWeight: 700 } }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card hoverable className="stat-card">
                <Statistic
                  title="相册总数"
                  value={albums}
                  prefix={<FolderOutlined />}
                  styles={{ content: { color: '#fa8c16', fontWeight: 700 } }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card hoverable className="stat-card">
                <Statistic
                  title="照片总数"
                  value={photos}
                  prefix={<CameraOutlined />}
                  styles={{ content: { color: '#52c41a', fontWeight: 700 } }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card hoverable className="stat-card">
                <Statistic
                  title="待办总数"
                  value={todos}
                  prefix={<CheckSquareOutlined />}
                  styles={{ content: { color: '#eb2f96', fontWeight: 700 } }}
                />
              </Card>
            </Col>
          </Row>

          {/* 🌟 待办完成率 */}
          <Card className="stat-card" style={{ marginTop: 16 }}>
            <Row gutter={16} align="middle">
              <Col xs={24} sm={6}>
                <div className="dashboard-progress">
                  <div className="progress-label">待办完成率</div>
                  <Progress type="circle" percent={donePercent} size={80} strokeColor="#52c41a" />
                </div>
              </Col>
              <Col xs={24} sm={18}>
                <Row gutter={16}>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="已完成"
                      value={doneTodos}
                      prefix={<CheckCircleOutlined />}
                      styles={{ content: { color: '#52c41a', fontWeight: 700 } }}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="未完成"
                      value={todos - doneTodos}
                      prefix={<FireOutlined />}
                      styles={{ content: { color: '#ff4d4f', fontWeight: 700 } }}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="数据来源"
                      value={'/api/todos'}
                      valueStyle={{ fontSize: 14 }}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="请求方式"
                      value={'Promise.all'}
                      valueStyle={{ fontSize: 14 }}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>

          {/* 🌟 最新公告 */}
          <Card
            className="recent-list"
            title={
              <span>
                <SoundOutlined /> 最新公告
              </span>
            }
            size="small"
          >
            {recentPosts.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={recentPosts}
                renderItem={(item: Post, idx: number) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar style={{ background: '#1677ff' }}>{idx + 1}</Avatar>}
                      title={<span className="recent-title">{item.title}</span>}
                      description={
                        <span className="recent-desc">
                          {item.body.slice(0, 60)}…{' '}
                          <Tag color="geekblue" style={{ marginLeft: 8 }}>
                            用户 {item.userId}
                          </Tag>
                        </span>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              !loading && <Empty description="暂无公告" />
            )}
          </Card>
        </Spin>
      </div>
    );
  }
}

export default DashboardStats;
