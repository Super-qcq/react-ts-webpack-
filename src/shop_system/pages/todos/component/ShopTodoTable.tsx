import React from 'react';
import { Table, Tag, Select, Space, message, Card, Row, Col, Statistic, Progress } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { ShopTodo, PageParams } from '../../../types';
import { fetchShopTodos } from '../../../api';
import '../style/index.less';

type FilterType = 'all' | 'done' | 'undone';

interface ShopTodoTableState {
  data: ShopTodo[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  filter: FilterType;
  total: number;
}

class ShopTodoTable extends React.Component<object, ShopTodoTableState> {
  columns: ColumnsType<ShopTodo> = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
      render: (id: number) => <Tag color="purple">#{id}</Tag>,
    },
    {
      title: '用户',
      dataIndex: 'userId',
      key: 'userId',
      width: 110,
      align: 'center',
      render: (userId: number) => <Tag color="geekblue">用户{userId}</Tag>,
    },
    {
      title: '任务内容',
      dataIndex: 'todo',
      key: 'todo',
      render: (t: string, r: ShopTodo) => (
        <span className={`todo-title ${r.completed ? 'todo-done' : 'todo-pending'}`}>{t}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'completed',
      key: 'completed',
      width: 120,
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

  state: ShopTodoTableState = {
    data: [],
    loading: false,
    currentPage: 1,
    pageSize: 10,
    filter: 'all',
    total: 0,
  };

  componentDidMount(): void {
    this.fetchData();
  }

  fetchData = (): void => {
    this.setState({ loading: true });
    const { currentPage, pageSize, filter } = this.state;
    const skip = (currentPage - 1) * pageSize;
    const params: PageParams = { limit: pageSize, skip };
    if (filter === 'done') params.completed = 'true';
    if (filter === 'undone') params.completed = 'false';
    fetchShopTodos(params)
      .then(({ list, total }) => this.setState({ data: list, total }))
      .catch((e) => {
        message.error('请求失败');
        console.error(e);
      })
      .finally(() => this.setState({ loading: false }));
  };

  handleFilterChange = (value: FilterType): void => {
    this.setState({ filter: value, currentPage: 1 }, () => this.fetchData());
  };

  handleTableChange = (p: { current?: number }): void => {
    this.setState({ currentPage: p.current || 1 }, () => this.fetchData());
  };

  render(): React.ReactNode {
    const { data, loading, currentPage, pageSize, filter, total } = this.state;
    const doneCount = data.filter((t) => t.completed).length;
    const undoneCount = data.length - doneCount;
    const donePercent = data.length > 0 ? Math.round((doneCount / data.length) * 100) : 0;

    return (
      <div className="shop-todo-page">
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={6}>
            <Card hoverable>
              <Statistic
                title="总任务数"
                value={total}
                styles={{ content: { color: '#1677ff', fontWeight: 700 } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card hoverable>
              <Statistic
                title="已完成"
                value={doneCount}
                prefix={<CheckCircleOutlined />}
                styles={{ content: { color: '#52c41a', fontWeight: 700 } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card hoverable>
              <Statistic
                title="待完成"
                value={undoneCount}
                prefix={<CloseCircleOutlined />}
                styles={{ content: { color: '#ff4d4f', fontWeight: 700 } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card hoverable className="todo-progress-card">
              <div className="todo-progress-label">完成率</div>
              <Progress type="circle" percent={donePercent} size={60} strokeColor="#52c41a" />
            </Card>
          </Col>
        </Row>

        <Space style={{ marginBottom: 16 }}>
          <Select
            value={filter}
            onChange={this.handleFilterChange}
            style={{ width: 130 }}
            options={[
              { value: 'all', label: '  全部' },
              { value: 'undone', label: '  待完成' },
              { value: 'done', label: '  已完成' },
            ]}
          />
          <Tag color="blue">数据来源 /shop-api/todos</Tag>
        </Space>

        <Table<ShopTodo>
          rowKey="id"
          dataSource={data}
          columns={this.columns}
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            showSizeChanger: false,
            showTotal: (t) => `共 ${t} 项`,
          }}
          onChange={this.handleTableChange}
          scroll={{ y: 350 }}
          bordered
          size="middle"
        />
      </div>
    );
  }
}

export default ShopTodoTable;
