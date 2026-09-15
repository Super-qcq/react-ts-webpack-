import { Typography, Tag, Space } from 'antd';
import { DatabaseOutlined, FileAddOutlined } from '@ant-design/icons';
import KnowledgeTable from './component/KnowledgeTable';
import RetrieveTest from './component/RetrieveTest';

const { Title, Paragraph } = Typography;

/**
 * Knowledge 页面 — 知识库管理
 * 职责：文件列表（多格式、索引状态、删除）+ 上传 + 全量建索引 + 检索调参测试
 */
const Knowledge = () => {
  return (
    <div>
      <Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>
        <DatabaseOutlined /> 知识库管理
      </Title>
      <Paragraph type="secondary" style={{ marginBottom: 16 }}>
        支持多格式文档（PDF / Word / Markdown / 网页 / JSON / CSV / TXT），
        上传后自动完成「加载 → 切割 → 向量化 → Milvus 存储」。
      </Paragraph>

      <Space style={{ marginBottom: 20 }} wrap>
        <Tag icon={<FileAddOutlined />} color="blue">
          多格式加载
        </Tag>
        <Tag color="green">中文递归切割</Tag>
        <Tag color="purple">Milvus COSINE 检索</Tag>
      </Space>

      <KnowledgeTable />
      <RetrieveTest />
    </div>
  );
};

export default Knowledge;
