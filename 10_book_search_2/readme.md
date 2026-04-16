[← 返回首页](../readme.md)

# 第十章（二）- React.memo 与 useMemo：跳过不必要的工作

上一章确认了两个问题：备忘录输入时，200 个 BookCard 重渲染，统计数据重新计算。本章用两个工具分别解决它们。

> 本章修改了 `App.tsx` 和 `BookCard.tsx`。
>
> 示例代码：[codes/src](codes/src)

## 目录

1. [useMemo：缓存计算结果](#1-usememo缓存计算结果)
2. [React.memo：跳过组件重渲染](#2-reactmemo跳过组件重渲染)
3. [验证优化效果](#3-验证优化效果)
4. [memo 的工作原理与局限](#4-memo-的工作原理与局限)

---

## 1. useMemo：缓存计算结果

`useMemo` 的作用是**缓存一段计算的结果**，只在依赖变化时重新计算：

```tsx
const value = useMemo(() => {
  // 计算逻辑
  return expensiveResult;
}, [dep1, dep2]);
```

**修复过滤逻辑：**

```tsx
// 第一章：每次渲染都重新过滤
const filteredBooks = BOOKS.filter(
  (b) => b.title.includes(keyword) || b.author.includes(keyword)
);

// 第二章：只在 keyword 变化时重新过滤
const filteredBooks = useMemo(
  () => BOOKS.filter((b) => b.title.includes(keyword) || b.author.includes(keyword)),
  [keyword]
);
```

当 `memoText` 变化导致 App 重渲染时，`keyword` 没变 → `useMemo` 直接返回上次的结果，跳过整个 filter 运算。

**修复统计计算：**

```tsx
const stats = useMemo(() => {
  const total = filteredBooks.length;
  const totalValue = filteredBooks.reduce((sum, b) => sum + b.price, 0);
  return {
    total,
    totalValue,
    avgPrice: total > 0 ? totalValue / total : 0,
    maxPrice: total > 0 ? Math.max(...filteredBooks.map((b) => b.price)) : 0,
  };
}, [filteredBooks]);
```

依赖是 `filteredBooks`——只有它变化时才重新计算。`filteredBooks` 只在 `keyword` 变化时才变化，所以备忘录输入不再触发统计重算。

**useMemo 的本质：**

`useMemo` 是一个**缓存机制**，不是一个魔法优化。它有自己的开销（存储上次的结果、比较依赖项）。对于简单的计算，直接算反而更快。只在以下场景才值得用：

- 计算本身较重（遍历大数组、复杂运算）
- 计算结果会作为其他 `useMemo` 或 `memo` 的依赖项（需要稳定的引用）

---

## 2. React.memo：跳过组件重渲染

`React.memo` 是一个**高阶组件**（接收组件，返回新组件），让组件在 props 没有变化时跳过重渲染：

```tsx
// 不包裹：父组件渲染 → 无条件重渲染
export default function BookCard({ book }) { ... }

// 包裹：父组件渲染 → 先比较 props → props 相同则跳过
export default memo(BookCard);
```

用法很简单，只需在导出时包一层：

```tsx
import { memo } from "react";

function BookCard({ book }: BookCardProps) {
  console.log("BookCard rendered:", book.title);
  return ( ... );
}

export default memo(BookCard);
```

**比较规则：**

`memo` 对 props 做**浅比较**（shallow equality）：

```
上一次 props: { book: <同一个对象引用> }
这一次 props: { book: <同一个对象引用> }
→ 相同，跳过渲染 ✓

上一次 props: { book: <对象 A> }
这一次 props: { book: <对象 A 的拷贝，内容相同但不同引用> }
→ 引用不同，视为变化，重新渲染 ✗
```

这就是为什么 `filteredBooks` 需要用 `useMemo` 缓存引用：如果每次渲染都产生新数组（即使内容相同），`memo(BookCard)` 会认为 `book` prop 变了，跳过失效。

---

## 3. 验证优化效果

打开控制台，做两组对比：

**搜索框输入（keyword 变化）：**

控制台仍然出现日志。过滤结果改变 → `filteredBooks` 是新数组 → `book` props 变化 → BookCard 需要重渲染。这是**正确行为**。

**备忘录输入（memoText 变化，keyword 不变）：**

控制台**没有任何日志**。

```
memoText 变化
  → App 重渲染
  → filteredBooks = useMemo → keyword 没变 → 返回缓存的数组（同一引用）
  → stats = useMemo → filteredBooks 没变 → 跳过计算
  → memo(BookCard) → book prop 没变 → 跳过渲染
  → console.log 不执行
```

---

## 4. memo 的工作原理与局限

`memo` 通过比较 props 来决定是否跳过渲染，这在大多数情况下有效，但有一个常见的盲点：**函数 prop**。

假设现在需要给 BookCard 添加一个收藏按钮，需要传入一个回调：

```tsx
// App 里
function handleFavorite(id: string) {
  setFavorites((prev) => ...);
}

// 每次 App 重渲染，handleFavorite 都是新创建的函数
// → 新的内存地址 → memo 比较时认为 prop 变了
<BookCard book={book} onFavorite={handleFavorite} />
```

```
memoText 变化
  → App 重渲染
  → handleFavorite = 新函数（新地址）
  → memo(BookCard) 比较 onFavorite：上次的地址 ≠ 这次的地址
  → memo 认为 props 变了，重新渲染 ✗
```

这时候 `memo` 完全失效，和不加一样。下一章用 `useCallback` 解决这个问题。

---

## 小结

| 工具 | 作用 | 放在哪里 |
|---|---|---|
| `useMemo` | 缓存**计算结果**，依赖不变时返回上次的值 | 组件内，包裹昂贵的计算 |
| `React.memo` | 缓存**渲染结果**，props 不变时跳过重渲染 | 组件导出处，包裹子组件 |

两者配合：`useMemo` 保证传给 `memo` 组件的 props 引用稳定，`memo` 才能正确判断"props 没变，跳过"。

函数 prop 是个例外——函数每次都是新创建的，引用永远不同。这是 `useCallback` 的用武之地。
