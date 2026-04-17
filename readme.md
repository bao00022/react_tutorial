# React 系列 —— 从原理到状态管理

学 React，其实不难。难的是——你走的是不是一条清晰的路。

很多教程的问题，不在于讲得不够多，而在于讲得太多。API 一页页铺开，概念一个接一个出现，看似完整，却让人很难判断：哪些是主线，哪些只是支线。

结果往往是：你跟着教程走完一遍，可以复现例子，却很难独立解决问题。不是因为不努力，而是因为从一开始，就没有一条清晰的路径。

这本教程想做的事情很简单——只讲主线。

就像游戏一样，支线可以丰富体验，但只有主线，才能带你走到终点。

教程以四个案例贯穿始终：**聊天机器人**引出 `useState`、`useRef`、`useEffect` 的核心用法；**搜索关键字联想**展示 `useEffect` cleanup 在竞态条件下不可或缺的作用；**购物车**演示了状态管理从零开始的完整演进——从单组件 `useState`，到 Context，到 `useReducer`，最终到 Redux；**图书检索台**则以 200 本书的规模，把 React 默认渲染行为的代价暴露出来，再用 `memo`、`useMemo`、`useCallback` 三件套逐一修复。

每一步都有明确的推进理由，每一个新工具的引入都是被前一步的局限逼出来的，不是"现在来介绍一个新概念"，而是"当前的方案到这里走不下去了，所以需要它"。

---

## 目录

