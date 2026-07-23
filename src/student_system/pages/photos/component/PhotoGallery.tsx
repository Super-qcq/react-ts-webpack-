import React from 'react';
import { Card, Row, Col, Spin, Image, Tag, message, Space, Statistic, Empty, Pagination } from 'antd';
import { PictureOutlined, AppstoreOutlined } from '@ant-design/icons';
import type { Photo } from '../../../types';
import { fetchPhotos } from '../../../api';
import '../style/index.less';

interface PhotoGalleryState {
  data: Photo[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
}

class PhotoGallery extends React.Component<object, PhotoGalleryState> {
  state: PhotoGalleryState = {
    data: [],
    loading: false,
    currentPage: 1,
    pageSize: 12,
    total: 0,
  };

  componentDidMount(): void {
    this.fetchData();
  }

  fetchData = (): void => {
    this.setState({ loading: true });
    fetchPhotos({ _page: this.state.currentPage, _limit: this.state.pageSize })
      .then(({ data, total }) =>
        this.setState({
          data: data.map((p) => ({
            ...p,
            thumbnailUrl: p.thumbnailUrl.replace('via.placeholder.com', 'placehold.co'),
            url: p.url.replace('via.placeholder.com', 'placehold.co'),
          })),
          total,
        }),
      )
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
    const { data, loading, currentPage, pageSize, total } = this.state;
    const albumIds = new Set(data.map((p) => p.albumId));

    return (
      <div className="photo-gallery">
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card hoverable>
              <Statistic
                title="图片总量"
                value={total}
                prefix={<PictureOutlined />}
                styles={{ content: { color: '#1677ff', fontWeight: 700 } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card hoverable>
              <Statistic
                title="相册数"
                value={albumIds.size}
                prefix={<AppstoreOutlined />}
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

        <Tag color="purple" style={{ marginBottom: 16 }}>
          <PictureOutlined /> {total} 张图片
        </Tag>

        <Spin spinning={loading}>
          {data.length > 0 ? (
            <Row gutter={[12, 12]}>
              {data.map((photo: Photo) => (
                <Col xs={24} sm={12} md={8} lg={6} key={photo.id}>
                  <Card
                    hoverable
                    className="photo-card"
                    size="small"
                    cover={
                      <Image
                        className="photo-thumb"
                        src={photo.thumbnailUrl}
                        alt={photo.title}
                        preview={{ src: photo.url }}
                        fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect fill='%23f0f0f0' width='150' height='150'/%3E%3Ctext fill='%23bfbfbf' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E"
                      />
                    }
                  >
                    <Card.Meta
                      title={<span className="photo-meta">{photo.title.slice(0, 18)}…</span>}
                      description={
                        <Space size={4}>
                          <Tag color="geekblue">相册#{photo.albumId}</Tag>
                          <Tag color="default">#{photo.id}</Tag>
                        </Space>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            !loading && <Empty description="暂无图片" />
          )}
        </Spin>

        <div className="pagination-wrapper">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={this.handlePageChange}
            showSizeChanger
            showQuickJumper
            pageSizeOptions={['12', '24', '48']}
            showTotal={(t) => `共 ${t} 张图片`}
          />
        </div>
      </div>
    );
  }
}

export default PhotoGallery;
