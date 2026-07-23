import React from 'react';
import { Card, Button, Typography } from 'antd';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import SystemInfo from './component/SystemInfo';
import './style/index.less';

const { Title, Paragraph } = Typography;

// 🌟 TS 接口
interface AboutProps {
  navigate: NavigateFunction;
}

// 🌟 类式组件
class AboutClass extends React.Component<AboutProps> {
  render(): React.ReactNode {
    const { navigate } = this.props;
    return (
      <div className="about-page">
        <Card variant="borderless" className="about-card">
          <Title level={2}>关于学生管理系统</Title>
          <Paragraph>
            111架构：Webpack 5 + React 19 + TypeScript 6 + Ant Design 6 + SPA HashRouter 覆盖
            JSONPlaceholder 全部 6 类 API（users / posts / comments / albums / todos / photos）
          </Paragraph>
          <SystemInfo />
          <Button type="primary" onClick={() => navigate('/home')} style={{ marginTop: 20 }}>
            返回学生列表
          </Button>
        </Card>
      </div>
    );
  }
}

// 🌟 函数式包装：useNavigate 注入类组件
const About = (): React.ReactNode => {
  const navigate = useNavigate();
  return <AboutClass navigate={navigate} />;
};

export default About;
