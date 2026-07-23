/**
 * 学生系统 — 类型定义
 * 所有业务实体的 TS 接口集中在这里
 */

// ====== 核心业务实体 ======

/** 学生 */
export interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
}

/** 公告 */
export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

/** 评论 */
export interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

/** 待办 */
export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

/** 相册图片 */
export interface Photo {
  albumId: number;
  id: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}

/** 相册 */
export interface Album {
  userId: number;
  id: number;
  title: string;
}

// ====== 通用 ======

/** 分页查询参数 */
export interface PageParams {
  _page?: number;
  _limit?: number;
  [key: string]: string | number | undefined;
}

/** 分页结果 */
export interface ListResult<T> {
  data: T[];
  total: number;
}
