[← 返回首页](../readme.md)

# 第七章 - useEffect cleanup：清理副作用

上一章的聊天机器人，用户发消息后 bot 立刻回复。本章加一个更真实的体验：发送后先显示 "Bot is typing..."，800ms 后 bot 才给出回复。

这个功能引出了 `useEffect` 的第三种形式——**带 cleanup 的 effect**。

> 示例代码：[codes/src/App.tsx](codes/src/App.tsx)

## 目录

1. [需求拆解](#1-需求拆解)
2. [第一步：改造 handleSubmit](#2-第一步改造-handlesubmit)
3. [第二步：用 effect 实现延迟回复](#3-第二步用-effect-实现延迟回复)
4. [cleanup 的写法与时机](#4-cleanup-的写法与时机)
5. [什么时候需要写 cleanup](#5-什么时候需要写-cleanup)

---

## 1. 需求拆解

**目标效果：**

1. 用户点击发送 → 用户消息出现，输入框清空，显示 "Bot is typing..."
2. 800ms 后 → "Bot is typing..." 消失，bot 回复出现

**需要新增的 state：**

```tsx
const [isTyping, setIsTyping] = useState(false);
```

`isTyping` 控制 "Bot is typing..." 的显示与隐藏，同时作为延迟回复 effect 的触发信号。

在 JSX 里加一行：

```tsx
{isTyping && <p className="text-gray-500">Bot is typing...</p>}
```

---

## 2. 第一步：改造 handleSubmit

上一章的 `handleSubmit` 是一次性把用户消息和 bot 回复同时加入 `chatHistory`：

```tsx
// 旧版：用户消息和 bot 回复同时添加
setChatHistory((prev) => [
    ...prev,
    { id: prev.length + 1, message: question, sender: "user" },
    { id: prev.length + 2, message: randomReply, sender: "bot" },
]);
```

现在改为：**只加用户消息，bot 回复的工作交给 effect 来完成**。

```tsx
function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (question) {
        setChatHistory((prev) => [
            ...prev,
            { id: prev.length + 1, message: question, sender: "user" },
        ]);
        setQuestion("");
        setIsTyping(true);  // 通知 effect 该启动了
    }
}
```

`setIsTyping(true)` 是关键——它改变了 state，触发重新渲染（显示 typing 提示），同时让监听 `isTyping` 的 effect 执行。

---

## 3. 第二步：用 effect 实现延迟回复

```tsx
useEffect(() => {
    if (!isTyping) return;  // isTyping 为 false 时直接退出

    const timer = setTimeout(() => {
        setChatHistory((prev) => [
            ...prev,
            { id: prev.length + 1, message: replies[Math.floor(Math.random() * replies.length)], sender: "bot" },
        ]);
        setIsTyping(false);  // 回复加完，关闭 typing 状态
    }, 800);

    return () => clearTimeout(timer);  // cleanup
}, [isTyping]);
```

完整执行流程：

```
用户点击 Submit
  → setChatHistory 加入用户消息
  → setIsTyping(true)
  → React 重新渲染：显示用户消息 + "Bot is typing..."
  → useEffect 触发（isTyping 变成了 true）
  → 启动 setTimeout，800ms 后执行

800ms 后
  → setChatHistory 加入 bot 回复
  → setIsTyping(false)
  → React 重新渲染：显示 bot 回复，"Bot is typing..." 消失
  → useEffect 再次触发（isTyping 变成了 false）
  → if (!isTyping) return → 直接退出，不启动新 timer
```

---

## 4. cleanup 的写法与时机

`useEffect` 的回调函数可以 **return 一个函数**，这个返回的函数就是 cleanup：

```tsx
useEffect(() => {
    const timer = setTimeout(() => { ... }, 800);

    return () => clearTimeout(timer);  // cleanup
}, [isTyping]);
```

cleanup 函数在两个时机执行：

```
组件挂载
  → effect 运行（启动 timer A）

依赖发生变化
  → cleanup 运行（clearTimeout timer A）  ← 先清理上一次
  → effect 重新运行（启动 timer B）

组件卸载
  → cleanup 运行（clearTimeout timer B）  ← 最终清理
```

**注意**：`clearTimeout` 的作用是**取消**一个还没到期的 timer，而不是释放内存。timer 正常到期、回调执行完后，JS 会自动回收，不需要手动清理。cleanup 解决的是**逻辑问题**——确保上一次启动的 timer 在适当的时候被取消，而不是任由它在后台"过期执行"。

在本案例里，`isTyping` 是布尔值，从 `true` 到 `true` 不构成变化，effect 不会重复触发，所以实际上不会出现"旧 timer 还没到期又启动新 timer"的情况。写 cleanup 是一种防御性做法——让代码的意图更清晰，也为将来可能的逻辑调整做好准备。

---

## 5. 什么时候需要写 cleanup

判断标准只有一个：**effect 里是否启动了需要手动停止的东西**。

| effect 里启动了什么 | cleanup 需要做什么 |
|---|---|
| `setTimeout` | `clearTimeout` |
| `setInterval` | `clearInterval` |
| `addEventListener` | `removeEventListener` |
| WebSocket 连接 | 关闭连接 |
| 数据请求（fetch / axios） | 取消请求 |

反过来，**不需要 cleanup** 的情况：effect 里只是做了一次性的操作，执行完就结束了，没有留下任何"仍在运行中"的东西：

```tsx
// 不需要 cleanup：scrollIntoView 执行完就结束了
useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [chatHistory]);

// 不需要 cleanup：focus 执行完就结束了
useEffect(() => {
    inputRef.current?.focus();
}, []);
```

一个实用的记忆方法：**写 effect 时问自己"如果组件现在突然消失，这个 effect 里还有什么东西仍在运行？"**——如果有，就需要在 cleanup 里把它停掉。

---

## 小结

| 概念 | 说明 |
|---|---|
| cleanup 函数 | `useEffect` 回调 return 的函数 |
| 执行时机 | 依赖变化导致 effect 重新运行之前，以及组件卸载时 |
| 解决的是逻辑问题 | 不是内存问题；timer 到期后 JS 自动回收，cleanup 是为了在合适的时机取消它 |
| 需要写 cleanup | 启动了 timer、interval、事件监听、连接、请求等持续运行的资源 |
| 不需要写 cleanup | 一次性操作（DOM 方法调用等），执行完即结束 |
