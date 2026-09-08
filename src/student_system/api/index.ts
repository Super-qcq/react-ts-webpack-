/**
 * 学生管理系统 — 统一 API 请求层
 * /api/* → webpack devServer.proxy → jsonplaceholder
 * 类型定义见 ../types
 */
import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { Student, Post, Comment, Todo, Photo, Album, PageParams, ListResult } from '../types';

// ====== 工具 ======

function extractTotal(res: AxiosResponse): number {
  return parseInt(String(res.headers['x-total-count'] || '0'), 10);
}

// ====== API 方法 ======

/** 学生列表 */
export async function fetchStudents(params: PageParams): Promise<ListResult<Student>> {
  const res = await axios.get<Student[]>('/api/users', { params });
  return { data: res.data, total: extractTotal(res) };
}

/** 公告列表 */
export async function fetchPosts(params: PageParams): Promise<ListResult<Post>> {
  const res = await axios.get<Post[]>('/api/posts', { params });
  return { data: res.data, total: extractTotal(res) };
}

/** 评论列表 */
export async function fetchComments(params: PageParams): Promise<ListResult<Comment>> {
  const res = await axios.get<Comment[]>('/api/comments', { params });
  return { data: res.data, total: extractTotal(res) };
}

/** 待办列表 */
export async function fetchTodos(params: PageParams): Promise<ListResult<Todo>> {
  const res = await axios.get<Todo[]>('/api/todos', { params });
  return { data: res.data, total: extractTotal(res) };
}

/** 相册图片列表 */
export async function fetchPhotos(params: PageParams): Promise<ListResult<Photo>> {
  const res = await axios.get<Photo[]>('/api/photos', { params });
  return { data: res.data, total: extractTotal(res) };
}

/** 相册列表 */
export async function fetchAlbums(params: PageParams): Promise<ListResult<Album>> {
  const res = await axios.get<Album[]>('/api/albums', { params });
  return { data: res.data, total: extractTotal(res) };
}

// ====== 嵌套资源 API（/users/:id/xxx） ======

/** 某学生的公告列表 */
export async function fetchUserPosts(userId: number): Promise<Post[]> {
  const res = await axios.get<Post[]>(`/api/users/${userId}/posts`);
  return res.data;
}

/** 某学生的相册列表 */
export async function fetchUserAlbums(userId: number): Promise<Album[]> {
  const res = await axios.get<Album[]>(`/api/users/${userId}/albums`);
  return res.data;
}

/** 某学生的待办列表 */
export async function fetchUserTodos(userId: number): Promise<Todo[]> {
  const res = await axios.get<Todo[]>(`/api/users/${userId}/todos`);
  return res.data;
}
