[← 返回首页](../readme.md)

# 第十章（一）- 性能问题：不必要的重渲染

前几章的案例都没有遇到性能问题，因为组件树规模小，每次重渲染的代价可以忽略不计。本章引入一个有 200 本书的图书检索台，在这个规模下，React 默认的渲染行为开始暴露出值得关注的问题。

> 示例代码：[codes/src](codes/src)

## 目录

1. [React 的默认渲染行为](#1-react-的默认渲染行为)
2. [案例结构](#2-案例结构)
3. [观察问题：打开控制台](#3-观察问题打开控制台)
4. [两个具体问题](#4-两个具体问题)
5. [为什么问题不是一开始就出现](#5-为什么问题不是一开始就出现)

---

## 1. React 的默认渲染行为

React 的规则很简单：**任何时候一个组件的 state 发生变化，该组件以及它的所有子孙组件都会重新渲染。**

```
App state 变化
  → App 重新渲染
    → Stats 重新渲染
    → BookCard 重新渲染（× 200）
```

这个规则让 UI 保持同步，绝大多数情况下没有问题。React 的渲染速度很快，重渲染的代价通常可以忽略。

但当满足以下条件时，这个默认行为就值得优化：

1. 某个 state 变化**非常频繁**（比如每次按键）
2. 该 state 的变化与某些子组件**完全无关**（子组件的数据根本没变）
3. 受影响的子组件**数量多**，或者**渲染开销大**

---

## 2. 案例结构

```
App
├── state: keyword（搜索词）
├── state: memoText（备忘录内容）
│
├── Stats（显示统计数据）
└── BookCard × 200（书籍列表）
```

**关键点**：`keyword` 和 `memoText` 是两个完全独立的 state。备忘录内容的变化与书籍列表毫无关系——但因为它们住在同一个 `App` 里，修改备忘录会让所有 BookCard 重渲染。

---

## 3. 观察问题：打开控制台

运行项目，打开浏览器 DevTools（F12）→ Console 面板。

**第一步：在搜索框输入关键字**

每次按键，控制台会出现 200 条日志：

```
BookCard rendered: 中国历史研究
BookCard rendered: 现代政治导论
BookCard rendered: 当代社会新论
... （共 200 条）
```

这是**正常的**——keyword 变了，filteredBooks 变了，相关的 BookCard 确实需要更新。

**第二步：清空搜索框，然后在右侧备忘录输入任意内容**

每次按键，控制台再次出现 200 条日志。但这次，备忘录的内容与书籍列表毫无关系。200 个 BookCard 的数据一字未变，却全部重渲染了。

这就是本章要解决的问题。

---

## 4. 两个具体问题

**问题一：BookCard 不必要地重渲染**

```tsx
// App 里，每次 memoText 变化时 App 重渲染
// → 这段代码重新执行
const filteredBooks = BOOKS.filter((b) => b.title.includes(keyword) || b.author.includes(keyword));

// → 每个 BookCard 都重渲染
{
  filteredBooks.map((book) => <BookCard key={book.id} book={book} />);
}
```

虽然 `keyword` 没变，`filteredBooks` 的内容和上一次完全相同，但 React 并不知道——它只是机械地执行"parent 渲染 → 所有 children 渲染"的规则。

**问题二：统计数据不必要地重新计算**

```tsx
// 每次 App 重渲染都重新执行这段计算
const total = filteredBooks.length;
const totalValue = filteredBooks.reduce((sum, b) => sum + b.price, 0);
const avgPrice = total > 0 ? totalValue / total : 0;
const maxPrice = total > 0 ? Math.max(...filteredBooks.map((b) => b.price)) : 0;
```

遍历 200 本书做 reduce 和 max，每次敲备忘录都触发一次，但结果和上次完全一样。

---

## 5. 为什么问题不是一开始就出现

前几章的案例里（聊天机器人、搜索联想），组件树很小，重渲染的代价可以忽略——React 处理几个组件的速度远低于 16ms（一帧的时间），用户完全感知不到。

规模增大后，情况就不同了：

| 组件数          | 每次重渲染的工作量                 |
| --------------- | ---------------------------------- |
| 几个组件        | 微秒级，完全无感                   |
| 200 个 BookCard | 开始积累，频繁触发时可能影响流畅度 |
| 1000 个复杂组件 | 可能造成明显卡顿                   |

React 提供了三个工具来解决这个问题：`React.memo`、`useMemo`、`useCallback`。下一章开始逐一引入。

---

## 小结

| 概念           | 说明                                             |
| -------------- | ------------------------------------------------ |
| 默认重渲染规则 | state 变化 → 该组件及所有子孙重渲染              |
| 不必要的重渲染 | 子组件数据未变，却因父组件 state 变化被动重渲染  |
| 不必要的重计算 | 依赖未变，却在每次渲染时重新执行昂贵的计算       |
| 何时值得优化   | 频繁 state 变化 + 无关的大规模子树，或昂贵的计算 |
