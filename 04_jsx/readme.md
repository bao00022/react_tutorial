[← 返回首页](../readme.md)

# 第四章 - JSX 语法

JSX 是 React 的核心语法，它让我们能用"像 HTML 的写法"来描述 UI。第一章已经介绍了 JSX 的本质（语法糖，编译成 `React.createElement`），本章专注于 JSX 语法的完整规则和实际用法。

> 示例代码：[codes/src/App.tsx](codes/src/App.tsx)

## 目录

1. [JSX 基础规则](#1-jsx-基础规则)
2. [注释](#2-注释)
3. [表达式 vs 语句](#3-表达式-vs-语句)
4. [嵌入 JavaScript 表达式](#4-嵌入-javascript-表达式)
5. [属性与样式](#5-属性与样式)
6. [条件渲染](#6-条件渲染)
7. [列表渲染与 key](#7-列表渲染与-key)
8. [Fragment](#8-fragment)

---

## 1. JSX 基础规则

在写 JSX 之前，先记住几条基本规则：

### 规则一：必须有单一根元素

JSX 表达式只能返回**一个**根元素，多个并列元素必须包在一个容器里。

```tsx
// ❌ 错误：两个并列的根元素
return (
    <h1>标题</h1>
    <p>内容</p>
);

// ✅ 正确：用一个 div 包裹
return (
    <div>
        <h1>标题</h1>
        <p>内容</p>
    </div>
);

// ✅ 也可以用 Fragment（不产生多余 DOM，详见第 8 节）
return (
    <>
        <h1>标题</h1>
        <p>内容</p>
    </>
);
```

**为什么有这个限制？** JSX 最终编译成 `React.createElement(...)` 调用，一个函数只能有一个返回值，所以只能有一个根元素。

### 规则二：所有标签必须关闭

HTML 中 `<br>`、`<img>`、`<input>` 可以不闭合，但 JSX 中必须自闭合：

```tsx
// ❌ HTML 写法，JSX 中报错
<br>
<img src="logo.png">
<input type="text">

// ✅ JSX 写法
<br />
<img src="logo.png" />
<input type="text" />
```

### 规则三：组件名必须大写

小写字母开头的标签被识别为 HTML 原生元素，大写字母开头的被识别为 React 组件：

```tsx
<div>      // HTML 原生元素
<p>        // HTML 原生元素
<App />    // React 组件
<Header /> // React 组件
```

### 规则四：多行 JSX 用圆括号包裹

`return` 后面如果换行，需要用 `()` 包裹，否则 JS 的自动分号插入机制会导致 `return undefined`：

```tsx
// ❌ return 后换行但没加括号，实际 return 了 undefined
return
    <div>...</div>;

// ✅ 正确写法
return (
    <div>...</div>
);
```

---

## 2. 注释

JSX 中不能用 HTML 注释 `<!-- -->`，必须用 JS 块注释包在 `{}` 里：

```tsx
// ❌ HTML 注释，在 JSX 中不起作用（会被当成文本输出）
<!-- 这是注释 -->

// ✅ JSX 注释写法
{/* 这是 JSX 注释，不会渲染到页面 */}
```

`{}` 外的 JS 单行注释 `//` 也有效，但只能注释整行，且注释内容不能被 JSX 解析器识别，通常不用。

---

## 3. 表达式 vs 语句

JSX 的 `{}` 里**只能放表达式，不能放语句**，这是最容易让初学者困惑的地方。

### 什么是表达式（Expression）

**能产生一个值**的代码片段就是表达式：

```js
1 + 2                          // 数字 3
age > 18                       // 布尔值 true/false
"hello"                        // 字符串
title.toUpperCase()            // 字符串
users.map(u => u.name)         // 数组
age > 18 ? "adult" : "minor"   // 字符串（三元表达式）
age > 18 && <p>成年</p>        // JSX 元素或 false
```

### 什么是语句（Statement）

**执行某种操作**、但本身不产生值的代码：

```js
let age = 18;               // 声明语句
if (age > 18) { }           // 条件语句
for (let i = 0; i < 10; i++) { }  // 循环语句
console.log(age);           // 表达式语句（有副作用，但本身是语句）
```

### 为什么 JSX 只允许表达式

`{}` 的设计本质上是"把值插入 JSX 树"。语句没有值，插不进去：

```tsx
// ❌ if 语句不能放在 {} 里
<div>
    {if (age > 18) { return <p>成年</p> }}
</div>

// ✅ 三元表达式（表达式，有值）
<div>
    {age > 18 ? <p>成年</p> : <p>未成年</p>}
</div>

// ❌ for 循环不能放在 {} 里
<ul>
    {for (const user of users) { ... }}
</ul>

// ✅ .map()（数组方法，返回新数组，是表达式）
<ul>
    {users.map(user => <li key={user.id}>{user.name}</li>)}
</ul>
```

---

## 4. 嵌入 JavaScript 表达式

### 基本用法

在 JSX 中，`{}` 相当于模板引擎（如 EJS、Jinja2）的 `<%= %>`，把 JS 表达式的值插入 UI：

```tsx
const title = "user list";
const age = 15;

return (
    <div>
        <h1>{title.toUpperCase()}</h1>   {/* USER LIST */}
        <p>1 + 1 = {1 + 1}</p>          {/* 1 + 1 = 2 */}
        <p>age: {age}</p>                {/* age: 15 */}
    </div>
);
```

### 组件函数的结构

一个典型的函数组件分为两个区域：

```tsx
export default function App() {
    // ── 普通 JS 区 ────────────────────────────────
    // 这里写普通 JavaScript：变量声明、逻辑处理、数据转换
    // 可以用 if、for、let、const，一切 JS 语法都可以
    const title = "hello";
    const items = [1, 2, 3].filter(n => n > 1);

    // ── return：JSX 区 ────────────────────────────
    // return 后面只能是 JSX 表达式
    // {} 里只能放表达式（不能放 if、for 等语句）
    return (
        <div>
            <h1>{title}</h1>
            <p>{items.length} items</p>
        </div>
    );
}
```

**提示：** 如果条件逻辑比较复杂，在 JS 区用 `if` 提前处理好，然后在 JSX 中只用简单的 `{}` 引用结果——这样比在 JSX 里嵌套复杂的三元表达式可读性更好。

---

## 5. 属性与样式

### className 和 htmlFor

JSX 中部分 HTML 属性的写法与 HTML 不同，因为 JSX 最终是 JavaScript，而 `class` 和 `for` 是 JavaScript 的保留字：

| HTML 属性 | JSX 属性 | 原因 |
|---|---|---|
| `class` | `className` | `class` 是 JS 保留字 |
| `for`（`<label>`） | `htmlFor` | `for` 是 JS 保留字 |

```tsx
// HTML 写法
<div class="container">
<label for="username">用户名</label>

// JSX 写法
<div className="container">
<label htmlFor="username">用户名</label>
```

其他属性（`href`、`src`、`type`、`placeholder` 等）写法与 HTML 相同，但均改为驼峰命名（如 `tabIndex`、`readOnly`）。

### 内联样式

内联样式在 JSX 中是一个**对象**，属性名用驼峰命名，值用字符串：

```tsx
// HTML 写法（字符串）
<p style="color: red; font-size: 18px; background-color: yellow">

// JSX 写法（对象，注意两层 {}：外层是 JSX 表达式，内层是 JS 对象）
<p style={{ color: "red", fontSize: "18px", backgroundColor: "yellow" }}>
```

### 引入 CSS 文件

可以在组件文件中直接 import CSS 文件，Vite 会自动处理：

```tsx
import "./App.css";   // 引入同目录下的 App.css
```

```css
/* App.css */
.active {
    background-color: yellow;
}
```

```tsx
<p className="active">使用 App.css 中定义的样式</p>
```

不过，**在使用了 Tailwind CSS 的项目中**，通常不需要单独的 CSS 文件，直接用 Tailwind 工具类就能覆盖大多数样式需求。独立 CSS 文件适用于：需要写复杂选择器、伪类（`:hover`、`::before`）等 Tailwind 工具类难以覆盖的场景。

---

## 6. 条件渲染

### 方式一：三元表达式（推荐）

最通用的写法，`true`/`false` 两种情况都能处理：

```tsx
{age >= 18
    ? <p className="text-green-600">成年人</p>
    : <p className="text-orange-500">未成年人</p>
}
```

### 方式二：`&&` 短路（只有一种情况时）

当只需要在条件成立时渲染某个元素，条件不成立时什么都不渲染：

```tsx
{age < 18 && <p>未成年提示：请监护人陪同</p>}
```

`&&` 的工作原理：
- `age < 18` 为 `true`  → 返回右侧的 JSX，渲染出来
- `age < 18` 为 `false` → 返回 `false`，React 不渲染 `false`

### `&&` 的数字陷阱

`&&` 左侧**不要直接用数字**，否则当数字为 `0` 时，React 会把 `0` 渲染到页面上：

```tsx
const count = 0;

// ❌ 错误：count 为 0 时，页面会显示 "0"（因为 0 && ... 返回 0，而 React 会渲染数字）
{count && <p>有 {count} 条数据</p>}

// ✅ 正确：明确用比较表达式，返回布尔值
{count > 0 && <p>有 {count} 条数据</p>}

// ✅ 也可以用 !! 将数字转为布尔值
{!!count && <p>有 {count} 条数据</p>}

// ✅ 或者直接用三元表达式，最清晰
{count > 0 ? <p>有 {count} 条数据</p> : null}
```

> 这个坑在 TypeScript 项目中会被 ESLint 的 `@typescript-eslint/no-non-null-assertion` 等规则提示，但在纯 JS 项目中很容易踩到。养成习惯：`&&` 左侧确保是布尔值。

### 方式三：提前用 `if` 处理（逻辑复杂时）

当条件逻辑比较复杂时，在 JS 区用 `if` 准备好内容，比在 JSX 里嵌套三元更可读：

```tsx
export default function App() {
    const status = "loading"; // "loading" | "error" | "success"

    // 在 JS 区提前决定渲染什么
    let content;
    if (status === "loading") {
        content = <p>加载中...</p>;
    } else if (status === "error") {
        content = <p className="text-red-500">加载失败</p>;
    } else {
        content = <p className="text-green-500">加载成功</p>;
    }

    // JSX 区保持简洁
    return <div>{content}</div>;
}
```

---

## 7. 列表渲染与 key

### JSX 可以直接渲染数组

JSX 能直接渲染包含 JSX 元素的数组，React 会自动把每一项展开渲染：

```tsx
<ul>
    {[
        <li key={1}>item 1</li>,
        <li key={2}>item 2</li>,
        <li key={3}>item 3</li>,
    ]}
</ul>
```

### 用 `.map()` 从数据生成列表（最常用）

真实场景中数据来自服务器，用 `.map()` 把数据数组转换成 JSX 数组：

```tsx
<ul>
    {users.map((user) => (
        <li key={user.id}>
            {user.name} — {user.email}
        </li>
    ))}
</ul>
```

### 先 `.filter()` 再 `.map()`

过滤后再渲染，利用数组方法的链式调用：

```tsx
<ul>
    {users
        .filter((user) => user.age >= 18)   // 只保留成年用户
        .map((user) => (
            <li key={user.id}>
                {user.name} — {user.age}岁
            </li>
        ))}
</ul>
```

### `key` 属性

列表中的每一项都需要一个唯一的 `key` 属性，这是 React 的要求，忘了加会看到 console 警告。

**`key` 的作用：** React 在更新列表时，通过 `key` 来判断哪些元素是新增的、哪些是删除的、哪些是移动的，从而最小化 DOM 操作。

**`key` 的选取原则：**

```tsx
// ✅ 最佳：用数据中的唯一 id
{users.map(user => <li key={user.id}>...</li>)}

// ⚠️ 可接受：用唯一的字符串
{tabs.map(tab => <li key={tab.name}>...</li>)}

// ❌ 不推荐：用数组下标（index）
// 当列表项顺序变化时，key 会错位，导致渲染 bug
{users.map((user, index) => <li key={index}>...</li>)}
```

**为什么不推荐用 index 作 key？**

假设有列表 `[A, B, C]`，删掉 B 后变成 `[A, C]`。用 index 作 key 时，C 的 key 从 2 变成了 1，React 会以为原来 key=1 的 B 变成了 C，触发 B→C 的更新，而不是删除 B——这在有输入框等带状态的组件时会产生明显的 bug。

---

## 8. Fragment

### 问题：多余的包裹层

JSX 必须有单一根元素，但有时加一个 `<div>` 会破坏 HTML 语义结构。比如用 `<dl>` 渲染术语列表时，`<dt>` 和 `<dd>` 必须是 `<dl>` 的直接子元素：

```tsx
// ❌ 多了一层 div，破坏了 dl 的语义结构
<dl>
    {terms.map(term => (
        <div key={term.id}>        {/* 这个 div 是多余的 */}
            <dt>{term.title}</dt>
            <dd>{term.desc}</dd>
        </div>
    ))}
</dl>
```

### 解决方案：Fragment

`Fragment` 是 React 提供的"透明容器"——满足 JSX 单根元素的要求，但不会在 DOM 中生成任何额外节点。

> 示例代码：[codes/src/AppFragment.tsx](codes/src/AppFragment.tsx)

**写法一：短语法 `<>...</>`（日常最常用）**

```tsx
return (
    <>
        <h1>标题</h1>
        <p>内容</p>
    </>
);
```

**写法二：`<Fragment>` 完整写法（列表中需要加 `key` 时必须用这种）**

```tsx
import { Fragment } from "react";

{terms.map(term => (
    // 短语法 <> 不支持属性，列表中必须用完整写法才能加 key
    <Fragment key={term.id}>
        <dt>{term.title}</dt>
        <dd>{term.desc}</dd>
    </Fragment>
))}
```

**两种写法的区别：**

| | 短语法 `<>` | 完整写法 `<Fragment>` |
|---|---|---|
| 是否可以加属性 | 不可以 | 可以（只有 `key` 有意义） |
| 适用场景 | 普通包裹 | 列表渲染中需要 key 时 |

---

## 小结

| 规则/特性 | 说明 |
|---|---|
| 单一根元素 | JSX 只能有一个根，多个并列元素用 `<div>` 或 `<>` 包裹 |
| 标签必须关闭 | `<img />`、`<br />` 等必须自闭合 |
| 注释 | `{/* 注释内容 */}` |
| `{}` 嵌入表达式 | 变量、运算、函数调用、三元表达式等，不能放 if/for 语句 |
| `className` | HTML 的 `class` 在 JSX 中写成 `className` |
| 内联样式 | `style={{ color: "red", fontSize: "18px" }}`，属性名驼峰命名 |
| 条件渲染 | 三元表达式（两种情况），`&&`（一种情况），`&&` 左侧避免数字 |
| 列表渲染 | `.map()` 生成 JSX 数组，每项必须有唯一 `key`，不用 index 作 key |
| Fragment | `<>...</>` 或 `<Fragment>`，避免多余 DOM 节点 |
