import { createRoot } from 'react-dom/client';
import { useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Button, Space, ConfigProvider } from 'antd';
import {
  MessageOutlined,
  DatabaseOutlined,
  DashboardOutlined,
  RobotOutlined,
} from '@ant-design/icons';

// 🌟 页面组件（3 个页面：问答 / 知识库 / 监控台）
import Chat from './pages/chat';
import Knowledge from './pages/knowledge';
import Monitor from './pages/monitor';
import SITE from './lib/site.config';
import BlossomDecor from './components/BlossomDecor';

// ====== 🌟 导航配置（集中管理路由、标签、图标） ======
const NAV_ITEMS = [
  { path: '/chat', label: '智能问答', icon: <MessageOutlined /> },
  { path: '/knowledge', label: '知识库管理', icon: <DatabaseOutlined /> },
  { path: '/monitor', label: '监控台', icon: <DashboardOutlined /> },
];

// ====== 🌟 布局组件：顶部导航 + 路由内容 ======
const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 🌟 用于判断当前路由，动态高亮按钮

  // 浏览器标签标题跟随配置（换学校/场景只改 lib/site.config）
  useEffect(() => {
    document.title = SITE.navBrand;
  }, []);

  return (
    <div className="rag-root" style={{ minHeight: '100vh' }}>
      {/* ===== 顶部导航区 ===== */}
      <div className="rag-nav">
        <div className="rag-brand">
          <RobotOutlined style={{ fontSize: 22, color: '#1677ff' }} />
          <span>{SITE.navBrand}</span>
        </div>
        <Space size="middle" wrap>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                type={isActive ? 'primary' : 'default'}
                icon={item.icon}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </Button>
            );
          })}
        </Space>
      </div>

      {/* ===== 内容区 ===== */}
      <div className="rag-content">
        <Routes>
          {/* 🌟 默认跳转问答页 */}
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/monitor" element={<Monitor />} />
        </Routes>
      </div>

      {/* ===== 两侧"轻量开花"装饰（纯视觉，不挡操作） ===== */}
      <BlossomDecor />
    </div>
  );
};

// ====== 🌟 应用入口 ======
const App = () => (
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#2563eb',
        colorInfo: '#2563eb',
        colorLink: '#2563eb',
        borderRadius: 8,
      },
    }}
  >
    <HashRouter>
      <AppLayout />
    </HashRouter>
  </ConfigProvider>
);

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
