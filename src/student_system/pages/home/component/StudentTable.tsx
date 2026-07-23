import React from 'react';
import { Table, message, Tag, Space, Avatar } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { MailOutlined, PhoneOutlined } from '@ant-design/icons';
import type { Student } from '../../../types';
import { fetchStudents } from '../../../api';
import { TeamOutlined, UserOutlined, CrownOutlined } from '@ant-design/icons';
import StatPanel from '../../../components/StatPanel'; // 🌟 共享组件
import { AVATAR_COLORS } from '../../../constants'; // 🌟 共享常量
import '../style/index.less';

interface StudentTableState {
  studentData: Student[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
}

class StudentTable extends React.Component<object, StudentTableState> {
  columns: ColumnsType<Student> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
      render: (id: number) => <Tag color="blue">#{id}</Tag>,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 240,
      render: (name: string, _: Student, idx: number) => (
        <Space>
          <Avatar
            className="student-avatar"
            style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
            gap={8}
          >
            {name.charAt(0)}
          </Avatar>
          <span className="student-name">{name}</span>
        </Space>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 280,
      render: (email: string) => (
        <a href={`mailto:${email}`} className="student-email">
          <MailOutlined /> {email}
        </a>
      ),
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => (
        <Space>
          <PhoneOutlined style={{ color: '#52c41a' }} />
          <span className="student-phone">{phone}</span>
        </Space>
      ),
    },
  ];

  state: StudentTableState = {
    studentData: [],
    loading: false,
    currentPage: 1,
    pageSize: 5,
    totalCount: 0,
  };

  componentDidMount(): void {
    this.fetchData();
  }

  fetchData = (): void => {
    this.setState({ loading: true });
    fetchStudents({ _page: this.state.currentPage, _limit: this.state.pageSize })
      .then(({ data, total }) => this.setState({ studentData: data, totalCount: total }))
      .catch((e) => {
        message.error('请求失败');
        console.error(e);
      })
      .finally(() => this.setState({ loading: false }));
  };

  handleTableChange = (p: TablePaginationConfig): void => {
    this.setState({ currentPage: p.current || 1, pageSize: p.pageSize || 5 }, () =>
      this.fetchData(),
    );
  };

  render(): React.ReactNode {
    const { studentData, loading, currentPage, pageSize, totalCount } = this.state;
    return (
      <div className="home-page">
        {/* 🌟 使用共享组件 StatPanel 替代手写四张统计卡片 */}
        <StatPanel
          items={[
            {
              value: totalCount,
              label: '学生总人数',
              prefix: <TeamOutlined style={{ fontSize: 20 }} />,
              color: '#1677ff',
            },
            {
              value: studentData.length,
              label: '当前页人数',
              prefix: <UserOutlined style={{ fontSize: 20 }} />,
              color: '#52c41a',
            },
            {
              value: Math.ceil(totalCount / pageSize),
              label: '总页数',
              suffix: '页',
              color: '#722ed1',
            },
            {
              value: 'JSONPlaceholder',
              label: '数据来源',
              prefix: <CrownOutlined style={{ fontSize: 20 }} />,
              color: '#fa8c16',
            },
          ]}
        />
        <div className="table-wrapper">
          <Table<Student>
            rowKey="id"
            dataSource={studentData}
            columns={this.columns}
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (t) => `共 ${t} 名学生`,
            }}
            onChange={this.handleTableChange}
            scroll={{ y: 380 }}
            bordered
            size="middle"
          />
        </div>
      </div>
    );
  }
}

export default StudentTable;
