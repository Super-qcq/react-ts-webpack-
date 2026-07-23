/**
 * API 层单元测试
 * ==============
 * 测试 types 中的接口和 api 中的函数签名是否正确。
 * 不发起真实网络请求——测的是 TS 类型和函数形状在编译期不出错。
 *
 * 跑：npm test
 */
import { describe, it, expect } from '@jest/globals';
import type { Product, Cart, User, PageParams, ListResult } from '../types';

// ====== TS 接口验证 ======

describe('types — TS 接口结构', () => {
  it('Product 应有必需字段', () => {
    const p: Product = {
      id: 1,
      title: 'iPhone',
      description: '手机',
      price: 999,
      discountPercentage: 10,
      rating: 4.5,
      stock: 50,
      brand: 'Apple',
      category: 'smartphones',
      thumbnail: 'https://example.com/img.jpg',
      images: [],
      tags: ['phone'],
    };
    expect(p.id).toBe(1);
    expect(p.title).toBe('iPhone');
  });

  it('Cart 应有必需字段', () => {
    const c: Cart = {
      id: 1,
      userId: 1,
      products: [],
      total: 0,
      discountedTotal: 0,
      totalProducts: 0,
      totalQuantity: 0,
    };
    expect(c.id).toBe(1);
    expect(c.products).toEqual([]);
  });

  it('User 应有必需字段', () => {
    const u: User = {
      id: 1,
      firstName: '张',
      lastName: '三',
      age: 25,
      gender: 'male',
      email: 'zhang@test.com',
      phone: '13800001111',
      username: 'zhangsan',
      image: 'https://example.com/avatar.jpg',
    };
    expect(u.firstName).toBe('张');
    expect(u.age).toBe(25);
  });

  it('PageParams 应支持字符串和数字值', () => {
    const params: PageParams = { _page: 1, _limit: 10, userId: '3' };
    expect(params._page).toBe(1);
    expect(params.userId).toBe('3');
  });

  it('ListResult 泛型应正确匹配', () => {
    const result: ListResult<Product> = {
      list: [],
      total: 100,
    };
    expect(result.total).toBe(100);
  });
});
