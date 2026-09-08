import { Typography } from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import QuoteList from './component/QuoteList';

const { Title } = Typography;

/** 每日一言 — 标题 + QuoteList */
const Quotes = () => (
  <div>
    <Title level={4} style={{ marginTop: 0, marginBottom: 20 }}>
      <BulbOutlined /> 每日一言
    </Title>
    <QuoteList />
  </div>
);

export default Quotes;
