/**
 * 电商系统 — API 请求层
 * /shop-api/* → webpack devServer 代理 → https://dummyjson.com
 * 类型定义见 ../types
 */
import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { Product, Cart, User, PageParams, DummyResponse, ListResult } from '../types';

// ====== 工具 ======
const BASE = '/shop-api';

function getTotal<T>(res: AxiosResponse<DummyResponse<T>>): number {
  return res.data.total || 0;
}

// ====== API ======

/** 商品列表（分页 + 搜索 + 分类） */
export async function fetchProducts(params: PageParams = {}): Promise<ListResult<Product>> {
  const url = params.q ? `${BASE}/products/search` : `${BASE}/products`;
  const res = await axios.get<DummyResponse<Product>>(url, { params });
  return { list: res.data.products || [], total: getTotal(res) };
}

/** 商品分类 */
export async function fetchCategories(): Promise<{ slug: string; name: string }[]> {
  const res = await axios.get<{ slug: string; name: string; url: string }[]>(
    `${BASE}/products/categories`,
  );
  return res.data.map((c) => ({ slug: c.slug, name: c.name }));
}

/** 加入购物车 */
export async function addToCart(
  userId: number,
  productId: number,
  quantity: number,
): Promise<Cart> {
  const res = await axios.post<Cart>(`${BASE}/carts/add`, {
    userId,
    products: [{ id: productId, quantity }],
  });
  return res.data;
}

/** 购物车列表 */
export async function fetchCarts(params: PageParams = {}): Promise<ListResult<Cart>> {
  const res = await axios.get<DummyResponse<Cart>>(`${BASE}/carts`, { params });
  return { list: res.data.carts || [], total: getTotal(res) };
}

/** 客户列表 */
export async function fetchUsers(params: PageParams = {}): Promise<ListResult<User>> {
  const res = await axios.get<DummyResponse<User>>(`${BASE}/users`, { params });
  return { list: res.data.users || [], total: getTotal(res) };
}
