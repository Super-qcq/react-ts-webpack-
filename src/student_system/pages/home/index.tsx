import { Typography, Tag, Space } from 'antd';
import { HomeOutlined, ApiOutlined } from '@ant-design/icons';
import StudentTable from './component/StudentTable';

const { Title, Paragraph } = Typography;

/**
 * Home 页面 — 学生列表
 * 职责：标题 + 描述 + 引入 StudentTable 组件
 * 数据请求全部由 StudentTable 内部管理
 */
const Home = () => {
  return (
    <div>
      {/* ===== 页面标题 ===== */}
      <Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>
        <HomeOutlined /> 学生列表
      </Title>
      <Paragraph type="secondary" style={{ marginBottom: 16 }}>
        通过 /api/users 代理模式获取 JSONPlaceholder 数据， 支持服务端分页与翻页。
      </Paragraph>

      {/* ===== 代理说明 ===== */}
      <Space style={{ marginBottom: 20 }}>
        <Tag icon={<ApiOutlined />} color="blue">
          开发：localhost:8080 → devServer 代理
        </Tag>
        <Tag icon={<ApiOutlined />} color="green">
          生产：_worker.js → Cloudflare 代理
        </Tag>
      </Space>

      {/* ===== 核心表格组件 ===== */}
      <StudentTable />
    </div>
  );
};

export default Home;
