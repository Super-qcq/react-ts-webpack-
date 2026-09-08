# React + TypeScript + Webpack 5 多项目构建脚手架

> **现代 MPA（多页应用）架构 + AI 智能体自动化工程搭建白皮书**
>
> 一个仓库，N 个项目。各自独立入口、独立打包、互不干扰。完美适配 React 19 + TypeScript 6 + Webpack 5 新特性。

---

## 目录

- [核心亮点：多项目共存，按需打包](#核心亮点多项目共存按需打包)
- [技术栈](#技术栈)
- [终极目录结构](#终极目录结构)
- [从零搭建全过程](#从零搭建全过程)
- [快速开始（已有项目）](#快速开始已有项目)
- [配置文件详解](#配置文件详解)
- [Webpack 5 工程化能力全景](#webpack-5-工程化能力全景)
- [代码质量工具链](#代码质量工具链)
- [编译与启动命令速查](#编译与启动命令速查)
- [结合 AI 智能体进行智能化开发](#结合-ai-智能体进行智能化开发)
- [生产部署](#生产部署)
- [为什么选这套组合](#为什么选这套组合)
- [示例项目](#示例项目)

---

## 核心亮点：多项目共存，按需打包

这个脚手架和普通 React 脚手架最大的区别是：**它不是只为一个项目服务的**。

普通脚手架 `src/` 下面只有一个项目，而这个脚手架通过 `build/configs.js` 注册表，可以在同一个仓库里放任意多个独立项目：

```
同一个仓库
├── 学生管理系统（student-system）  ← 9 个页面 + 完整企业级工程化
├── 电商管理系统（shop-system）    ← 9 个页面 + 交互功能
├── 教师管理系统（teacher-system）  ← 随时加
└── ...你想加多少加多少
```

### 怎么做到的？

```
命令行传参 module=xxx
        │
        ▼
build/configs.js   ← 查注册表，找到这个项目
        │
        ▼
src/xxx/config.js  ← 读这个项目的 Webpack 配置
        │
        ▼
webpack.config.js  ← 动态组装 entry 和 plugins
        │
        ▼
dist/xxx/          ← 输出到这个项目的独立目录
```

### 加一个新项目有多简单？

**就两步，不改主配置：**

1. `build/configs.js` 里注册一行：
```js
module.exports = [
    { name: 'student-system',  path: 'src/student_system/config.js' },
    { name: 'new-project',     path: 'src/new_project/config.js' },  // 新增
];
```

2. `src/new_project/` 下丢 `config.js` + `index.tsx` + `index.html` 即可。

---

## 技术栈

| 层 | 技术 | 说明 |
|---|------|------|
| UI 框架 | React | 最新稳定版 |
| 类型系统 | TypeScript | 最新稳定版 |
| 打包工具 | Webpack | 5.x |
| UI 组件库 | Ant Design | 最新稳定版 |
| 路由 | React Router | 最新稳定版 (HashRouter) |
| HTTP | Axios | 最新稳定版 |
| 样式 | Less + CSS | - |
| 编译 | Babel 7 + thread-loader | - |
| 代码规范 | ESLint 9 + Prettier 3 | - |
| 测试 | Jest + ts-jest | 主版本必须一致 |
| 部署 | Cloudflare Pages | 免费 |

---

## 终极目录结构

以学生管理系统为例——每个模块内部采用企业级标准的 `pages/` + `types/` + `api/` + 共享目录布局：

```
tsreactdemo2/
├── build/
│   └── configs.js              # 🌟 全局注册表
├── dist/
│   └── student-system/         # 打包产物（Cloudflare Pages 直接部署）
│       ├── js/                 # main.js, vendors.js
│       ├── css/                # 独立 CSS 文件
│       ├── _worker.js          # Cloudflare Pages 代理
│       └── index.html
├── src/
│   └── student_system/         # 🌟 学生管理系统
│       │
│       │  ═══ 核心 ═══
│       ├── config.js           # Webpack 配置（含 staticFrom）
│       ├── index.html          # HTML 模板
│       ├── index.tsx           # 入口（HashRouter + 导航高亮）
│       ├── _worker.js          # CF Pages 代理源码
│       ├── global.d.ts         # .less 类型声明
│       ├── serve.js            # 本地生产环境模拟服务器（Node.js）
│       │
│       │  ═══ pages/ ═══
│       ├── pages/
│       │   ├── home/           # 学生列表（/api/users）
│       │   │   ├── index.tsx
│       │   │   ├── style/index.less
│       │   │   └── component/StudentTable.tsx
│       │   ├── posts/          # 校园公告（/api/posts）
│       │   ├── comments/       # 评论留言（/api/comments）
│       │   ├── albums/         # 相册列表（/api/albums）
│       │   ├── todos/          # 待办事项（/api/todos）
│       │   ├── photos/         # 校园相册（/api/photos）
│       │   └── about/          # 关于系统
│       │
│       │  ═══ 基础设施 ═══
│       ├── api/index.ts        # API 请求层
│       ├── types/index.ts      # TS 接口集中管理
│       ├── components/         # 共享组件
│       ├── utils/              # 工具函数
│       ├── hooks/              # 自定义 Hooks
│       └── constants/          # 常量/配置
│
├── .eslint.config.mjs          # ESLint 9
├── .prettierrc                 # Prettier
├── jest.config.js              # Jest
├── .github/workflows/ci.yml    # CI/CD
├── package.json                # 依赖清单 + 全部命令脚本
├── tsconfig.json               # TypeScript 编译配置
└── webpack.config.js           # 🌟 核心构建引擎
```

---

## 从零搭建全过程

### 一、基础安装与初始化

**1. 创建项目**
```bash
mkdir tsreactdemo2 && cd tsreactdemo2 && npm init -y
```

**2. Webpack 全家桶**
```bash
npm i webpack@^5 webpack-cli@^7 webpack-dev-server@^6 -D
```

**3. React + 业务依赖**
```bash
npm i react@^19 react-dom@^19 react-router-dom@^7 axios@^1 antd@^6 @babel/runtime@^7 -S
```

**4. TypeScript**
```bash
npm i @types/react@^19 @types/react-dom@^19 typescript@^6 -D
```

> ⚠️ **TypeScript 锁在 `^6`**：ts-jest 和 @typescript-eslint 当前最新版只支持 `typescript < 7`，
> 装 TS 7 会导致这两个包报 peer dependency 不兼容。等它们跟上后再手动升。

**5. Loader 和 Plugin（含 style-loader，.less 样式必需）**
```bash
npm i html-webpack-plugin@^5 mini-css-extract-plugin@^2 terser-webpack-plugin@^5 copy-webpack-plugin@^14 thread-loader@^4 style-loader@^4 css-loader@^7 less@^4 less-loader@^13 babel-loader@^10 @babel/core@^7 @babel/preset-env@^7 @babel/preset-react@^7 @babel/preset-typescript@^7 @babel/plugin-transform-runtime@^7 @babel/plugin-syntax-dynamic-import@^7 @babel/plugin-transform-class-properties@^7 @babel/plugin-proposal-decorators@^7 babel-plugin-import@^1 -D
```

**6. 代码规范（ESLint 9 + Prettier）**
```bash
npm i eslint@^9 prettier@^3 @typescript-eslint/parser@^8 @typescript-eslint/eslint-plugin@^8 eslint-plugin-react@^7 eslint-plugin-react-hooks@^7 eslint-config-prettier@^10 -D
```

**7. 测试（Jest + ts-jest）**
```bash
npm i jest@^30 @types/jest@^30 ts-jest@^29 -D
```

> ⚠️ **ts-jest 锁在 `^29`**：ts-jest 目前没有 v30，但它声明了 `peerDependencies: { jest: "^29 || ^30" }`，
> 所以装 jest 30 没问题。等 ts-jest 发布 v30 后把两处 `^29` → `^30`。

**⚠️ 8. 装完必做：漏洞修复 + 版本验证**

```bash
# 修复间接依赖的已知漏洞（uuid / glob 等废弃警告）
npm audit fix

# 列出核心包的主版本，确认没有 peer dependency 报错
npm ls webpack react typescript jest ts-jest eslint --depth=0

# 如果 npm ls 报错，检查具体哪个包 peer dep 不匹配：
# npm ls 2>&1 | grep -E "UNMET|PEER"
```

> **为什么锁主版本号 `@^主版本` 是最稳妥的策略？**
>
> | 策略 | 平时 | 升级时 |
> |------|------|--------|
> | 不锁版本 | 某天突然跳大版本 → 配置文件当场炸 | 被动修，措手不及 |
> | **锁主版本（推荐）** | **安全，只拿 bug/安全修复** | **你主动选时机升，一次一个包** |
> | 写死完整版本 | 安全但越来越旧 | 攒了几年一次升 → 地狱难度 |
>
> `@^主版本` 的意思是：`webpack@^5` = 永远 5.x 最新，不跳到 6。
> 这套包里真正有大版本绑定关系的（如 jest+ts-jest），放同一条命令让 npm 一次性解析对齐。
>
> `npm audit fix` 只做 patch 级别的安全更新，不会跨主版本，所以不会破坏项目。

### 二、根目录配置文件

**9. package.json scripts**

```json
{
  "scripts": {
    "start": "webpack serve --mode development --open",
    "build": "webpack --progress --mode production",
    "build:all": "webpack --progress --mode production",
    "lint": "eslint src/ --ext .ts,.tsx",
    "lint:fix": "eslint src/ --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,less,json}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,less,json}\"",
    "check": "npm run lint && npm run format:check",
    "test": "jest"
  }
}
```

**10. tsconfig.json 关键配置**

| 配置 | 值 | 为什么 |
|------|-----|--------|
| `jsx` | `react-jsx` | React 19 不用写 `import React` |
| `moduleResolution` | `bundler` | 模块解析交给 Webpack |
| `module` / `target` | `esnext` | 语法降级全交给 Babel |
| `skipLibCheck` | `true` | 编译速度大幅提升 |

完整文件见 [tsconfig.json](tsconfig.json)。

**11. .prettierrc（代码格式化）**

```json
{ "semi": true, "singleQuote": true, "tabWidth": 2, "trailingComma": "all", "printWidth": 100, "endOfLine": "lf" }
```

**12. 创建 `eslint.config.mjs`** — 完整文件：[eslint.config.mjs](eslint.config.mjs)

**13. 创建 `jest.config.js`** — 完整文件：[jest.config.js](jest.config.js)

**14. 创建 `.github/workflows/ci.yml`** — 完整文件：[ci.yml](.github/workflows/ci.yml)

### 三、多模块目录结构搭建

**15. 创建 `build/configs.js`**
```js
module.exports = [
    { name: 'student-system', path: 'src/student_system/config.js' },
    { name: 'shop-system',    path: 'src/shop_system/config.js' },
];
```

**16. 创建 `src/student_system/config.js`（含 staticFrom）**
```js
module.exports = {
    // _worker.js 不经 Webpack 编译，构建时原样复制到 dist/ 根目录
    staticFrom: ['src/student_system/_worker.js'],
    webpack: [
        {
            source: ['src/student_system/index.tsx'],
            target: 'dist/student_system/js',
            name: 'main',
            htmlPath: 'src/student_system/',
            htmlName: 'index',
            htmlType: 'html',
        },
    ],
};
```

**17. 创建 `src/student_system/global.d.ts`** — 不加这行 import '*.less' 报红线
```ts
declare module '*.less' { const content: Record<string, string>; export default content; }
```

**18. 创建 `webpack.config.js`** — 核心构建大管家

> 完整文件见 [webpack.config.js](webpack.config.js)。

---

## 快速开始（已有项目）

```bash
npm install
npm run start --module=student-system
# 浏览器打开 http://localhost:8080
```

---

## 配置文件详解

| 文件 | 角色 | 修改频率 |
|------|------|----------|
| `build/configs.js` | 全局注册表——有哪些模块 | 加新模块时改 |
| `src/xxx/config.js` | 模块局部配置——入口、模板、staticFrom | 结构调整时改 |
| `webpack.config.js` | 核心管线——编译、优化、输出 | 几乎不改 |

---

## Webpack 5 工程化能力全景

**编译链路**：`.tsx` → thread-loader → Babel（env + TS + React）→ JS + Source Map

| 能力 | 工具 |
|------|------|
| HMR | `hot: true` |
| 跨域代理 | `devServer.proxy`（`/api` → 后端） |
| SPA 路由 | `historyApiFallback` |
| JS 压缩 | TerserPlugin（排除 `_worker.js`） |
| CSS 抽离 | MiniCssExtractPlugin |
| 代码分割 | splitChunks（vendors） |
| Tree Shaking | production mode |
| 缓存 | thread-loader + babel + filesystem |

---

## 代码质量工具链

项目中已配置全套企业级代码质量工具，开箱即用：

| 工具 | 配置文件 | 作用 |
|------|----------|------|
| ESLint 9 | `eslint.config.mjs` | 检查 TS 类型错误、未用变量、any 类型、React Hook 规则 |
| Prettier | `.prettierrc` | 统一代码格式（单引号/分号/缩进/换行/100字符换行） |
| Jest + ts-jest | `jest.config.js` | 单元测试，TS 直接跑，不需要额外编译 |
| GitHub Actions | `.github/workflows/ci.yml` | 每次 git push 自动 type-check -> lint -> test -> 双模块构建 |


### 命令详解

#### `npm run lint` — 代码检查

调用 ESLint 扫描 `src/` 下所有 `.ts` `.tsx` 文件，根据规则报出 warning 和 error。**只报告，不改文件。**

能查出什么：
- 未使用的 import / 变量 / 函数（`@typescript-eslint/no-unused-vars`）
- `any` 类型滥用（`@typescript-eslint/no-explicit-any`）
- `var` 声明（`no-var`，建议用 let/const）
- `let` 从不重新赋值（`prefer-const`，建议用 const）

#### `npm run lint:fix` — 自动修复

在 `npm run lint` 基础上，对**能安全自动修**的问题直接改文件。

| 能自动修 | 不能自动修（需手动） |
|----------|-------------------|
| `var` → `const`（no-var + prefer-const 连击） | 未使用的 `const` 变量（可能有副作用） |
| `let` 从不改值 → `const`（prefer-const） | `any` 类型（不确定改成什么类型） |
| | 未使用的 import（ESLint 当前版本不支持 fix） |

实际测试：建文件写 `var x = 1` + `let y = 2`，跑 `npm run lint:fix`，打开文件——`var` 和 `let` 都变成了 `const`。

#### `npm run format` — 一键格式化

调用 Prettier，按 `.prettierrc` 规则重写所有源码文件。自动修复：
- 双引号 → 单引号
- 缺分号 → 补分号
- 双分号 `;;` → 单分号 `;`
- 乱缩进 → 2 空格缩进
- 多余空格/空行 → 删除
- 对象/数组尾逗号 → 补全

#### `npm run format:check` — 格式检查（不改文件）

和 `npm run format` 规则相同，但**只报告**哪些文件格式不对，不修改文件。CI 专用。

#### `npm run check` — 提交前一键全查

等于 `npm run lint && npm run format:check`。只报告，不修改。提交前跑一次，0 error 0 warning 就是干净的。

#### `npm test` — 单元测试

Jest + ts-jest 运行 `__tests__/*.ts`，TS 直接跑，不需要预编译。

```bash
npm test                  # 跑一次
npm test -- --watch       # 监听模式，改代码自动重跑
npm test -- --coverage    # 生成覆盖率报告
```

### 测试体验

新建一个 `__test.tsx` 文件写入以下代码，然后逐个跑命令观察文件变化：

```ts
// 测试 lint:fix
import React from 'react';
var oldStyle = '旧写法';
let neverChange = 123;
const Demo = () => <div>{neverChange}</div>;
```

```bash
npm run lint          # 看：报 no-var + prefer-const
npm run lint:fix      # 看：var→const, let→const
```

```ts
// 测试 format
import   React   from   "react";
const   a   =   1;;
const   b   =   "hello";;
```

```bash
npm run format        # 看：空格消失、;;→;、"→'
```

```bash
npm run check         # 检查全部
npm run lint:fix && npm run format  # 修复全部
npm run check         # 全绿
```


### 日常工作流

```bash
npm run lint:fix   # 写完代码 -> 自动修
npm run format     # 统一风格
npm test           # 确认没坏
npm run check      # 提交前最终检查
```

---

## 编译与启动命令速查

```bash
# 开发
npm run start --module=student-system

# 打包
npm run build --module=student-system   # → dist/student-system/

# 质量
npm test              # Jest 测试
npm run lint          # ESLint 检查
npm run format        # Prettier 格式化
npm run check         # lint + format

# 本地预览（模拟 Cloudflare 生产环境）
node src/student_system/serve.js      # → http://localhost:8081
```

---

## 结合 AI 智能体进行智能化开发

### 1. 让 AI 成为「模块脚手架」

新建模块时不要手建文件夹。对 AI 说：

> "我是 Webpack 多模块应用。帮我新建 xxx-system：
> 1. 在 `src/` 下创建模块文件夹，参照 `src/student_system` 结构生成全部文件
> 2. 在 `build/configs.js` 注册"

### 2. AI 辅助调试

> "`npm run build --module=student-system` 报错了，帮我分析。"

---

## 生产部署

**线上访问地址：** https://react-ts-webpack.pages.dev

**Cloudflare 账号：** 使用 Google 账号 OAuth 登录（非邮箱/密码注册，非 GitHub 登录）

### Cloudflare Pages（免费）

| 字段 | 值 |
|------|-----|
| Pages 项目名 | `react-ts-webpack` |
| Build command | `npm run build --module=student-system` |
| Build output directory | `dist/student-system` |
| 关联 GitHub 仓库 | `Super-qcq/react-ts-webpack-` |

### API 代理（三处配置）

| # | 文件 | 改动 |
|---|------|------|
| 1 | `_worker.js` | 新建 — 拦截 `/api/*` 转发后端 |
| 2 | `config.js` | 加 `staticFrom` — 原样复制到 dist/ |
| 3 | `webpack.config.js` | TerserPlugin 加 `exclude: /_worker\.js$/` |

### 本地预览

```bash
node src/student_system/serve.js      # → http://localhost:8081
```

---

## 为什么选这套组合？

### React 19 + TypeScript 6
类型安全 + IDE 智能提示 + 不用手动 `import React`

### Webpack 5（而不是 Vite）
多入口多输出 + 注册表动态 entry + 10 年生态

### Ant Design 6
Table / Card / Statistic 开箱即用

---

## 示例项目：学生管理系统

9 个页面，覆盖 JSONPlaceholder 全部 6 类 API：

| 页面 | API | 亮点 |
|------|-----|------|
| 数据看板 | 全部 6 类 API | Promise.all 并发聚合 + Statistic + 完成率 |
| 学生列表 | `/api/users` | Avatar + Statistic + 分页 |
| 学生详情 | `/api/users/:id/posts` 等 | 嵌套资源 + Tabs + 按学生筛选 |
| 校园公告 | `/api/posts` | 卡片列表 + 搜索 + 展开全文 |
| 评论留言 | `/api/comments` | 聊天气泡 + 按帖子筛选 |
| 相册列表 | `/api/albums` | 渐变色封面卡片 |
| 待办事项 | `/api/todos` | 完成率进度圈 |
| 校园相册 | `/api/photos` | Card 网格 + 大图预览 |
| 关于系统 | — | Descriptions + Timeline |

## 示例项目：电商管理系统

9 个页面，覆盖 DummyJSON 商品 / 购物车 / 用户 / 名言 / 菜谱 / 帖子 / 待办 / 评论：

| 页面 | API | 亮点 |
|------|-----|------|
| 商品中心 | `/shop-api/products` | 搜索 + 分类 + 折扣标签 + 收藏 |
| 购物车 | `/shop-api/carts` | 订单统计 + 商品明细 |
| 客户管理 | `/shop-api/users` | 客户卡片 + 分页 |
| 每日一言 | `/shop-api/quotes` | 随机一言 + 换一句 |
| 菜谱中心 | `/shop-api/recipes` | 菜谱卡片 + 食材步骤弹窗 |
| 商城资讯 | `/shop-api/posts` | 资讯列表 + 评论弹窗 |
| 待办清单 | `/shop-api/todos` | 完成率进度圈 + 状态筛选 |
| 评论广场 | `/shop-api/comments` | 评论卡片 + 用户聚合 |
| 关于商城 | — | Descriptions + Timeline |

---

## License

ISC
