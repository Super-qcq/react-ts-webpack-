import React from 'react';
import {
  Card,
  Row,
  Col,
  Input,
  Space,
  Tag,
  message,
  Statistic,
  Empty,
  Pagination,
  Spin,
} from 'antd';
import {
  SearchOutlined,
  FolderOutlined,
  UserOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import type { Album, PageParams } from '../../../types';
import { fetchAlbums } from '../../../api';
import '../style/index.less';

interface AlbumListState {
  data: Album[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  searchUserId: string;
}

// 🌟 相册封面色
const COVERS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

class AlbumList extends React.Component<object, AlbumListState> {
  state: AlbumListState = {
    data: [],
    loading: false,
    currentPage: 1,
    pageSize: 12,
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
    fetchAlbums(params)
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

    return (
      <div className="album-list">
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card hoverable>
              <Statistic
                title="相册总数"
                value={total}
                prefix={<FolderOutlined />}
                styles={{ content: { color: '#722ed1', fontWeight: 700 } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card hoverable>
              <Statistic
                title="当前页"
                value={data.length}
                prefix={<FolderOpenOutlined />}
                styles={{ content: { color: '#1677ff', fontWeight: 700 } }}
                suffix="个"
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
          <Tag color="purple">
            <FolderOutlined /> {total} 个相册
          </Tag>
        </Space>

        <Spin spinning={loading}>
          {data.length > 0 ? (
            <Row gutter={[16, 16]}>
              {data.map((album: Album, idx: number) => (
                <Col xs={24} sm={12} md={8} lg={6} key={album.id}>
                  <Card
                    hoverable
                    className="album-card"
                    cover={
                      <div
                        className="album-cover"
                        style={{ background: COVERS[idx % COVERS.length] }}
                      >
                        <FolderOutlined className="album-cover-icon" />
                      </div>
                    }
                    actions={[
                      <Tag color="geekblue" icon={<UserOutlined />} key="u">
                        用户 {album.userId}
                      </Tag>,
                      <Tag color="default" key="id">
                        #{album.id}
                      </Tag>,
                    ]}
                  >
                    <Card.Meta
                      title={<span className="album-title">{album.title}</span>}
                      description={`共收录 ${Math.floor(Math.random() * 50) + 10} 张图片`}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            !loading && <Empty description="暂无相册" />
          )}
        </Spin>

        <div className="pagination-wrapper" style={{ marginTop: 28 }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={this.handlePageChange}
            showSizeChanger
            pageSizeOptions={['12', '24', '36']}
            showTotal={(t) => `共 ${t} 个相册`}
          />
        </div>
      </div>
    );
  }
}

export default AlbumList;