- [阶段一：React 基础认知（第 1–4 章）](#阶段一react-基础认知)
- [阶段二：核心 Hooks（第 5–8 章）](#阶段二核心-hooks)
- [阶段三：状态管理（第 9 章，四个版本）](#阶段三状态管理)
- [阶段四：性能优化（第 10 章，三个版本）](#阶段四性能优化)

---

## 阶段一：React 基础认知

理解一个工具，最好的方式是先看清楚它在解决什么问题，再看清楚它是怎么解决的。这个阶段不急着写组件，先把 React 是什么、为什么存在、它的开发环境是怎么跑起来的，一件件说清楚。

---

### 第 1 章：React 入门基础（[`01_react_basic`](./01_react_basic/readme.md)）

不依赖任何构建工具，直接在 HTML 里通过 CDN 引入 React，用最小的代价把 React 的核心思路暴露出来。

- 原生 DOM 操作 vs React 声明式写法的对比
- `React.createElement` 的实际形态：JSX 背后的函数调用
- React 的单向数据流：数据向下，事件向上
- 虚拟 DOM 的作用：为什么 React 不直接操作真实 DOM

---

### 第 2 章：手搓 React 开发环境（[`02_react_dev_env`](./02_react_dev_env/readme.md)）

从零手动搭建 Webpack + Babel 的开发环境。目的不是背配置，而是把"一个 React 项目里每个工具在干什么"这件事搞清楚——这样之后遇到构建报错，才知道去哪里找原因。

- `babel-loader`：为什么浏览器不认识 JSX，谁负责把它编译掉
- Webpack 的打包逻辑：从多个源文件到一个 `bundle.js`
- `webpack-dev-server`：热更新是怎么实现的
- `source-map`：生产代码出错时如何找回原始位置

---

### 第 3 章：使用 Vite 搭建 React 开发环境（[`03_vite`](./03_vite/readme.md)）

Webpack 的配置繁琐，但帮我们理解了构建的全貌。Vite 把同样的事情封装成一条命令——理解了上一章，就能理解 Vite 替我们做了什么，而不只是照着文档操作。

- Vite 与 Webpack 的设计哲学对比：按需编译 vs 全量打包
- 项目结构：`src/`、`public/`、`index.html`、`vite.config.ts` 各自的角色
- TypeScript + React 的配置：`tsconfig.json` 中与 JSX 相关的选项
- Tailwind CSS v4 的集成方式

---

### 第 4 章：JSX 语法（[`04_jsx`](./04_jsx/readme.md)）

JSX 看起来像 HTML，但它不是。弄清楚两者的区别，以及 JSX 里哪些规则是"必须这样"而不是"约定俗成"，后面写组件才不会在语法上绊跤。

- JSX 与 HTML 的差异：`className`、自闭合标签、驼峰属性名
- 用 `{}` 嵌入 JavaScript 表达式：变量、三元运算符、函数调用
- 列表渲染：`Array.map()` 与 `key` 的作用
- 条件渲染：`&&` 短路、三元运算符、提前 return
- 组件与 props：组件是函数，props 是参数

---

## 阶段二：核心 Hooks

React Hooks 是函数式组件管理状态和副作用的方式。理解 Hooks，关键不是记住 API，而是理解每一个 Hook 解决的是什么具体问题。这个阶段通过三个递进案例来回答这个问题。

---

### 第 5 章：useState（[`05_useState`](./05_useState/readme.md)）

计数器演示了 `useState` 的基本形态，但真正有趣的问题在聊天机器人案例里：多个 state 之间如何协调，状态更新为什么有时候读不到最新值，以及 React 的批量更新是怎么工作的。

- `useState` 的惰性初始化与函数式更新
- 为什么直接修改 state 不触发重渲染
- 多个 `useState` 的组合使用
- 受控组件：表单元素如何与 state 保持同步

---

### 第 6 章：useRef 与 useEffect（[`06_useRef_useEffect`](./06_useRef_useEffect/readme.md)）

聊天机器人加了新消息之后，页面不会自动滚到底部——因为 React 管理数据，不管 DOM。这个问题引出了 `useRef`：一种持有 DOM 节点引用、且不触发重渲染的方式。`useEffect` 则负责在渲染完成后执行滚动。

- `useRef` 的两个用途：持有 DOM 引用 vs 持有跨渲染周期的可变值
- `useEffect` 的执行时机：渲染提交到 DOM 之后
- `useEffect` 的依赖数组：控制何时重新执行
- 为什么滚动操作不能放在渲染函数里

---

### 第 7 章：useEffect cleanup（[`07_useEffect`](./07_useEffect/readme.md)）

Bot 延迟回复的功能，引出了 `useEffect` 的第三种形式：带 cleanup 的 effect。如果用户在延迟期间快速发了多条消息，之前的定时器不清除，回复就会乱序堆积。cleanup 就是 React 给你的那把扫帚。

- cleanup 函数的执行时机：下一次 effect 运行前，以及组件卸载时
- 定时器的正确管理：为什么 `setTimeout` 必须在 cleanup 里清除
- `useEffect` 三种形式的对比与适用场景

---

### 第 8 章：useEffect 实战——搜索关键字联想（[`08_useEffect_case2`](./08_useEffect_case2/readme.md)）

一个更贴近真实产品的场景：用户输入时实时调用外部 API 获取联想词。这个案例综合了前几章所有知识点，并展示了 cleanup **真正不可或缺**的场景——竞态条件：多个请求并发发出，如果响应乱序返回，页面会显示错误的结果。

- 用 cleanup 的 `ignore` 标志解决竞态条件
- `AbortController`：从网络层取消飞行中的请求
- 防抖（debounce）：减少 API 调用频次
- 自定义 Hook：把可复用的逻辑从组件里提取出来

---

## 阶段三：状态管理

案例是一个**购物车应用**：页面展示一批书籍，用户可以把书加入购物车，在购物车里调整每本书的数量，也可以删减。Header 右上角实时显示购物车的总件数，点击后弹出购物车面板查看明细和合计金额。

功能本身不复杂，但它天然涉及多个组件之间的状态共享——书单里的 `Product` 要往购物车里加东西，弹出的 `Cart` 要读取和修改购物车内容，而它们在组件树里相距甚远。这个结构，恰好是演示状态管理演进路线的理想场景。

状态管理没有一个正确答案，只有适合当前规模的答案。这个阶段的四章用同一个购物车案例，走完了从 `useState` 到 Redux 的完整演进——每一步都是被前一步的局限推着走的，而不是事先规划好的。

---

### 第 9-1 章：Props Drilling（[`09_shopping_cart_1`](./09_shopping_cart_1/readme.md)）

这一章的目标不是"解决问题"，而是"把问题看清楚"。购物车需要在多个组件之间共享数据，按照 React 的规则，共享的 state 必须提升到共同祖先——于是 `shoppingCart` 住进了 `App`，操作函数也随之定义在 `App`，然后通过 props 一层层往下传。中间经过的 `Shop` 和 `Header` 对这些 props 没有任何兴趣，却不得不接收再转发。这就是 Props Drilling：它不是 bug，是随层级加深自然积累的维护负担。亲眼看到这个问题是怎么产生的，才能真正理解下一章的解法为什么必要。

- 状态提升：多个组件共享同一份 state 时，state 放在最近的共同祖先
- 操作函数随 state 走：修改 state 的函数定义在 state 所在的组件里
- 深拷贝：为什么 `prev.map(item => ({ ...item }))` 是必要的
- Props Drilling 的特征：中间组件被迫接收并转发自己不需要的 props

---

### 第 9-2 章：Context（[`09_shopping_cart_2`](./09_shopping_cart_2/readme.md)）

目标是彻底消除上一章暴露的两条透传链，让中间组件从"被迫传递"的角色里解放出来。Context 是 React 内置的跨层级数据通道——`CartProvider` 向整棵子树广播数据，任意深度的组件直接订阅，不再需要中间层插手。读完这一章，`Shop` 和 `Header` 的 props interface 会完全清空，组件只负责自己真正关心的事情。

- `createContext` / `useContext` / `Provider` 的协作方式
- 自定义 Hook `useCart()`：封装 `useContext`，加入空值检查，简化每处的导入
- 什么应该放进 Context：跨层级共享的数据；纯局部的 UI 状态留在本地

---

### 第 9-3 章：useReducer（[`09_shopping_cart_3`](./09_shopping_cart_3/readme.md)）

Context 解决了"数据怎么传"，这一章解决"状态怎么改"。目标是把所有对 `cart` 的修改逻辑从分散的 handler 函数里抽出来，集中到一个纯函数里——这样"有哪些操作"和"每个操作的细节"就被清晰地分开了。读完这一章，还会理解 `reducer` 和 `dispatch` 这两个词的来历，以及为什么 Redux 后来选择了同样的模型。

- `reducer` 的字面含义：把（当前状态 + 一件新发生的事）归约成下一个状态
- `dispatch` 的语义：描述"发生了什么事"，而不是"值要变成什么"
- Reducer 是纯函数：不依赖组件环境，可以单独测试
- `useState` vs `useReducer` 的适用场景对比

---

### 第 9-4 章：Redux（[`09_shopping_cart_4`](./09_shopping_cart_4/readme.md)）

Redux 是一个独立的第三方状态管理库，由 Dan Abramov 于 2015 年创建，与 React 官方无关，也不绑定任何框架。它和 `useReducer` 的核心模型完全一致——`旧 state + action → reducer → 新 state`——因为 `useReducer` 本身就是借鉴 Redux 设计的。两者最本质的区别只有一个：`useReducer` 的 store 住在 React 组件里，Redux 的 store 是 React 之外的独立对象，组件通过 `useSelector` 订阅它。

这一章把购物车从 Context + `useReducer` 迁移到 Redux Toolkit，改动涉及所有组件，但 reducer 逻辑本身几乎不变——换的是装它的容器，不是里面的逻辑。

- Redux 与 `useReducer` 的核心区别：store 在 React 内 vs React 外
- `createSlice`：自动生成 action type 字符串和 action creator 函数，告别手写字符串常量
- 内置 Immer：reducer 里可以直接"修改" state，不再需要手动复制数组
- `configureStore` + `<Provider>`：创建 store，注入组件树
- `useSelector`：精确订阅 state 的某一片段，比 Context 重渲染粒度更细
- Redux DevTools：可视化每一次 action 和对应的状态变化，支持时间旅行回放

---

## 阶段四：性能优化

案例是一个**图书检索应用**：页面展示 200 本书的列表，顶部有一个搜索框，输入关键字可以实时过滤书名和作者，同时显示筛选结果的统计数据（总数、总价、均价、最高价）。页面右侧还有一个独立的备忘录输入框，供用户随手记录。

两个输入框共存在同一个 `App` 组件里。正是这个结构暴露了问题：备忘录和书单毫无关系，但每次在备忘录里输入一个字，200 个 `BookCard` 全部重渲染，统计数据也重新计算一遍。

这个阶段用这个案例，把 React 默认渲染行为的代价显现出来，再用 `React.memo`、`useMemo`、`useCallback` 三件套逐一修复。

---

### 第 10-1 章：不必要的重渲染（[`10_book_search_1`](./10_book_search_1/readme.md)）

这一章和第 9-1 章的定位一样：先把问题看清楚，再谈解法。React 的默认规则是：任何 state 变化，当前组件加上它所有的子孙都会重新渲染。在组件树规模小的时候，这个代价可以忽略；但图书检索台有 200 个 `BookCard`，备忘录每输入一个字，200 个卡片全部重渲染——统计数据也每次重新计算。目标是在每个组件里加一行 `console.log`，打开浏览器控制台，亲眼看到备忘录输入时 200 条日志刷屏，把问题的规模直观感受清楚，为后两章的优化做准备。

- React 默认渲染行为：state 变化 → 当前组件 + 所有子孙全部重渲染
- 什么情况下值得优化：触发频繁、子组件数量多、与触发源无关，三者同时成立
- 用 `console.log` 观察渲染：最直接的方式，每次渲染都在控制台留下记录

---

### 第 10-2 章：React.memo 与 useMemo（[`10_book_search_2`](./10_book_search_2/readme.md)）

目标是解决上一章发现的两个问题，并且搞清楚它们为什么需要不同的工具来解决。`useMemo` 解决的是"昂贵的计算每次都重跑"——它缓存的是一个值；`React.memo` 解决的是"props 没变的组件每次都重渲染"——它缓存的是一次渲染结果。两者针对的是不同层面的浪费，不能互换。读完这一章，`BookCard` 在书单不变时不再重渲染，统计数据只在购买记录真正变化时才重新计算。

- `useMemo(fn, deps)`：缓存计算结果，依赖不变时跳过重新计算
- `React.memo(Component)`：缓存渲染结果，props 浅比较不变时跳过重渲染
- 浅比较的含义与局限：原始值比较值，对象和函数比较引用地址

---

### 第 10-3 章：useCallback（[`10_book_search_3`](./10_book_search_3/readme.md)）

目标是把上一章留下的隐患修掉，同时完成性能优化三件套的最后一块。给 `BookCard` 加收藏功能时，会发现 `memo` 悄然失效了：每次 `App` 重渲染，收藏函数都是一个新创建的对象，引用地址变了，`memo` 的浅比较认为 props 有变化，于是照常重渲染。`useCallback` 稳定函数引用，依赖不变时每次返回同一个函数——`memo` 重新生效。读完这一章，能理解三件套各自解决什么、为什么 `memo` 和 `useCallback` 经常成对出现，以及什么时候不该加它们。

- `useCallback(fn, deps)`：缓存函数引用，依赖不变时返回同一个函数对象
- 为什么函数 prop 会让 `memo` 失效：每次渲染创建新函数，引用地址不同
- `memo` + `useCallback` 成对出现的原因：缺一个，另一个就失去意义
- 过早优化的代价：缓存本身有成本，没有性能问题就不该加

---

## 后语：React 只是起点

走完这十章，你已经不再是“会写 React”的人，而是一个知道为什么这么写的人。

你理解了状态是如何流动的，副作用为什么存在，性能问题从哪里产生，又该如何被一点点拆解。这些能力，比任何一个 API 都更持久。

但 React 本身，从来不是终点。在真实世界里，它往往只是一个更大体系中的一部分：

**Next.js**——React 官方文档现在推荐的第一条路径不是裸 React，而是框架，Next.js 是其中最主流的选择。App Router、React Server Components、服务端缓存策略，代表了 React 当前的演进方向，也是真实项目里最值得投入的技术栈。理解了本教程的客户端渲染，再去看 Next.js 的服务端组件，才能真正感受到两种模型的差异和各自的取舍——而不只是跟着文档配置。

**React Router**——在裸 React 的 SPA 项目里仍然会用到，了解它的基本概念（嵌套路由、`loader`、`action`）有价值，但新项目的首选已经是 Next.js App Router。把它当作"需要理解，不必深挖"的知识储备即可。

当你回头再看这些工具时，会发现它们不再是新的负担，而只是——另一种形式的组合。

路已经打开了，剩下的，不过是继续往前走。

---

## 许可

本文档及相关代码以 MIT 协议发布。

Author: Linlin Wang

Contact: wanglinlin.cn@gmail.com
