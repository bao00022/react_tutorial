[← 返回首页](../readme.md)

# 第八章 - useEffect 实战：搜索关键字联想

前两章用聊天机器人演示了 `useEffect` 的三种形式——依赖变化时执行、挂载时执行一次、带 cleanup 的延迟回复。本章换一个更贴近真实产品的场景：**搜索关键字联想**。

用户在搜索框输入内容时，实时调用外部 API 获取关键字建议，点击建议后将其填回输入框。这个案例会把之前讲过的所有知识点综合运用一遍，同时展示 cleanup **真正不可或缺**的场景。

> 示例代码：[codes/src/App.tsx](codes/src/App.tsx)

## 目录

1. [需求与状态设计](#1-需求与状态设计)
2. [第一步：搭建 UI](#2-第一步搭建-ui)
3. [第二步：接入 API](#3-第二步接入-api)
4. [第三步：防抖——cleanup 真正发挥作用的地方](#4-第三步防抖cleanup-真正发挥作用的地方)
5. [第四步：处理选中建议](#5-第四步处理选中建议)
6. [第五步：加入 loading 和 error 状态](#6-第五步加入-loading-和-error-状态)
7. [完整的 useEffect 逻辑](#7-完整的-useeffect-逻辑)

---

## 1. 需求与状态设计

**功能需求：**

- 用户输入关键字 → 调用 API → 展示建议列表
- 输入框为空 → 不调用 API，清空列表
- 点击建议 → 将建议填入输入框，关闭列表
- 调用 API 期间显示 loading，失败时显示错误提示

**涉及的 state：**

| state         | 类型             | 用途                                                |
| ------------- | ---------------- | --------------------------------------------------- |
| `keyword`     | `string`         | 输入框当前内容，也是 API 的查询词                   |
| `suggestions` | `string[]`       | API 返回的建议列表                                  |
| `isSelected`  | `boolean`        | 标记当前 keyword 变化是"用户点击选中"而非"用户打字" |
| `loading`     | `boolean`        | 是否正在请求 API                                    |
| `error`       | `string \| null` | API 请求失败时的错误信息                            |

`isSelected` 乍看有些奇怪，后面会专门解释它存在的原因。

---

## 2. 第一步：搭建 UI

UI 分三块：搜索框 + 按钮、loading 与错误提示、建议列表。

```tsx
return (
  <div className="mt-32 flex flex-col gap-4 w-96 mx-auto bg-gray-100 p-4 rounded-2xl">
    {/* 搜索框 */}
    <div className="w-full flex gap-2">
      <input
        className="w-full p-2 border bg-white border-gray-300 rounded"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="enter keyword here..."
      />
      <button className="py-1 px-4 bg-green-500 text-white rounded-full">Search</button>
    </div>

    {/* loading / error */}
    {loading && <div>Loading...</div>}
    {error && <div className="text-red-500">{error}</div>}

    {/* 建议列表 */}
    <ul className="flex flex-col gap-1">
      {suggestions.map((suggest, index) => (
        <li
          key={index}
          className="px-2 py-1 hover:bg-white rounded cursor-pointer flex items-center gap-2"
          onClick={() => handleSelect(suggest)}
        >
          <Search size={16} />
          {suggest}
        </li>
      ))}
    </ul>
  </div>
);
```

这里 `input` 依然是受控输入——`value={keyword}` + `onChange` 更新 state，和第 05 章的模式完全一样。

---

## 3. 第二步：接入 API

用户每次改变 `keyword`，就需要调用 API。这个操作不能写在 `onChange` 里，因为 `onChange` 只负责更新 state，副作用（网络请求）应该交给 `useEffect` 来处理：

```tsx
useEffect(() => {
  if (!keyword) {
    setSuggestions([]);
    return;
  }

  const fetchData = async () => {
    try {
      const results = await fetchSuggestions(keyword);
      setSuggestions(results);
    } catch (err) {
      console.error(err);
    }
  };

  fetchData();
}, [keyword]);
```

**`keyword` 为空时提前退出**，顺手清空建议列表——没必要为空字符串发请求。

`fetchSuggestions` 封装在 `src/lib/index.ts` 里，负责调用外部 API 并返回建议数组：

```ts
export async function fetchSuggestions(keyword: string): Promise<string[]> {
  const url = `https://api.addsearch.com/v1/suggest/${key}?term=${encodeURIComponent(keyword)}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.suggestions.map((item) => item.value);
}
```

---

## 4. 第三步：防抖——cleanup 真正发挥作用的地方

上一步的代码可以运行，但有一个严重的性能问题：用户每打一个字就触发一次 API 请求。输入 "javascript" 这 10 个字符，就会发出 10 个请求，绝大多数都是无意义的中间状态。

打开浏览器 DevTools 的 Network 面板，可以清楚地看到请求被连续触发。

**解决方案：防抖（Debounce）**

防抖的思路：不在用户每次击键时立刻请求，而是等待用户**停止输入 500ms 后**才发请求。如果在等待期间用户又打了新字，就取消上一次的等待，重新计时。

用 `setTimeout` + cleanup 实现：

```tsx
useEffect(() => {
  if (!keyword) {
    setSuggestions([]);
    return;
  }

  const timer = setTimeout(async () => {
    try {
      const results = await fetchSuggestions(keyword);
      setSuggestions(results);
    } catch (err) {
      console.error(err);
    }
  }, 500);

  return () => clearTimeout(timer); // cleanup：取消上一次还没到期的 timer
}, [keyword]);
```

执行过程：

```
用户输入 "j"   → effect 运行 → 启动 timer（500ms 后请求）
用户输入 "ja"  → cleanup 取消上一个 timer → 启动新 timer
用户输入 "jav" → cleanup 取消上一个 timer → 启动新 timer
...
用户停止输入，500ms 后 → timer 到期 → 发出请求（只有这一次）
```

**这里的 cleanup 是真正不可替代的。** 和第七章不同——那个案例里 `isTyping` 是布尔值，从 `true` 到 `true` 不构成依赖变化，effect 不会重复触发，cleanup 写不写效果一样。这里 `keyword` 是字符串，每次击键值都不同，每次都会触发新的 effect，不写 cleanup 就会同时存在多个正在倒计时的 timer，全部到期后全部发请求。

---

## 5. 第四步：处理选中建议

点击建议列表里的某一项，应该把它填入输入框并关闭列表：

```tsx
function handleSelect(suggest: string) {
  setKeyword(suggest); // 更新输入框内容
  setSuggestions([]); // 关闭建议列表
}
```

但这里有一个问题：`setKeyword(suggest)` 修改了 `keyword`，而 `useEffect` 监听的正是 `keyword`——这会触发一次新的 API 请求，建议列表刚关上又被重新拉开。

**解决方案：用 `isSelected` 标记这次变化的来源**

```tsx
function handleSelect(suggest: string) {
  setIsSelected(true); // 标记：这次 keyword 变化是"选中"，不是"打字"
  setKeyword(suggest);
  setSuggestions([]);
}
```

在 `useEffect` 里，检测到 `isSelected` 为 `true` 时直接跳过请求：

```tsx
useEffect(() => {
  if (isSelected) {
    setIsSelected(false); // 重置标记
    return; // 跳过这次请求
  }

  if (!keyword) {
    setSuggestions([]);
    return;
  }

  // ... 防抖 + fetch
}, [keyword]);
```

这是一个很典型的"区分 state 变化来源"的技巧：同一个 state（`keyword`）可能被多条路径修改（用户打字 / 点击选中），当不同路径需要不同的响应时，就用一个额外的标记 state 来区分。

---

## 6. 第五步：加入 loading 和 error 状态

网络请求有两种不确定性：慢（需要 loading 提示）和失败（需要错误提示）。用两个 state 来处理：

```tsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

把 fetch 逻辑包进 `try/catch/finally`：

```tsx
setLoading(true);
setError(null);

const timer = setTimeout(async () => {
  try {
    const results = await fetchSuggestions(keyword);
    setSuggestions(results);
  } catch (err) {
    setError("fetch suggestions failed");
  } finally {
    setLoading(false);
  }
}, 500);
```

- `setLoading(true)` 在请求开始时显示 loading
- `finally` 保证无论成功还是失败，loading 都会被关掉
- `catch` 捕获网络错误，把错误信息存入 state，在 UI 里展示

---

## 7. 完整的 useEffect 逻辑

把上面几步整合后，完整的 effect 如下：

```tsx
useEffect(() => {
  // 条件一：如果是点击选中触发的 keyword 变化，跳过请求
  if (isSelected) {
    setIsSelected(false);
    return;
  }

  // 条件二：keyword 为空，清空列表，不请求
  if (!keyword) {
    setSuggestions([]);
    return;
  }

  setLoading(true);
  setError(null);

  // 防抖：500ms 后发请求
  const timer = setTimeout(async () => {
    try {
      const results = await fetchSuggestions(keyword);
      setSuggestions(results);
    } catch (err) {
      setError("fetch suggestions failed");
    } finally {
      setLoading(false);
    }
  }, 500);

  return () => clearTimeout(timer);
}, [keyword]);
```

这个 effect 集中体现了 `useEffect` 的几个核心用法：

| 用法             | 体现在哪里                                    |
| ---------------- | --------------------------------------------- |
| 依赖变化时执行   | `[keyword]`，keyword 每次变化都触发           |
| 条件逻辑控制执行 | `if (isSelected)` 和 `if (!keyword)` 提前退出 |
| 异步操作         | `setTimeout` 内用 `async/await` 调用 API      |
| cleanup          | `return () => clearTimeout(timer)` 实现防抖   |
| 多个 state 联动  | loading、error、suggestions 随请求状态变化    |

---

## 小结

| 概念                 | 说明                                                                         |
| -------------------- | ---------------------------------------------------------------------------- |
| 副作用与 `useEffect` | 网络请求属于副作用，应该在 `useEffect` 里发，不要写在 `onChange` 里          |
| 防抖                 | 用 `setTimeout` 延迟执行，用 cleanup 取消上一次，只保留最新一次请求          |
| cleanup 的必要性     | 依赖是会频繁变化的字符串时，不写 cleanup 会有多个 timer 同时存在             |
| 区分 state 变化来源  | 同一 state 被多条路径修改时，用额外的标记 state 区分来源，控制 effect 的行为 |
| loading / error      | 网络请求标配；`finally` 保证 loading 一定被关掉                              |
