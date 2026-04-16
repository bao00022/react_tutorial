[← 返回首页](../readme.md)

# 第三章 - 使用 Vite 搭建 React 开发环境

上一章我们手动拼装了 Webpack + Babel 的开发环境，整个过程需要安装十几个包、写好几份配置文件。Vite 把这些事情都封装好了——一条命令创建项目，开箱即用。

本章目标：
1. 用 Vite 创建一个 React + TypeScript 项目
2. 读懂默认生成的每一个文件
3. 组织 `src/components/` 目录
4. 集成 Tailwind CSS
5. 清理成最小可用骨架

## 目录

1. [创建项目](#1-创建项目)
2. [默认项目结构](#2-默认项目结构)
3. [入口链路：index.html → main.tsx → App.tsx](#3-入口链路indexhtml--maintsx--apptsx)
4. [组件目录：src/components/](#4-组件目录srccomponents)
5. [vite.config.ts：插件系统](#5-viteconfigts插件系统)
6. [TypeScript 相关文件](#6-typescript-相关文件)
7. [ESLint 配置](#7-eslint-配置)
8. [与 Webpack 方式的对比](#8-与-webpack-方式的对比)
9. [集成 Tailwind CSS](#9-集成-tailwind-css)
10. [清理成最小骨架](#10-清理成最小骨架)
11. [npm scripts](#11-npm-scripts)

---

## 1. 创建项目

```bash
npm create vite@latest my-react-app
```

运行后会出现交互式菜单，依次选择：
- **Framework**：React
- **Variant**：TypeScript

```bash
cd my-react-app
npm install
npm run dev        # 默认运行在 5173 端口
npm run dev -- --port 3000  # 指定端口
```

`npm create vite@latest` 背后做的事，就是运行 Vite 的官方脚手架，生成一套默认项目模板并配好所有依赖。

---

## 2. 默认项目结构

```
my-react-app/
├── public/
│   └── vite.svg                  ← 静态资源（直接按路径访问，不经过打包）
├── src/
│   ├── assets/
│   │   └── react.svg             ← 源码资源（经过 Vite 处理，可在 JS 中 import）
│   ├── components/               ← 组件目录（需自己创建，见第 4 节）
│   │   └── Logo.tsx
│   ├── App.tsx                   ← 根组件
│   ├── index.css                 ← 全局样式
│   ├── main.tsx                  ← 入口文件
│   └── vite-env.d.ts             ← Vite 的 TypeScript 类型声明
├── index.html                    ← 页面入口（Vite 的核心不同点）
├── package.json
├── tsconfig.json                 ← TypeScript 配置（根）
├── tsconfig.app.json             ← TypeScript 配置（src 目录）
├── tsconfig.node.json            ← TypeScript 配置（vite.config.ts 用）
├── vite.config.ts                ← Vite 配置
└── eslint.config.js              ← ESLint 配置
```

**`public/` vs `src/assets/` 的区别：**

| | `public/` | `src/assets/` |
|---|---|---|
| 访问方式 | 直接用绝对路径 `/vite.svg` | 在 JS/TSX 中 `import logo from './assets/react.svg'` |
| 是否经过打包 | 否，原样复制到输出目录 | 是，Vite 会处理（如加内容哈希） |
| 适用场景 | favicon、robots.txt 等 | 组件用到的图片、图标 |

---

## 3. 入口链路：index.html → main.tsx → App.tsx

### `index.html`

> 示例：[codes/index.html](codes/index.html)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + TS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

注意这里的关键一行：

```html
<script type="module" src="/src/main.tsx"></script>
```

**Vite 把 `index.html` 当作项目的入口点**，直接在 HTML 里引用源码文件（`.tsx`）。浏览器请求这个页面时，Vite 开发服务器会按需编译 `main.tsx` 并返回给浏览器。

这和 Webpack 的方式完全不同——Webpack 需要 `HtmlWebpackPlugin` 在构建后把 bundle 注入 HTML；Vite 反过来，让 HTML 直接指向源码。

### `src/main.tsx`

> 示例：[codes/src/main.tsx](codes/src/main.tsx)

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
```

和第二章的 `index.jsx` 对比，多了两点：

**1. `StrictMode`**

`StrictMode` 是 React 提供的开发辅助工具。它不渲染任何 UI，只在**开发环境**下启用额外检查：
- 检测使用了已废弃的 React API
- 故意双重调用组件函数和 effect，帮助发现副作用问题

生产构建时，`StrictMode` 的检查会被自动移除，不影响性能。

**2. `!` 非空断言**

```tsx
document.getElementById("root")!
```

`getElementById` 的返回类型是 `HTMLElement | null`，但 `createRoot` 不接受 `null`。加上 `!` 是在告诉 TypeScript："我确定这个元素存在，不会是 null"。这是 TypeScript 的非空断言运算符。

### `src/App.tsx`

> 示例：[codes/src/App.tsx](codes/src/App.tsx)

```tsx
import Logo from './components/Logo';

function App() {
    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-green-200">
            <Logo />
            <p className="text-2xl text-stone-600 font-bold">
                My first Vite + React + TS + Tailwindcss project!
            </p>
        </div>
    );
}

export default App;
```

`App.tsx` 从 `./components/Logo` 导入了一个子组件。这引出了项目中如何组织组件文件的问题。

---

## 4. 组件目录：src/components/

Vite 默认脚手架只生成了 `App.tsx` 一个组件文件，放在 `src/` 根目录。随着项目增长，组件多了之后直接堆在 `src/` 下会很乱。约定做法是创建 `src/components/` 目录，把所有**可复用的 UI 组件**放进去。

### 目录结构

```
src/
├── components/
│   └── Logo.tsx        ← 可复用的 Logo 组件
├── App.tsx             ← 根组件，负责组合组件
├── main.tsx            ← 入口，只做挂载
└── index.css
```

`App.tsx` 从 `components/` 导入：

```tsx
import Logo from './components/Logo';
```

### `src/components/Logo.tsx`

> 示例：[codes/src/components/Logo.tsx](codes/src/components/Logo.tsx)

```tsx
import reactLogo from "../assets/react.svg";
import viteLogo from "/vite.svg";

export default function Logo() {
    return (
        <div className="flex gap-8 mb-8">
            <a href="https://vite.dev" target="_blank">
                <img src={viteLogo} className="w-16" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank">
                <img src={reactLogo} className="w-16" alt="React logo" />
            </a>
        </div>
    );
}
```

这里演示了两种引入图片资源的方式：

| 方式 | 路径 | 说明 |
|------|------|------|
| `src/assets/` 中的资源 | `import reactLogo from "../assets/react.svg"` | 相对路径，经过 Vite 打包处理 |
| `public/` 中的资源 | `import viteLogo from "/vite.svg"` | 绝对路径，原样使用，不经过打包 |

### 组件目录的设计原则

**命名规则：**
- 文件名和函数名都用 **PascalCase**（大驼峰），如 `Logo.tsx`、`ChatMessage.tsx`
- 一个文件只放一个组件，文件名与组件名一致

**什么放 `components/`，什么放 `src/` 根目录：**

| 位置 | 放什么 |
|------|--------|
| `src/components/` | 可复用的 UI 组件（Logo、Button、Card、ChatMessage 等） |
| `src/` 根目录 | 框架级文件：`main.tsx`、`App.tsx`、`index.css` |

**项目规模扩大后的进一步划分（参考）：**

```
src/
├── components/     ← 通用 UI 组件（跨页面复用）
├── pages/          ← 页面级组件（每个路由对应一个）
├── hooks/          ← 自定义 Hooks
├── assets/         ← 图片、图标等静态资源
└── ...
```

目前我们只需要 `components/`，其他目录在后续章节用到时再引入。

---

## 5. `vite.config.ts`：插件系统

> 示例：[codes/vite.config.ts](codes/vite.config.ts)

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
});
```

Vite 通过**插件**扩展能力，配置文件比 Webpack 简洁很多。这里用到两个插件：

| 插件 | 作用 |
|------|------|
| `@vitejs/plugin-react` | 让 Vite 支持 React 的 JSX/TSX 转换 + Fast Refresh（热更新时保留组件状态） |
| `@tailwindcss/vite` | 让 Vite 在构建时处理 Tailwind CSS 的工具类生成 |

对比第二章的 Webpack 配置，这里省掉了：
- `module.rules`（babel-loader 配置）
- `resolve.extensions`
- `HtmlWebpackPlugin`
- `devServer` 配置

这些要么 Vite 内置处理了，要么通过插件替代了。

---

## 6. TypeScript 相关文件

这个项目使用 TypeScript（`.tsx` 文件），相关配置文件有以下几个：

### `src/vite-env.d.ts`

```ts
/// <reference types="vite/client" />
```

这一行给 TypeScript 提供了 Vite 专属的类型定义，比如：
- `import.meta.env`（环境变量）
- `import.meta.hot`（HMR API）
- 在 JS 中 `import` SVG/PNG 等静态资源时的类型

没有这行，TypeScript 会报告找不到 `import.meta.env` 等类型。

### `tsconfig.app.json`（关键配置）

> 示例：[codes/tsconfig.app.json](codes/tsconfig.app.json)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "jsx": "react-jsx",
    "noEmit": true,
    "strict": true
  }
}
```

两个关键设置：

**`"jsx": "react-jsx"`**

使用 React 17+ 引入的新 JSX 转换。有了这个配置，你不需要在每个 `.tsx` 文件顶部写 `import React from 'react'`——TypeScript（配合 Vite）会自动处理 JSX 到 `React.createElement` 的转换。

**`"noEmit": true`**

TypeScript 编译器**只做类型检查，不输出 JS 文件**。实际的编译（把 TS 转成 JS）由 Vite 内部的 **esbuild** 完成，速度比 `tsc` 快得多。

> **Vite 用 esbuild 而不是 Babel 做编译**
>
> Vite 开发时用 esbuild（用 Go 编写）转译 TypeScript 和 JSX，比 Babel 快 10-100 倍。`@vitejs/plugin-react` 插件里的 Babel 只用于 Fast Refresh（热更新）这一特定功能。生产构建用 Rollup 打包。

---

## 7. ESLint 配置

> 示例：[codes/eslint.config.js](codes/eslint.config.js)

上一章手动搭建的 Webpack 环境没有 ESLint。Vite 默认模板内置了一套配置好的 ESLint，帮你在写代码时实时发现问题。

**ESLint 是什么：** 静态代码分析工具，在不运行代码的情况下扫描源码，发现语法错误、不规范写法、潜在 bug 等问题，并在编辑器里以红色/黄色波浪线提示。

### 配置文件

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),                  // 不检查构建产物目录
  {
    files: ['**/*.{ts,tsx}'],               // 只检查 TS/TSX 文件
    extends: [
      js.configs.recommended,              // 基础 JS 规则
      tseslint.configs.recommended,        // TypeScript 规则
      reactHooks.configs['recommended-latest'],  // React Hooks 规则
      reactRefresh.configs.vite,           // Fast Refresh 兼容性规则
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,            // 注入浏览器全局变量（window、document 等）
    },
  },
])
```

### 涉及的包各自负责什么

| 包 | 说明 |
|---|---|
| `@eslint/js` | ESLint 官方提供的基础 JS 规则集，如禁止使用未声明变量、禁止重复 case 等 |
| `globals` | 提供各运行环境的全局变量列表。配置 `globals.browser` 后，ESLint 知道 `window`、`document`、`fetch` 等是合法的全局变量，不会误报"未定义" |
| `typescript-eslint` | 让 ESLint 理解 TypeScript 语法，并提供 TS 专属规则，如接口命名、类型断言使用规范等 |
| `eslint-plugin-react-hooks` | 检查 React Hooks 使用规范，即"Hooks 规则"：不能在条件语句或循环里调用 Hook，只能在函数组件顶层调用 |
| `eslint-plugin-react-refresh` | 检查组件是否以 Vite Fast Refresh 兼容的方式导出。Fast Refresh 要求每个文件只导出 React 组件，如果一个文件同时导出组件和普通函数，热更新可能失效，这个插件会发出警告 |

### 新的 Flat Config 格式

这个配置用的是 ESLint v9 引入的**新格式（Flat Config）**，和以前的 `.eslintrc.js` / `.eslintrc.json` 格式不同：

| | 旧格式 | 新格式（Flat Config）|
|---|---|---|
| 文件名 | `.eslintrc.js` / `.eslintrc.json` | `eslint.config.js` |
| 语法 | CommonJS `module.exports = {}` | ES Module `export default []` |
| 配置粒度 | 全局生效，`overrides` 覆盖 | 数组中每一项都可以指定 `files` 范围 |

Vite 生成的模板默认使用新格式，目前主流项目逐渐向新格式迁移。

---

## 8. 与 Webpack 方式的对比

| | Webpack + Babel（第二章） | Vite（本章） |
|---|---|---|
| **HTML 入口** | 模板 HTML 不含 script，由 HtmlWebpackPlugin 注入 bundle | `index.html` 直接 `<script type="module" src="/src/main.tsx">` |
| **JSX/TS 转译** | Babel | esbuild（开发）/ Rollup（生产） |
| **开发模式** | 全量打包成 bundle，再由 dev-server 提供 | 按需编译，浏览器直接加载 ESM 模块 |
| **热更新** | Webpack HMR | Vite Fast Refresh（保留组件状态） |
| **配置文件** | `webpack.config.js` + `.babelrc` | `vite.config.ts` |
| **TypeScript** | 需额外配置 `@babel/preset-typescript` | 内置支持 |
| **ESLint** | 无（需自行配置） | 内置，开箱即用 |
| **生产构建** | Webpack 打包 | Rollup 打包 |
| **配置复杂度** | 高，手动配置 loader、plugin、devServer | 低，插件系统，约定优于配置 |

---

## 9. 集成 Tailwind CSS

> 参考：[Tailwind CSS 官方文档 - Using Vite](https://tailwindcss.com/docs/installation/using-vite)

### 第一步：安装

```bash
npm install tailwindcss @tailwindcss/vite
```

Tailwind CSS v4 专门提供了 `@tailwindcss/vite` 插件，不再需要单独的 `tailwind.config.js` 配置文件。

### 第二步：在 `vite.config.ts` 中注册插件

```ts
import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

### 第三步：在 `index.css` 中引入

```css
@import "tailwindcss";
```

这一行替换掉原来所有的默认样式（`index.css` 里原本有大量 CSS 变量和基础样式，全部删掉，只留这一行）。

### 验证

在任意组件里使用 Tailwind 工具类：

```tsx
<div className="flex items-center justify-center min-h-screen bg-blue-100">
  <h1 className="text-3xl font-bold text-blue-600">Hello Tailwind!</h1>
</div>
```

如果样式生效，说明集成成功。

---

## 10. 清理成最小骨架

Vite 默认模板包含计数器演示、动画 CSS 等示例代码。实际开发时建议清理成最小骨架：

**删除：**
- `src/App.css`
- `src/assets/react.svg`（如不使用）

**`src/index.css` 只保留：**
```css
@import "tailwindcss";
```

**`src/main.tsx` 保持不变（标准入口）。**

**`src/App.tsx` 清理成：**
```tsx
function App() {
    return (
        <div className="flex flex-col min-h-screen items-center justify-center">
            <h1 className="text-3xl font-bold">Hello Vite + React + Tailwind!</h1>
        </div>
    );
}

export default App;
```

清理后，这就是每个新 React 项目的起点。

---

## 11. npm scripts

```json
"scripts": {
  "dev":     "vite",
  "build":   "tsc -b && vite build",
  "lint":    "eslint .",
  "preview": "vite preview"
}
```

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（端口 5173），支持 Fast Refresh |
| `npm run build` | 先用 `tsc -b` 做类型检查，再用 Vite 生产打包，输出到 `dist/` |
| `npm run lint` | 运行 ESLint 检查代码规范 |
| `npm run preview` | 在本地预览 `dist/` 的生产构建产物 |

**为什么 build 要先跑 `tsc -b`？**

Vite 开发时用 esbuild 转译 TypeScript，esbuild 会**跳过类型检查**（只做语法转换，速度极快）。`tsc -b` 在构建前做完整的类型检查，确保没有类型错误才打包。开发时的类型错误只显示在编辑器里，不会阻止页面运行。

---

## 小结

| 文件 | 作用 |
|------|------|
| `index.html` | 页面入口，直接引用 `src/main.tsx` |
| `src/main.tsx` | React 根节点挂载，包裹 `StrictMode` |
| `src/App.tsx` | 根组件，组合各子组件 |
| `src/components/` | 存放可复用的 UI 组件，PascalCase 命名 |
| `src/index.css` | 全局样式，引入 Tailwind |
| `vite.config.ts` | 注册插件（react、tailwindcss） |
| `eslint.config.js` | 代码规范检查，内置 React Hooks 和 Fast Refresh 规则 |
| `src/vite-env.d.ts` | 给 TS 提供 Vite 专属类型（`import.meta.env` 等） |
| `tsconfig.app.json` | 配置 JSX 转换方式、只做类型检查不输出 JS |
