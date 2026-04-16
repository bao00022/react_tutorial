[← 返回首页](../readme.md)

# 第六章 - useRef 与 useEffect：操作 DOM

上一章结束时留了两个问题：

1. 消息多了之后，新消息不会自动滚到底部
2. 打开 App 后输入框没有自动聚焦

这两个需求有一个共同点：都需要**直接操作 DOM 元素**——调用 `scrollIntoView()` 或 `focus()`。本章引入 `useRef` 和 `useEffect` 来解决它们。

> 示例代码：[codes/src/App.tsx](codes/src/App.tsx)

## 目录

1. [useRef：在 React 中拿到 DOM 节点](#1-useref在-react-中拿到-dom-节点)
2. [useEffect：渲染完成后执行](#2-useeffect渲染完成后执行)
3. [useEffect 的依赖数组](#3-useeffect-的依赖数组)
4. [第一步：解决自动滚动](#4-第一步解决自动滚动)
5. [第二步：解决自动聚焦](#5-第二步解决自动聚焦)

---

## 1. useRef：在 React 中拿到 DOM 节点

### 从原生 JS 的习惯说起

从原生 JavaScript 转来的同学，遇到"需要操作某个 DOM 元素"时，第一反应通常是：

```javascript
const input = document.getElementById("myInput");
input.focus();
```

在 React 里不推荐这样做——React 管理着整棵 DOM 树，绕过它直接用 `document.getElementById` 查询，在某些情况下会拿到错误的节点或引发难以追踪的 bug。

React 提供的替代方案是 `useRef`：

```tsx
import { useRef } from "react";

const inputRef = useRef<HTMLInputElement>(null);

// JSX 里用 ref 属性绑定
<input ref={inputRef} />

// 之后就可以调用任何原生 DOM 方法
inputRef.current?.focus();
```

### useRef 的本质

`useRef(初始值)` 返回一个普通对象 `{ current: 初始值 }`。把它绑到 JSX 元素上之后，React 在渲染完成时会自动把真实的 DOM 节点赋值给 `current`：

```tsx
const bottomRef = useRef<HTMLDivElement>(null);
// 初始：bottomRef.current === null

<div ref={bottomRef} />
// 渲染后：bottomRef.current === 真实的 <div> DOM 节点
```

拿到节点后，就可以调用浏览器原生 DOM API——`scrollIntoView()`、`focus()`、`getBoundingClientRect()` 等，和原生 JS 里完全一样。

### useRef vs useState

| | `useState` | `useRef` |
|---|---|---|
| 主要用途 | 存储驱动 UI 的数据 | 存储 DOM 节点引用 |
| 修改后是否重新渲染 | 是 | 否 |
| 读取方式 | 直接用变量名 | `.current` 属性 |

---

## 2. useEffect：渲染完成后执行

有了 `useRef`，能拿到 DOM 节点了——但什么时候调用 DOM 方法？

直接写在组件函数体里是不行的：

```tsx
function App() {
    const inputRef = useRef<HTMLInputElement>(null);
    inputRef.current?.focus(); // ❌ 此时 DOM 还不存在，current 是 null

    return <input ref={inputRef} />;
}
```

组件函数执行（计算 JSX）的时候，DOM 还没有生成。`useRef` 绑定的节点要等 React **把 JSX 渲染到真实 DOM 之后**才会赋值。

`useEffect` 正是为此而生——它的回调函数**保证在 React 完成渲染、更新 DOM 之后才执行**：

```tsx
useEffect(() => {
    // 这里的代码在 DOM 更新完成后才运行
    // inputRef.current 此时已经指向真实的 DOM 节点
    inputRef.current?.focus();
});
```

---

## 3. useEffect 的依赖数组

`useEffect` 的第二个参数是**依赖数组**，控制回调函数的执行时机：

```tsx
// 不传依赖数组：每次渲染后都执行（几乎不用）
useEffect(() => { ... });

// 空数组 []：只在组件挂载时执行一次
useEffect(() => { ... }, []);

// 有依赖项：指定的 state / prop 发生变化时执行
useEffect(() => { ... }, [chatHistory]);
```

规律：**依赖数组里放什么，effect 就在什么变化时重新运行。空数组表示没有依赖，只在挂载时跑一次。**

---

## 4. 第一步：解决自动滚动

### 思路

每次 `chatHistory` 更新后，需要把滚动容器滚到底部。做法：

1. 在消息列表最末尾放一个看不见的空 `<div>` 作为锚点
2. 用 `useRef` 拿到这个 `<div>` 的 DOM 节点
3. 用 `useEffect` 监听 `chatHistory`，每次它变化后调用 `scrollIntoView()`

### 实现

```tsx
const bottomRef = useRef<HTMLDivElement>(null);

useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [chatHistory]);
```

在 JSX 里，把锚点放在消息列表的末尾：

```tsx
<div className="flex-1 overflow-y-auto flex flex-col gap-4 p-4">
    {chatHistory.map((chat) => (
        <Message key={chat.id} message={chat.message} sender={chat.sender} />
    ))}
    <div ref={bottomRef} />  {/* 锚点 */}
</div>
```

`scrollIntoView({ behavior: "smooth" })` 是浏览器原生 API，把元素平滑滚动到可见区域。不传 `behavior` 时默认瞬间跳过去。

### 为什么不直接写在 handleSubmit 里

可能有一个直觉：能不能在发送消息的同时就滚动？

```tsx
// ❌ 时序错误
function handleSubmit(e) {
    setChatHistory((prev) => [...prev, newMessage]);
    bottomRef.current?.scrollIntoView(); // 此时 DOM 还没有更新！
}
```

`setChatHistory` 只是**通知 React 去更新**，调用完它之后 DOM 还是旧的，新消息还没有出现在页面上。此时调用 `scrollIntoView` 滚到的是更新前的底部。

`useEffect` 解决了时序问题——它的执行顺序是：

```
setChatHistory(新消息)
  → React 重新渲染，把新消息写入 DOM
  → useEffect 触发（此时 DOM 已是最新）
  → scrollIntoView() 滚到真正的底部
```

---

## 5. 第二步：解决自动聚焦

打开页面时，输入框自动获得焦点，用户可以直接开始输入，不需要先点一下。

这里用 `[]` 作为依赖数组——只在组件挂载时执行一次，此后不再重复：

```tsx
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
    inputRef.current?.focus();
}, []);
```

在 JSX 里把 `ref` 绑到 `input` 上：

```tsx
<input
    ref={inputRef}
    value={question}
    onChange={handleChange}
    className="flex-1 border border-gray-400 bg-white rounded px-2 py-1"
/>
```

---

## 小结

本章在上一章的聊天机器人基础上，通过两个 effect 解决了遗留的两个体验问题：

| 问题 | 解决方案 | 依赖数组 |
|---|---|---|
| 新消息不自动滚到底部 | `useRef` 锚点 + `useEffect` 监听 chatHistory | `[chatHistory]` |
| 打开后输入框不自动聚焦 | `useRef` 绑定 input + `useEffect` 挂载时 focus | `[]` |

| 概念 | 说明 |
|---|---|
| `useRef(null)` | 创建一个 `{ current: null }` 的盒子，绑定到 JSX 元素后 `current` 指向真实 DOM 节点 |
| `ref={xxx}` | 把 ref 与 DOM 元素关联，React 渲染后自动赋值 |
| `useEffect(fn, deps)` | DOM 更新后执行副作用，`deps` 控制执行时机 |
| `deps = []` | 只在挂载时执行一次 |
| `deps = [state]` | 该 state 每次变化后执行 |
| 时序问题 | `setState` 调用后 DOM 还未更新；需要 `useEffect` 等渲染完成后再操作 DOM |
