/**
 * 学生系统 — 全局常量
 * 放：分页默认值、色板、排序选项等被多个页面引用的常量
 */
import {
  TeamOutlined,
  UserOutlined,
  IdcardOutlined,
  CrownOutlined,
  FileTextOutlined,
  MessageOutlined,
  PictureOutlined,
  FolderOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

// ====== 分页 ======

/** 默认分页配置 */
export const PAGE_DEFAULTS = {
  users: 5,
  posts: 10,
  comments: 8,
  albums: 12,
  todos: 10,
  photos: 12,
} as const;

/** 分页条数选项 */
export const PAGE_SIZE_OPTIONS = ['5', '10', '20', '50'] as string[];

// ====== 颜色 ======

/** 头像色板（用于没有头像图片的场景） */
export const AVATAR_COLORS = [
  '#f56a00',
  '#7265e6',
  '#ffbf00',
  '#00a2ae',
  '#1677ff',
  '#52c41a',
  '#eb2f96',
  '#722ed1',
];

/** 统计数值颜色 */
export const STAT_COLORS = {
  primary: '#1677ff',
  success: '#52c41a',
  warning: '#fa8c16',
  purple: '#722ed1',
  red: '#ff4d4f',
  cyan: '#13c2c2',
} as const;

// ====== 页面配置（图标 + API 端点） ======

/** 各页面统计卡片预设 */
export const PAGE_STATS = {
  home: [
    { key: 'total', title: '学生总人数', icon: TeamOutlined, color: '#1677ff' },
    { key: 'current', title: '当前页人数', icon: UserOutlined, color: '#52c41a' },
    { key: 'pages', title: '总页数', icon: IdcardOutlined, color: '#722ed1' },
    { key: 'source', title: '数据来源', icon: CrownOutlined, color: '#fa8c16' },
  ],
  posts: [
    { key: 'total', title: '公告总数', icon: FileTextOutlined, color: '#1677ff' },
    { key: 'authors', title: '当前页作者数', icon: UserOutlined, color: '#52c41a' },
    { key: 'pages', title: '总页数', icon: IdcardOutlined, color: '#fa8c16' },
  ],
  comments: [
    { key: 'total', title: '评论总数', icon: MessageOutlined, color: '#13c2c2' },
    { key: 'posts', title: '涉及帖子', icon: FileTextOutlined, color: '#722ed1' },
    { key: 'pages', title: '总页数', icon: IdcardOutlined, color: '#fa8c16' },
  ],
  albums: [
    { key: 'total', title: '相册总数', icon: FolderOutlined, color: '#722ed1' },
    { key: 'current', title: '当前页', icon: FolderOutlined, color: '#1677ff' },
    { key: 'pages', title: '总页数', icon: IdcardOutlined, color: '#fa8c16' },
  ],
  todos: [
    { key: 'total', title: '总任务数', icon: CheckCircleOutlined, color: '#1677ff' },
    { key: 'done', title: '已完成', icon: CheckCircleOutlined, color: '#52c41a' },
    { key: 'undone', title: '待完成', icon: CheckCircleOutlined, color: '#ff4d4f' },
  ],
  photos: [
    { key: 'total', title: '图片总量', icon: PictureOutlined, color: '#1677ff' },
    { key: 'albums', title: '当前页相册数', icon: FolderOutlined, color: '#722ed1' },
    { key: 'pages', title: '总页数', icon: IdcardOutlined, color: '#fa8c16' },
  ],
};
