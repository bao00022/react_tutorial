[← 返回首页](../readme.md)

# 第十章（三）- useCallback：稳定函数引用

上一章在末尾留了一个问题：一旦给 `memo(BookCard)` 传入函数 prop，`memo` 就会失效——因为每次 App 重渲染，函数都是新创建的，引用地址不同，`memo` 的浅比较认为 props 变了。

本章加入收藏功能，用 `useCallback` 修复这个问题，完成三件套的最后一块。

> 本章在第二章基础上修改了 `App.tsx`，并给 `BookCard.tsx` 加了收藏按钮。
>
> 示例代码：[codes/src](codes/src)

## 目录

1. [为什么函数每次都是新的](#1-为什么函数每次都是新的)
2. [useCallback：缓存函数引用](#2-usecallback缓存函数引用)
3. [验证效果：收藏时只有一个 BookCard 重渲染](#3-验证效果收藏时只有一个-bookcard-重渲染)
4. [三件套的关系](#4-三件套的关系)
5. [什么时候不需要这些优化](#5-什么时候不需要这些优化)

---

## 1. 为什么函数每次都是新的

在 JavaScript 里，函数是对象，每次 `function` 关键字或箭头函数执行，都会创建一个新的函数对象：

```tsx
function App() {
  // 每次 App 渲染，这里都创建一个新的函数
  function handleFavorite(id: string) {
    setFavorites((prev) => ...);
  }

  // 传给 BookCard 的是这次新创建的函数
  // 上次传的是上次新创建的函数
  // 两次的地址不同 → memo 的浅比较认为 prop 变了
  <BookCard onFavorite={handleFavorite} />
}
```

这不是 Bug，是 JavaScript 的基本语义。每次函数体重新执行，里面定义的所有东西（变量、函数）都是新的。

`memo` 的浅比较依赖的是引用相等（`===`），对函数来说等同于"同一个对象"。两次渲染创建的函数，即使逻辑完全相同，`===` 也是 `false`。

---

## 2. useCallback：缓存函数引用

`useCallback` 的签名和 `useMemo` 非常像：

```tsx
const cachedFn = useCallback(fn, [deps]);

// 等价于：
const cachedFn = useMemo(() => fn, [deps]);
```

它在依赖不变时，返回**上一次创建的那个函数对象**，而不是新建一个：

```tsx
// 不加 useCallback：每次渲染都是新函数
function handleFavorite(id: string) {
  setFavorites((prev) =>
    prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
  );
}

// 加 useCallback：依赖为 []，只在挂载时创建一次，之后每次渲染都返回同一个函数
const handleFavorite = useCallback((id: string) => {
  setFavorites((prev) =>
    prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
  );
}, []);
```

`[]` 表示没有外部依赖——函数里用到了 `setFavorites`，但 `setFavorites` 是 React 保证引用稳定的，不需要列入依赖。

现在传给 `memo(BookCard)` 的 `onFavorite` 每次都是同一个对象：

```
memoText 变化
  → App 重渲染
  → handleFavorite = useCallback → [] 没变 → 返回缓存的函数（同一引用）
  → memo(BookCard) 比较 props：book 没变，onFavorite 没变
  → 跳过渲染 ✓
```

---

## 3. 验证效果：收藏时只有一个 BookCard 重渲染

本章加入了 `favorites: string[]` state 和收藏按钮。用这个场景来验证 `useCallback` + `memo` 的完整效果。

**收藏一本书时，控制台应该只出现一条日志：**

```
favorites 变化
  → App 重渲染
  → filteredBooks = useMemo → keyword 没变 → 返回缓存数组（同一引用）
  → handleFavorite = useCallback → [] 没变 → 返回缓存函数（同一引用）
  → memo(BookCard) 对每本书比较 props：
      - book：同一引用（来自缓存的 filteredBooks）→ 没变
      - isFavorited：favorites.includes(book.id)
          → 被收藏的那本：false → true，变了 → 重渲染 ✓
          → 其余所有书：没变 → 跳过 ✓
      - onFavorite：同一引用（useCallback 缓存）→ 没变
```

打开控制台，点击任意一本书的星号，只会出现那一本书的日志。

**同样，备忘录输入时依然 0 条日志**——三个优化都在生效。

---

## 4. 三件套的关系

```
React.memo
  ─ 让组件在 props 不变时跳过重渲染
  ─ 依赖 props 的引用相等（===）
  ─ 对原始类型（number, string, boolean）天然有效
  ─ 对对象和函数需要配合其他工具

useMemo
  ─ 让计算结果在依赖不变时保持同一引用
  ─ 配合 memo：保证对象 prop 引用稳定

useCallback
  ─ 让函数在依赖不变时保持同一引用
  ─ 配合 memo：保证函数 prop 引用稳定
  ─ 本质是 useMemo 的特化版（专门缓存函数）
```

三者的依赖关系很清晰：**`memo` 是目标，`useMemo` 和 `useCallback` 是让 `memo` 能正常工作的配套工具。**

单独使用 `useMemo` 或 `useCallback` 而没有 `memo`，通常没有实际意义——只是多了一层缓存，并不能减少子组件的重渲染次数。

---

## 5. 什么时候不需要这些优化

这三个工具本身也有开销：缓存需要内存，依赖比较需要时间。如果不加判断地到处使用，反而可能降低性能，同时让代码更难读。

**不需要优化的情况：**

- 组件树很小，重渲染的代价可以忽略
- 子组件没有昂贵的计算或副作用
- state 变化频率低，不会导致连续重渲染

**需要考虑优化的情况：**

- 父组件 state 变化频繁（如每次按键），且子组件数量多
- 子组件有真正昂贵的渲染逻辑（复杂图表、大量 DOM 操作）
- 有计算密集型逻辑（遍历大数组、复杂算法），并且会被频繁触发

**实践建议：先写不优化的版本，用 DevTools Profiler 发现瓶颈，再有针对性地加。不要预防性地给所有东西加 `memo`。**

---

## 小结

| 工具 | 缓存的是 | 配合场景 |
|---|---|---|
| `React.memo` | 组件的渲染结果 | props 不变时跳过重渲染 |
| `useMemo` | 计算结果（任意值） | 保证对象/数组 prop 引用稳定，让 memo 有效 |
| `useCallback` | 函数引用 | 保证函数 prop 引用稳定，让 memo 有效 |

三章案例的进化路线：

```
第一章：问题暴露
  备忘录输入 → 200 个 BookCard 重渲染，统计数据重新计算

第二章：useMemo + React.memo
  备忘录输入 → 0 个 BookCard 重渲染，统计数据不重算
  但加入函数 prop 后，memo 失效

第三章：+ useCallback
  备忘录输入 → 0 个 BookCard 重渲染
  收藏操作 → 只有被收藏的那一个 BookCard 重渲染
```
