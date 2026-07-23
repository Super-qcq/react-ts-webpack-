import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Button, Space } from 'antd';
import {
  HomeOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

// 🌟 页面组件
import Home from './pages/home';
import Carts from './pages/carts';
import Users from './pages/users';
import About from './pages/about';

// 🌟 导航配置
const NAV_ITEMS = [
  { path: '/home', label: '商品中心', icon: <HomeOutlined /> },
  { path: '/carts', label: '购物车', icon: <ShoppingCartOutlined /> },
  { path: '/users', label: '客户管理', icon: <UserOutlined /> },
  { path: '/about', label: '关于商城', icon: <InfoCircleOutlined /> },
];

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{ padding: 40, background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 顶部导航 */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
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

      {/* 内容区 */}
      <div style={{ background: '#fff', padding: 24, borderRadius: 8, minHeight: 400 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/carts" element={<Carts />} />
          <Route path="/users" element={<Users />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => (
  <HashRouter>
    <AppLayout />
  </HashRouter>
);
createRoot(document.getElementById('root') as HTMLElement).render(<App />);
