import React from 'react';
import {
  Card,
  Select,
  Tabs,
  Tag,
  Table,
  Space,
  message,
  Spin,
  Empty,
  Row,
  Col,
  Statistic,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  UserOutlined,
  SoundOutlined,
  FolderOutlined,
  CheckSquareOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { Student, Post, Album, Todo, PageParams } from '../../../types';
import { fetchStudents, fetchUserPosts, fetchUserAlbums, fetchUserTodos } from '../../../api';
import '../style/index.less';

interface StudentDetailState {
  students: Student[];
  loading: boolean;
  userId: number | null;
  posts: Post[];
  albums: Album[];
  todos: Todo[];
  detailLoading: boolean;
}

class StudentDetail extends React.Component<object, StudentDetailState> {
  state: StudentDetailState = {
    students: [],
    loading: true,
    userId: null,
    posts: [],
    albums: [],
    todos: [],
    detailLoading: false,
  };

  componentDidMount(): void {
    this.loadStudents();
  }

  loadStudents = (): void => {
    const params: PageParams = { _limit: 100 };
    fetchStudents(params)
      .then(({ data }) => this.setState({ students: data }))
      .catch((e) => {
        message.error('学生列表请求失败');
        console.error(e);
      })
      .finally(() => this.setState({ loading: false }));
  };

  // 🌟 切换学生 → 并发请求 3 个嵌套 API
  handleSelect = (userId: number): void => {
    this.setState({ userId, detailLoading: true });
    Promise.all([fetchUserPosts(userId), fetchUserAlbums(userId), fetchUserTodos(userId)])
      .then(([posts, albums, todos]) => this.setState({ posts, albums, todos }))
      .catch((e) => {
        message.error('详情请求失败');
        console.error(e);
      })
      .finally(() => this.setState({ detailLoading: false }));
  };

  todoColumns: ColumnsType<Todo> = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      align: 'center',
      render: (id: number) => <Tag color="purple">#{id}</Tag>,
    },
    {
      title: '任务内容',
      dataIndex: 'title',
      key: 'title',
      render: (t: string, r: Todo) => (
        <span className={`todo-title ${r.completed ? 'todo-done' : 'todo-pending'}`}>{t}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'completed',
      key: 'completed',
      width: 110,
      align: 'center',
      render: (c: boolean) =>
        c ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            已完成
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="error">
            待完成
          </Tag>
        ),
    },
  ];

  render(): React.ReactNode {
    const { students, loading, userId, posts, albums, todos, detailLoading } = this.state;
    const albumColors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#1677ff', '#52c41a'];
    const doneTodos = todos.filter((t) => t.completed).length;

    return (
      <div className="student-detail">
        {/* 🌟 学生选择器 */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space wrap>
            <Select
              className="detail-select"
              style={{ width: 320 }}
              placeholder="请选择一位学生查看详情"
              loading={loading}
              value={userId}
              onChange={this.handleSelect}
              showSearch
              optionFilterProp="label"
              options={students.map((s) => ({
                value: s.id,
                label: `${s.name}（${s.email}）`,
              }))}
            />
            {userId && (
              <Tag color="blue">
                <UserOutlined /> 当前学生：{students.find((s) => s.id === userId)?.name}
              </Tag>
            )}
          </Space>
        </Card>

        {userId ? (
          <Spin spinning={detailLoading}>
            {/* 🌟 统计 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={8}>
                <Card hoverable>
                  <Statistic
                    title="公告数"
                    value={posts.length}
                    prefix={<SoundOutlined />}
                    styles={{ content: { color: '#1677ff', fontWeight: 700 } }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card hoverable>
                  <Statistic
                    title="相册数"
                    value={albums.length}
                    prefix={<FolderOutlined />}
                    styles={{ content: { color: '#52c41a', fontWeight: 700 } }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card hoverable>
                  <Statistic
                    title="待办完成率"
                    value={todos.length > 0 ? Math.round((doneTodos / todos.length) * 100) : 0}
                    suffix="%"
                    prefix={<CheckSquareOutlined />}
                    styles={{ content: { color: '#fa8c16', fontWeight: 700 } }}
                  />
                </Card>
              </Col>
            </Row>

            <Tabs
              defaultActiveKey="posts"
              items={[
                {
                  key: 'posts',
                  label: (
                    <span>
                      <SoundOutlined /> 公告（{posts.length}）
                    </span>
                  ),
                  children: (
                    <div className="detail-posts">
                      {posts.length > 0 ? (
                        posts.map((p: Post) => (
                          <Card key={p.id} size="small" className="detail-post">
                            <Space direction="vertical" size={4} style={{ width: '100%' }}>
                              <span className="detail-post-title">{p.title}</span>
                              <span style={{ color: '#888', fontSize: 13 }}>{p.body}</span>
                            </Space>
                          </Card>
                        ))
                      ) : (
                        <Empty description="暂无公告" />
                      )}
                    </div>
                  ),
                },
                {
                  key: 'albums',
                  label: (
                    <span>
                      <FolderOutlined /> 相册（{albums.length}）
                    </span>
                  ),
                  children: (
                    <div className="detail-albums">
                      <Row gutter={[16, 16]}>
                        {albums.length > 0 ? (
                          albums.map((a: Album, idx: number) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={a.id}>
                              <Card hoverable size="small" className="album-card">
                                <div
                                  className="album-cover"
                                  style={{ background: albumColors[idx % albumColors.length] }}
                                >
                                  <FolderOutlined />
                                </div>
                                <p style={{ marginTop: 8, marginBottom: 0, fontWeight: 500 }}>
                                  {a.title}
                                </p>
                              </Card>
                            </Col>
                          ))
                        ) : (
                          <Col span={24}>
                            <Empty description="暂无相册" />
                          </Col>
                        )}
                      </Row>
                    </div>
                  ),
                },
                {
                  key: 'todos',
                  label: (
                    <span>
                      <CheckSquareOutlined /> 待办（{todos.length}）
                    </span>
                  ),
                  children: (
                    <div className="detail-todos">
                      <Table<Todo>
                        rowKey="id"
                        dataSource={todos}
                        columns={this.todoColumns}
                        pagination={{ pageSize: 8, showTotal: (t) => `共 ${t} 项` }}
                        size="small"
                        bordered
                      />
                    </div>
                  ),
                },
              ]}
            />
          </Spin>
        ) : (
          <Empty description="请先选择学生" />
        )}
      </div>
    );
  }
}

export default StudentDetail;
