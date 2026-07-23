import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Button, Space } from 'antd';
import {
  HomeOutlined,
  InfoCircleOutlined,
  SoundOutlined,
  CheckSquareOutlined,
  CameraOutlined,
  MessageOutlined,
  FolderOutlined,
} from '@ant-design/icons';

// 🌟 页面组件（7 个页面，覆盖 JSONPlaceholder 全部 6 类 API）
import Home from './pages/home';
import About from './pages/about';
import Posts from './pages/posts';
import Comments from './pages/comments';
import Albums from './pages/albums';
import Todos from './pages/todos';
import Photos from './pages/photos';

// ====== 🌟 导航配置（集中管理路由、标签、图标） ======
const NAV_ITEMS = [
  { path: '/home', label: '学生列表', icon: <HomeOutlined /> },
  { path: '/posts', label: '校园公告', icon: <SoundOutlined /> },
  { path: '/comments', label: '评论留言', icon: <MessageOutlined /> },
  { path: '/albums', label: '相册列表', icon: <FolderOutlined /> },
  { path: '/todos', label: '待办事项', icon: <CheckSquareOutlined /> },
  { path: '/photos', label: '校园相册', icon: <CameraOutlined /> },
  { path: '/about', label: '关于系统', icon: <InfoCircleOutlined /> },
];

// ====== 🌟 布局组件：顶部导航 + 路由内容 ======
const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 🌟 用于判断当前路由，动态高亮按钮

  return (
    <div style={{ padding: 40, background: '#f0f2f5', minHeight: '100vh' }}>
      {/* ===== 顶部导航区 ===== */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Space size="middle" wrap>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                type={isActive ? 'primary' : 'default'} // 🌟 当前页高亮
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
      <div style={{ background: '#fff', padding: 24, borderRadius: 8, minHeight: 400 }}>
        <Routes>
          {/* 🌟 默认跳转首页 */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/comments" element={<Comments />} />
          <Route path="/albums" element={<Albums />} />
          <Route path="/todos" element={<Todos />} />
          <Route path="/photos" element={<Photos />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </div>
  );
};

// ====== 🌟 应用入口 ======
const App = () => (
  <HashRouter>
    <AppLayout />
  </HashRouter>
);

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
