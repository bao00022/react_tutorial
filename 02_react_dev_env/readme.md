[← 返回首页](../readme.md)

# 第二章 - 手搓 React 开发环境

上一章我们用 CDN 方式在 HTML 里写 React。这种方式足够直观，但有明显局限——所有代码挤在一个 HTML 文件里，依赖靠 CDN 链接维护，JSX 的编译也在浏览器运行时完成，性能较差。

本章从零手动搭建一个基于 **Webpack + Babel** 的 React 开发环境，目的不是让你记住每一行配置，而是让你**搞清楚 React 项目里每个工具在干什么**，以及**最终产物长什么样**。

> 这也是后来 Vite、CRA 等脚手架工具帮你"一键搞定"的事情。理解了底层，脚手架工具就不再是黑盒。

## 目录

1. [CDN 方式的局限](#1-cdn-方式的局限)
2. [工具职责分工](#2-工具职责分工)
3. [项目搭建：一步步来](#3-项目搭建一步步来)
4. [配置文件详解](#4-配置文件详解)
5. [源码结构](#5-源码结构)
6. [运行与构建](#6-运行与构建)
7. [构建产物解析](#7-构建产物解析)
8. [对比总结：CDN vs Webpack](#8-对比总结cdn-vs-webpack)
9. [现代脚手架工具简介](#9-现代脚手架工具简介)

---

## 1. CDN 方式的局限

上一章的做法：

```html
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

<script type="text/babel">
  // 所有代码写在这里
</script>
```

这种方式有三个问题：

| 问题               | 说明                                                                    |
| ------------------ | ----------------------------------------------------------------------- |
| **无法拆分文件**   | 随着代码增长，所有代码只能挤在一个 `<script>` 里                        |
| **依赖管理混乱**   | 靠 CDN 链接维护版本，无法用 `npm` 统一管理                              |
| **运行时编译 JSX** | Babel Standalone 在浏览器里实时编译 JSX，加载慢、性能差，不适合生产环境 |

真实项目需要：

- 用 `npm` 管理依赖（版本锁定、离线可用）
- 把代码拆分到多个文件，用 `import/export` 组织模块
- 构建时提前编译 JSX，浏览器拿到的是纯 JS，无需运行时 Babel

---

## 2. 工具职责分工

搭建一个 React 开发环境需要以下工具，**每个工具只干自己的一件事**：

```
你的代码 (JSX / 现代 JS / 多文件模块)
        │
        ▼
  ┌─────────────┐
  │    Babel    │  把 JSX 和新语法转译成浏览器能懂的 JS
  └─────────────┘
        │
        ▼
  ┌─────────────┐
  │   Webpack   │  把所有模块打包成一个（或几个）bundle 文件
  └─────────────┘
        │
        ▼
  build/bundle.js  ←  浏览器直接加载这个文件
```

各工具的具体职责：

| 工具                    | 职责                                                            |
| ----------------------- | --------------------------------------------------------------- |
| **react**               | 提供 `React.createElement`、Hooks 等核心 API，负责描述和管理 UI |
| **react-dom**           | 负责将 React 的虚拟 DOM 渲染到真实 DOM（浏览器端）              |
| **@babel/core**         | Babel 核心，驱动转译流程                                        |
| **@babel/preset-env**   | 将现代 JS（ES6+）转译成旧浏览器兼容的 ES5                       |
| **@babel/preset-react** | 将 JSX 转译成 `React.createElement` 调用                        |
| **babel-loader**        | Webpack 与 Babel 的桥接，让 Webpack 在打包时调用 Babel          |
| **webpack**             | 模块打包器，从入口文件出发，递归分析所有依赖，打包成 bundle     |
| **webpack-cli**         | Webpack 的命令行工具，让你能运行 `webpack` 命令                 |
| **webpack-dev-server**  | 开发专用的本地服务器，支持热更新（修改代码自动刷新页面）        |
| **html-webpack-plugin** | 自动把打包好的 JS 注入到 HTML 文件中                            |

**dependencies vs devDependencies：**

```
dependencies（生产依赖）：
  react, react-dom
  → 最终 bundle 里包含这些代码，用户浏览器需要执行

devDependencies（开发依赖）：
  webpack, babel, loader, plugin...
  → 只在开发/构建阶段使用，不会出现在最终产物里
```

---

## 3. 项目搭建：一步步来

> 完整文件见 [codes/](codes/) 目录

### 第一步：初始化项目，安装依赖

```bash
mkdir my-react-app
cd my-react-app

npm init -y

# 安装生产依赖（会进入 bundle）
npm install react react-dom

# 安装开发依赖（只用于构建过程）
npm install --save-dev webpack webpack-cli webpack-dev-server
npm install --save-dev babel-loader html-webpack-plugin
npm install --save-dev @babel/core @babel/preset-env @babel/preset-react
```

执行后，目录里会出现 `node_modules/` 和 `package-lock.json`。

### 第二步：创建目录结构

```bash
mkdir src    # 源码目录（写 JSX 的地方）
mkdir build  # 构建输出目录（Webpack 生成的文件放这里）
```

最终目录结构：

```
my-react-app/
├── src/
│   ├── index.jsx       ← 入口文件
│   └── App.jsx         ← 根组件
├── index.html          ← HTML 模板
├── webpack.config.js   ← Webpack 配置
├── .babelrc            ← Babel 配置
└── package.json
```

### 第三步：创建配置文件和源码

依次创建以下五个文件（下一节详细解读每个文件）：

- `.babelrc`
- `webpack.config.js`
- `index.html`
- `src/index.jsx`
- `src/App.jsx`

### 第四步：配置 npm scripts

在 `package.json` 的 `scripts` 里加入：

```json
"scripts": {
  "dev": "webpack serve --mode development",
  "build": "webpack --mode production"
}
```

---

## 4. 配置文件详解

### `.babelrc`

> 示例：[codes/.babelrc](codes/.babelrc)

```json
{
  "presets": ["@babel/preset-env", "@babel/preset-react"]
}
```

Babel 的配置极简：两个 preset，各司其职：

- `@babel/preset-env`：把 ES6+ 新语法（箭头函数、`import/export`、解构等）转成 ES5
- `@babel/preset-react`：把 JSX 转成 `React.createElement(...)` 调用

### `webpack.config.js`

> 示例：[codes/webpack.config.js](codes/webpack.config.js)

```js
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
  // 构建模式（development 保留可读性，production 压缩优化）
  mode: "development",

  // 入口：Webpack 从这里出发，分析所有 import 依赖
  entry: "./src/index.jsx",

  // 出口：打包后的文件放在 build/bundle.js
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "build"),
    clean: true, // 每次构建前清空 build 目录
  },

  // 模块规则：告诉 Webpack 遇到 .js/.jsx 文件时，先用 babel-loader 处理
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // 匹配 .js 和 .jsx 文件
        exclude: /node_modules/, // 跳过 node_modules（已经是编译好的代码）
        use: "babel-loader", // 用 babel-loader 调用 Babel 进行转译
      },
    ],
  },

  // 省略后缀：import 时可以不写 .js/.jsx
  resolve: {
    extensions: [".js", ".jsx"],
  },

  // 插件：自动把 bundle.js 注入到 HTML 模板
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html", // 以这个 HTML 为模板
      favicon: "./favicon.ico",
    }),
  ],

  // 开发服务器配置
  devServer: {
    static: "./build",
    open: true, // 启动后自动打开浏览器
    port: 3000,
  },

  // 关闭压缩（方便查看 bundle.js 内容，生产环境应删掉这行）
  optimization: {
    minimize: false,
  },
};
```

**数据流梳理：**

```
src/index.jsx
  → babel-loader 转译 JSX
  → Webpack 打包所有 import 的模块
  → build/bundle.js

index.html (模板)
  → HtmlWebpackPlugin 自动注入 <script src="bundle.js">
  → build/index.html
```

---

## 5. 源码结构

### `index.html`（HTML 模板）

> 示例：[codes/index.html](codes/index.html)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>React Lite Env</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

注意：这个模板里**没有** `<script>` 标签。`HtmlWebpackPlugin` 会在构建时自动在 `<head>` 里注入：

```html
<script defer="defer" src="bundle.js"></script>
```

### `src/index.jsx`（入口文件）

> 示例：[codes/src/index.jsx](codes/src/index.jsx)

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App name="ABC" />);
```

对比第一章的 CDN 方式，区别在于：

- 用 `import` 代替了 `<script>` 标签引入
- `react-dom` 从 `react-dom/client` 路径导入（React 18 的写法）
- 文件扩展名是 `.jsx`，提示 Babel 按 JSX 语法处理

### `src/App.jsx`（根组件）

> 示例：[codes/src/App.jsx](codes/src/App.jsx)

```jsx
import React from "react";

export default function App(props) {
  console.log(props);

  return (
    <div>
      <h1>Hello React + Babel + Webpack!</h1>
      <p>Welcome, {props.name}!</p>
    </div>
  );
}
```

- `export default` 导出组件，`index.jsx` 里用 `import App from "./App.jsx"` 导入
- 这就是真实项目中每个组件文件的基本形态：一个 `.jsx` 文件，一个 `export default` 的函数组件

---

## 6. 运行与构建

> **注意**：仓库里没有 `build/` 目录，构建产物不纳入版本控制。需要先在本地执行构建，才能看到第 7 节的产物分析。

```bash
# 进入本章代码目录
cd codes

# 安装依赖
npm install

# 启动开发服务器（修改代码自动热更新）
npm run dev

# 生产构建（生成 build/ 目录）
npm run build
```

`npm run dev` 背后执行的是：

```
webpack serve --mode development
```

webpack-dev-server 会：

1. 在内存里完成打包（不写入 `build/` 目录）
2. 在 `localhost:3000` 启动一个本地服务器
3. 监听源文件变化，变化时重新打包并自动刷新浏览器

`npm run build` 会把打包产物写入 `build/` 目录。

---

## 7. 构建产物解析

执行 `npm run build` 后，`build/` 目录里会生成两个文件：

```
build/
├── index.html    ← 由 HtmlWebpackPlugin 生成
└── bundle.js     ← 所有代码打包进来的 JS 文件
```

### `build/index.html`

> 示例：[codes/build/index.html](codes/build/index.html)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>React Lite Env</title>
    <link rel="icon" href="favicon.ico" />
    <script defer="defer" src="bundle.js"></script>
    ← 自动注入
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

模板 `index.html` 里没有 `<script>` 标签，`HtmlWebpackPlugin` 自动帮你加上了。

### `build/bundle.js`

这个文件有 **16000 多行**。打开看一眼就会明白：Webpack 把你写的代码、React 源码、ReactDOM 源码，全部打包到了这一个文件里。

```
bundle.js 包含：
  ├── React 核心源码（react 包）
  ├── ReactDOM 源码（react-dom 包）
  ├── 你的 App.jsx（已被 Babel 转译成普通 JS）
  └── 你的 index.jsx（已被 Babel 转译成普通 JS）
```

**也就是说：浏览器只需要这两个文件（`index.html` + `bundle.js`），就能运行你的整个 React 应用。**

你的原始 JSX 代码经过 Babel 转译后，在 `bundle.js` 里长这样（片段）：

```js
// <App name="ABC" /> 被 Babel 转成了：
root.render(React.createElement(App, { name: "ABC" }));

// App 组件里的 JSX 被转成了：
return React.createElement(
  "div",
  null,
  React.createElement("h1", null, "Hello React + Babel + Webpack!"),
  React.createElement("p", null, "Welcome, ", props.name, "!"),
);
```

这正是第一章讲过的内容：JSX 最终都是 `React.createElement` 调用，只不过在 CDN 方式里是浏览器实时转，在 Webpack 方式里是构建时提前转好了。

---

## 8. 对比总结：CDN vs Webpack

|              | CDN 方式（第一章）               | Webpack 方式（本章）           |
| ------------ | -------------------------------- | ------------------------------ |
| **依赖管理** | CDN 链接                         | npm                            |
| **文件组织** | 单个 HTML 文件                   | 多文件，`import/export` 模块化 |
| **JSX 编译** | 浏览器运行时（Babel Standalone） | 构建时（babel-loader）         |
| **最终产物** | 就是源码本身                     | `bundle.js`（包含所有依赖）    |
| **适用场景** | 学习、原型、演示                 | 真实项目开发                   |

---

## 9. 现代脚手架工具简介

手搓一遍之后，再看这些工具就清楚多了——它们本质上都是在自动化你刚才手动做的事情：

| 工具                       | 底层                              | 说明                                                       |
| -------------------------- | --------------------------------- | ---------------------------------------------------------- |
| **Vite**                   | Rollup（生产） / 原生 ESM（开发） | 开发时利用浏览器原生 ESM，启动极快；生产构建用 Rollup 打包 |
| **CRA (create-react-app)** | Webpack + Babel                   | 就是本章所做的事，只是封装好了；已停止维护                 |
| **Next.js**                | Turbopack / Webpack               | 在打包基础上加了 SSR、路由、API 等全栈能力                 |
| **Parcel**                 | 自研                              | 零配置，自动处理依赖                                       |
| **Rsbuild**                | Rspack（Rust 版 Webpack）         | 字节跳动出品，高性能，兼容 Webpack 生态                    |

**Vite 开发模式为什么快？**

传统 Webpack 开发模式（本章 `npm run dev`）：每次启动都要把所有文件打包成一个 bundle，项目越大越慢。

Vite 开发模式：利用浏览器原生支持的 **ES Modules**，按需加载文件，浏览器请求哪个模块就编译哪个，启动时间不随项目大小增长。

```
Webpack dev:   所有文件 → 打包 → bundle.js → 浏览器
Vite dev:      浏览器 → 请求模块 → 按需编译 → 返回单个模块
```

但两者的**生产构建产物是类似的**：都是打包好的静态文件，可以直接部署到任何静态服务器。

---

## 小结

手动搭建这个环境的收获：

- **React / ReactDOM**：UI 库本身，进 `bundle.js`
- **Babel**：在构建时把 JSX 转成 `React.createElement`，让浏览器能认
- **Webpack**：把所有 `import` 的模块打包成一个文件，让浏览器只需加载一个 `bundle.js`
- **webpack-dev-server**：开发时的热更新服务器，不产生构建产物
- **HtmlWebpackPlugin**：自动把 bundle 注入 HTML，省去手写 `<script>` 标签
