[← 返回首页](../readme.md)

# 第一章 - React 入门基础

本章通过一系列对比示例，从零开始理解 React 的核心思路。所有示例均直接在 HTML 中通过 CDN 引入 React，无需任何构建工具。

## 目录

1. [目标：一个静态列表](#1-目标一个静态列表)
2. [原生 JS 操作 DOM](#2-原生-js-操作-dom)
3. [用 React.createElement 创建元素](#3-用-reactcreateelement-创建元素)
4. [JSX：让代码更像 HTML](#4-jsx让代码更像-html)
5. [JSX 与 createElement 的等价关系](#5-jsx-与-createelement-的等价关系)
6. [React 标准模板](#6-react-标准模板)
7. [渲染对比：原生 JS vs React 虚拟 DOM](#7-渲染对比原生-js-vs-react-虚拟-dom)
8. [React 组件初探](#8-react-组件初探)
9. [React 组件进阶：Props 与组件复用](#9-react-组件进阶props-与组件复用)

---

## 1. 目标：一个静态列表

> 示例代码：[codes/01_static_list.html](codes/01_static_list.html)

我们从一个最简单的目标开始——渲染下面这个列表：

```html
<ul>
  <li>item 1</li>
  <li class="active">item 2</li>
  <li><a href="http://abc.com">item 3</a></li>
</ul>
```

这段 HTML 直接写死在页面里。接下来的几节，我们会用不同的方式来"动态"生成它，看看原生 JS 和 React 各是怎么做的。

---

## 2. 原生 JS 操作 DOM

> 示例代码：[codes/02_vanilla_js_dom.html](codes/02_vanilla_js_dom.html)

用原生 JS 创建同样的列表，需要一步步手动操作 DOM：

```js
const root = document.getElementById("root");

const ul = document.createElement("ul");

const li1 = document.createElement("li");
li1.textContent = "item 1";

const li2 = document.createElement("li");
li2.textContent = "item 2";
li2.className = "active";

const li3 = document.createElement("li");
li3.innerHTML = `<a href="${linkAddress}">${linkName}</a>`;

ul.appendChild(li1);
ul.appendChild(li2);
ul.appendChild(li3);
root.appendChild(ul);
```

**问题在哪？**

代码是"命令式"的——你需要告诉浏览器**怎么做**（先创建元素，再设置属性，再一个个挂载）。当 UI 结构复杂时，这类代码会迅速变得难以维护。

---

## 3. 用 React.createElement 创建元素

> 示例代码：[codes/03_react_create_element.html](codes/03_react_create_element.html)

在 HTML 中引入 React CDN：

```html
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
```

React 提供了 `React.createElement` 来创建**虚拟 DOM 元素**（React Element），再通过 `ReactDOM.createRoot` + `render` 挂载到真实 DOM：

```js
const root = ReactDOM.createRoot(document.getElementById("root"));

const ul = React.createElement(
  "ul",
  null,
  React.createElement("li", null, "item 1"),
  React.createElement("li", { className: "active" }, "item 2"),
  React.createElement("li", { style: { color: "red", backgroundColor: "green" } }, "item 3"),
  React.createElement("li", null, React.createElement("a", { href: "http://abc.com" }, "item 4")),
);

root.render(ul);
```

**`React.createElement` 的参数：**

```
React.createElement(type, props, ...children)
```

| 参数          | 说明                                                    |
| ------------- | ------------------------------------------------------- |
| `type`        | 元素类型，如 `"ul"`、`"li"`，或组件函数                 |
| `props`       | 属性对象，如 `{ className: "active" }`，无属性传 `null` |
| `...children` | 子元素，可以是字符串或其他 React Element                |

**注意：** 这里用的是 `className` 而不是 `class`，因为 `class` 是 JavaScript 的保留字。

`React.createElement` 返回的是一个普通 JS 对象（React Element），React 会用它来描述要渲染什么，并不直接操作真实 DOM。

---

## 4. JSX：让代码更像 HTML

> 示例代码：[codes/04_jsx.html](codes/04_jsx.html)

`React.createElement` 的写法太繁琐了，嵌套一深就难以阅读。为此，React 引入了 **JSX**。

额外引入 Babel，让浏览器能直接解析 JSX：

```html
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
```

脚本标签需要加上 `type="text/babel"`：

```html
<script type="text/babel">
  const root = ReactDOM.createRoot(document.getElementById("root"));

  const linkName = "item 3";
  const linkAddress = "http://abc.com";

  const ul = (
    <ul>
      <li>item 1</li>
      <li className="active">item 2</li>
      <li>
        <a href={linkAddress}>{linkName}</a>
      </li>
    </ul>
  );

  root.render(ul);
</script>
```

**JSX 的几个要点：**

- JSX 看起来像 HTML，但本质是 **JavaScript 语法扩展**，由 Babel 编译成 `React.createElement` 调用
- 用 `{}` 嵌入任意 **JavaScript 表达式**，如变量、运算、函数调用
- 属性名用驼峰命名，如 `className`、`onClick`、`backgroundColor`
- JSX 是**声明式**的——你描述 UI **长什么样**，而不是**怎么构建**

> **JSX 只是语法糖**，Babel 会把 JSX 编译回 `React.createElement`，两者最终产生完全相同的结果。

---

## 5. JSX 与 createElement 的等价关系

> 示例代码：[codes/05_jsx_vs_create_element.html](codes/05_jsx_vs_create_element.html)

在浏览器控制台中可以直接验证这一点：

```js
const element1 = <h2 className="title">Hello, JSX!</h2>;

const element2 = React.createElement("h2", { className: "title" }, "Hello, JSX!");

console.log("element1 = ", element1);
console.log("element2 = ", element2);
// 两者打印出来完全一样
```

两者打印出来的都是相同的 React Element 对象，结构大致如下：

```js
{
  type: "h2",
  props: {
    className: "title",
    children: "Hello, JSX!"
  },
  ...
}
```

**结论：** JSX 就是 `React.createElement` 的语法糖，让代码更易读、更易写。日常开发中几乎只用 JSX，`React.createElement` 是 JSX 编译后的底层实现。

---

## 6. React 标准模板

> 示例代码：[codes/06_react_template.html](codes/06_react_template.html)

一个完整的 React CDN 入门模板如下：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
    <!-- 1. 引入 React 和 ReactDOM -->
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <!-- 2. 引入 Babel，让浏览器支持 JSX -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  </head>
  <body>
    <!-- 3. React 渲染的挂载点 -->
    <div id="root"></div>

    <!-- 4. 脚本类型设为 text/babel -->
    <script type="text/babel">
      // 5. 创建 React 根节点
      const root = ReactDOM.createRoot(document.getElementById("root"));

      // 6. 用 JSX 编写 UI
      const app = (
        <div>
          <h1>React 小书</h1>
          <p>学会 React，离改变世界只差一个你。</p>
        </div>
      );

      // 7. 渲染到页面
      root.render(app);
    </script>
  </body>
</html>
```

这 7 个步骤就是所有 React CDN 示例的固定结构，后续示例都在第 6 步的 JSX 部分展开。

---

## 7. 渲染对比：原生 JS vs React 虚拟 DOM

> 示例代码：[codes/07_vanilla_js_render.html](codes/07_vanilla_js_render.html) | [codes/08_react_render.html](codes/08_react_render.html)

这两个示例通过按钮演示了一个关键区别：**React 只更新变化的 DOM 节点，而不是重建整个 DOM**。

### 原生 JS 的做法

每次点击按钮，都用 `innerHTML = ''` 清空整个列表，再重新创建所有节点：

```js
function renderList(items) {
  const root = document.getElementById("root");
  root.innerHTML = ""; // 清空全部
  const ul = document.createElement("ul");
  items.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    ul.appendChild(li);
  });
  root.appendChild(ul);
}

function step1() {
  renderList(["item 1", "item 2"]);
}
function step2() {
  renderList(["item 1", "item 2", "item 3"]);
}
function step3() {
  renderList(["item 1", "item 2", "item 3", "item 4"]);
}
```

即使只是添加一个 `<li>`，也会销毁并重建所有 `<li>`。

### React 的做法

每次点击按钮，调用 `root.render` 传入新的 JSX：

```js
const root = ReactDOM.createRoot(document.getElementById("root"));

function step1() {
  root.render(
    <ul>
      <li>item 1</li>
      <li>item 2</li>
    </ul>,
  );
}
function step2() {
  root.render(
    <ul>
      <li>item 1</li>
      <li>item 2</li>
      <li>item 3</li>
    </ul>,
  );
}
function step3() {
  root.render(
    <ul>
      <li>item 1</li>
      <li>item 2</li>
      <li>item 3</li>
      <li>item 4</li>
    </ul>,
  );
}
```

**用浏览器开发者工具观察：** 每次 `step2` 或 `step3`，只有新增的 `<li>` 会闪烁高亮，原有的节点纹丝不动。

### 为什么 React 更高效？

React 在内存中维护一棵**虚拟 DOM 树**（Virtual DOM）。每次 `render` 时，React 会：

1. 用新的 JSX 构建一棵新的虚拟 DOM 树
2. 将新树与旧树进行**diff（差异对比）**
3. 只把差异部分同步到真实 DOM

这一过程叫做 **Reconciliation（协调）**，是 React 高效渲染的核心机制。

---

## 8. React 组件初探

> 示例代码：[codes/09_components_basic.html](codes/09_components_basic.html)

到目前为止，我们都是把 JSX 存到变量里，整个 UI 写在一起。当页面复杂时，这同样会变得难以维护。

**组件**是 React 的核心抽象：把 UI 拆分成独立的、可复用的小块，每块就是一个**组件**。

### 定义组件

React 中最简单的组件就是一个**返回 JSX 的函数**（函数组件）：

```js
// 组件名必须大写字母开头
function Header() {
  return (
    <header>
      <h1>React 小书</h1>
      <h2>开源、免费、专业、易用</h2>
    </header>
  );
}

function Main({ name }) {
  return (
    <main>
      <p>学会 {name}，离改变世界只差一个你。</p>
      <input placeholder="输入你的想法" />
      <button>提交</button>
    </main>
  );
}
```

### 使用组件（组件组合）

组件可以像 HTML 标签一样在 JSX 中使用：

```js
const app = (
  <div>
    <Header />
    <Main name="React" />
  </div>
);

root.render(app);
```

### Props：向组件传递数据

`name="React"` 看起来像 HTML 属性，实际上 Babel 会把它编译成一个对象传给组件函数：

```js
// JSX 写法
<Main name="React" />;

// 等价于
React.createElement(Main, { name: "React" }, null);

// Main 函数实际接收的参数
Main({ name: "React" });
```

所以 `{ name }` 只是对 `props` 对象的解构：

```js
function Main({ name }) {
  // 等同于 function Main(props) { const name = props.name; ... }
  return <p>学会 {name}</p>;
}
```

### 两种调用方式的对比

```js
// 方式一：JSX 标签（推荐）
<Main name="React" />;

// 方式二：直接调用函数（不推荐，但能暴露本质）
{
  Main({ name: "JavaScript" });
}
```

两种方式渲染结果相同，但 React 推荐始终用 JSX 标签形式，因为只有这样 React 才能正确地追踪组件生命周期和进行协调优化。

---

## 9. React 组件进阶：Props 与组件复用

> 示例代码：[codes/10_components_advanced.html](codes/10_components_advanced.html)

这个示例用组件搭建了一个简单的聊天界面，展示了**组件复用**和**条件渲染**。

### 输入框组件

```js
function Input() {
  return (
    <div className="input">
      <input placeholder="请输入您的问题" />
      <button>submit</button>
    </div>
  );
}
```

### 消息气泡组件

`ChatMessage` 接收 `message`（消息内容）和 `sender`（发送方：`"user"` 或 `"bot"`），根据 `sender` 决定样式和图标：

```js
function ChatMessage({ message, sender }) {
  return (
    <div className={`message ${sender}`}>
      <p>{message}</p>
      {sender === "bot" ? (
        <span className="material-symbols-outlined">smart_toy</span>
      ) : (
        <span className="material-symbols-outlined">face</span>
      )}
    </div>
  );
}
```

**这里用到了两个重要的 JSX 技巧：**

1. **动态 className**：``className={`message ${sender}`}`` 用模板字符串根据 `sender` 拼接 class 名
2. **条件渲染**：`{condition ? <A /> : <B />}` 用三元表达式在 JSX 中根据条件渲染不同内容

### 组件组合（复用）

```js
const app = (
  <div className="app">
    <Input />
    <ChatMessage message="Hello!" sender="user" />
    <ChatMessage message="Hello! How are you?" sender="bot" />
    <ChatMessage message="Fine, thank you, and you?" sender="user" />
    <ChatMessage message="I am good!" sender="bot" />
  </div>
);
```

同一个 `ChatMessage` 组件，通过传入不同的 props，渲染出不同样式的消息气泡。这正是组件**复用**的核心价值。

---

## 小结

| 概念              | 要点                                                               |
| ----------------- | ------------------------------------------------------------------ |
| **React Element** | 由 `React.createElement` 或 JSX 创建的普通 JS 对象，描述 UI 的结构 |
| **JSX**           | JavaScript 的语法扩展，被 Babel 编译成 `React.createElement` 调用  |
| **虚拟 DOM**      | React 在内存中维护的 UI 描述树，渲染时只将差异同步到真实 DOM       |
| **组件**          | 返回 JSX 的函数，是 React 的基本构建单元，名称以大写字母开头       |
| **Props**         | 组件的输入参数，JSX 中的属性会被编译成一个对象传给组件函数         |
| **条件渲染**      | 在 JSX 的 `{}` 中用三元表达式或 `&&` 控制渲染内容                  |
