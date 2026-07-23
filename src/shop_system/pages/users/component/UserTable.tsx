import React from 'react';
import { Table, message, Card, Row, Col, Statistic, Tag, Space, Avatar } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  ManOutlined,
  WomanOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { User } from '../../../types';
import { fetchUsers } from '../../../api';
import '../style/index.less';

// 🌟 TS 接口
interface UserTableState {
  users: User[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
}

class UserTable extends React.Component<object, UserTableState> {
  columns: ColumnsType<User> = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      align: 'center',
      render: (id: number) => <Tag color="blue">#{id}</Tag>,
    },
    {
      title: '客户',
      dataIndex: 'firstName',
      key: 'name',
      width: 220,
      render: (_: string, user: User) => (
        <Space>
          <Avatar src={user.image} className="user-avatar" size={36} />
          <div>
            <div className="user-name">
              {user.firstName} {user.lastName}
            </div>
            <div className="user-username">@{user.username}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      align: 'center',
      render: (g: string) =>
        g === 'male' ? (
          <Tag icon={<ManOutlined />} color="blue">
            男
          </Tag>
        ) : (
          <Tag icon={<WomanOutlined />} color="pink">
            女
          </Tag>
        ),
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      width: 70,
      align: 'center',
      sorter: (a: User, b: User) => a.age - b.age,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 240,
      render: (e: string) => (
        <a href={`mailto:${e}`}>
          <MailOutlined /> {e}
        </a>
      ),
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 160,
      render: (p: string) => (
        <Space>
          <PhoneOutlined style={{ color: '#52c41a' }} />
          <span style={{ fontFamily: 'monospace' }}>{p}</span>
        </Space>
      ),
    },
    { title: '城市', dataIndex: ['address', 'city'], key: 'city', width: 120 },
  ];

  state: UserTableState = {
    users: [],
    loading: false,
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
    fetchUsers({ limit: this.state.pageSize, skip })
      .then(({ list, total }) => this.setState({ users: list, total }))
      .catch((e) => {
        message.error('请求失败');
        console.error(e);
      })
      .finally(() => this.setState({ loading: false }));
  };

  handleTableChange = (p: TablePaginationConfig): void => {
    this.setState({ currentPage: p.current || 1, pageSize: p.pageSize || 10 }, () =>
      this.fetchData(),
    );
  };

  render(): React.ReactNode {
    const { users, loading, currentPage, pageSize, total } = this.state;
    const maleCount = users.filter((u) => u.gender === 'male').length;
    const avgAge =
      users.length > 0 ? Math.round(users.reduce((s, u) => s + u.age, 0) / users.length) : 0;

    return (
      <div className="user-page">
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={6}>
            <Card hoverable>
              <Statistic
                title="客户总数"
                value={total}
                prefix={<TeamOutlined />}
                styles={{ content: { color: '#1677ff', fontWeight: 700 } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card hoverable>
              <Statistic
                title="男性"
                value={maleCount}
                prefix={<ManOutlined />}
                styles={{ content: { color: '#1890ff', fontWeight: 700 } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card hoverable>
              <Statistic
                title="女性"
                value={users.length - maleCount}
                prefix={<WomanOutlined />}
                styles={{ content: { color: '#eb2f96', fontWeight: 700 } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card hoverable>
              <Statistic
                title="平均年龄"
                value={avgAge}
                prefix={<UserOutlined />}
                styles={{ content: { color: '#52c41a', fontWeight: 700 } }}
                suffix="岁"
              />
            </Card>
          </Col>
        </Row>

        <Table<User>
          className="user-table"
          rowKey="id"
          dataSource={users}
          columns={this.columns}
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 位客户`,
          }}
          onChange={this.handleTableChange}
          scroll={{ y: 420 }}
          bordered
          size="middle"
        />
      </div>
    );
  }
}

export default UserTable;
