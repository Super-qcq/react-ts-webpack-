/**
 * 电商系统 — 类型定义
 * 所有业务实体的 TS 接口集中在这里，组件和 API 层从这导入。
 */

// ====== 核心业务实体 ======

/** 商品 */
export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
  tags: string[];
}

/** 购物车 */
export interface Cart {
  id: number;
  userId: number;
  products: CartProduct[];
  total: number;
  discountedTotal: number;
  totalProducts: number;
  totalQuantity: number;
}

/** 购物车里的单品 */
export interface CartProduct {
  id: number;
  title: string;
  price: number;
  quantity: number;
  total: number;
  discountPercentage: number;
  discountedTotal: number;
  thumbnail: string;
}

/** 客户 */
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  maidenName?: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  username: string;
  image: string;
  address?: { city: string };
}

// ====== 通用 ======

/** 分页查询参数 */
export interface PageParams {
  _page?: number;
  _limit?: number;
  skip?: number;
  [key: string]: string | number | undefined;
}

/** DummyJSON 分页响应格式 */
export interface DummyResponse<T> {
  products?: T[];
  carts?: T[];
  users?: T[];
  total: number;
  skip: number;
  limit: number;
}

/** 分页查询结果 */
export interface ListResult<T> {
  list: T[];
  total: number;
}
