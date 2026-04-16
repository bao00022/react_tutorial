[← 返回首页](../readme.md)

# 第九章（一）- Props Drilling：购物车案例

前几章用聊天机器人和搜索联想演示了 `useState`、`useRef`、`useEffect` 的核心用法。这些案例基本都只有一个组件（`App`），state 和操作 state 的函数都在同一个地方。

真实项目不是这样的——UI 会被拆成很多组件，state 有时候必须住在顶层，但用到它的组件却在树的深处。本章通过一个购物车案例引出这个问题，并展示它的解决过程。

> 示例代码：[codes/src](codes/src)

## 目录

1. [功能需求与组件树设计](#1-功能需求与组件树设计)
2. [数据结构定义](#2-数据结构定义)
3. [第一步：搭建静态 UI](#3-第一步搭建静态-ui)
4. [第二步：加入购物功能](#4-第二步加入购物功能)
5. [第三步：购物车展示与修改](#5-第三步购物车展示与修改)
6. [state 更新：深拷贝与 StrictMode](#6-state-更新深拷贝与-strictmode)
7. [Props Drilling 问题](#7-props-drilling-问题)

---

## 1. 功能需求与组件树设计

**功能需求：**

- 书目列表展示 6 本书，每本有"加入购物车"按钮
- 点击按钮，书籍加入购物车；已在购物车里的书，数量 +1
- Header 右上角显示购物车总件数
- 点击"购物车"按钮，弹出购物车面板，列出所有已添加书籍
- 购物车里每本书可以单独 +1 / -1，数量减到 0 时自动移除

**组件树：**

```
App
├── Header
│   └── Cart（点击按钮后显示）
└── Shop
    └── Product × 6
```

**state 放在哪里？**

`shoppingCart` 需要同时被两条路径访问：

- `Shop → Product` 需要**往 shoppingCart 里加商品**
- `Header → Cart` 需要**读取 shoppingCart 并修改数量**

这两条路径的共同祖先是 `App`，所以 `shoppingCart` 必须住在 `App`。

---

## 2. 数据结构定义

**`src/data/index.ts`**

```ts
export interface Product {
  id: string;
  image: string;
  title: string;
  price: number;
  description: string;
}

export interface CartItem {
  item: Product;
  quantity: number;
}

export const MOCK_PRODUCTS: Product[] = [ ... ];
```

`CartItem` 不直接存 `productId`，而是存完整的 `Product` 对象。这样在 Cart 组件里渲染商品信息时，不需要再根据 id 去 `MOCK_PRODUCTS` 里查一次。

---

## 3. 第一步：搭建静态 UI

先把所有组件的结构搭出来，不加任何交互，只是把 UI 渲染出来。

**`App.tsx`**

```tsx
function App() {
  return (
    <div className="bg-stone-950 min-h-screen">
      <Header />
      <Shop />
    </div>
  );
}
```

**`Header.tsx`**

```tsx
export default function Header() {
  return (
    <header className="flex justify-between items-center px-8 py-5 bg-stone-900 border-b border-stone-700">
      <h1 className="text-xl font-semibold text-stone-100">秦晖著作</h1>
      <button className="bg-amber-700 text-stone-100 px-4 py-2 rounded">购物车 (0)</button>
    </header>
  );
}
```

**`Shop.tsx`**

```tsx
export default function Shop() {
  return (
    <section className="px-8 py-6">
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MOCK_PRODUCTS.map((product) => (
          <li key={product.id}>
            <Product {...product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
```

**`Product.tsx`**

```tsx
export default function Product({ id, image, title, price, description }) {
  return (
    <article className="flex flex-col bg-stone-800 rounded overflow-hidden h-full">
      <div className="aspect-[2/3] overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-col p-4 flex-1 gap-3">
        <h3 className="text-base font-semibold text-amber-300">{title}</h3>
        <p className="text-xs text-stone-400 flex-1">{description}</p>
        <div className="flex items-center justify-between pt-2 border-t border-stone-700">
          <span className="text-stone-300 text-sm">¥{price.toFixed(2)}</span>
          <button className="bg-amber-700 text-stone-100 py-1 px-3 rounded text-xs">加入购物车</button>
        </div>
      </div>
    </article>
  );
}
```

---

## 4. 第二步：加入购物功能

现在让"Add to Cart"真正工作起来。

**谁负责操作 state？**

`shoppingCart` 住在 `App`，所以修改它的函数也定义在 `App`：

```tsx
function App() {
  const [shoppingCart, setShoppingCart] = useState<CartItem[]>([]);

  function handleAddItemToCart(id: string) {
    setShoppingCart((prev) => {
      const updatedCart = prev.map((prod) => ({ ...prod }));
      const index = updatedCart.findIndex((prod) => prod.item.id === id);
      if (index !== -1) {
        updatedCart[index].quantity += 1;
      } else {
        const product = MOCK_PRODUCTS.find((p) => p.id === id);
        if (product) {
          updatedCart.push({ item: product, quantity: 1 });
        }
      }
      return updatedCart;
    });
  }

  return (
    <div className="bg-stone-950 min-h-screen">
      <Header ... />
      <Shop onAddItemToCart={handleAddItemToCart} />
    </div>
  );
}
```

**第一条 props 透传链：App → Shop → Product**

`handleAddItemToCart` 从 `App` 出发，经过 `Shop`，最终到达 `Product`：

```
App
└── Shop  ← onAddItemToCart
    └── Product  ← onAddItemToCart（再往下传一层）
```

`Shop` 自己不调用这个函数，它只是一个"中转站"，把 prop 原封不动地转给 `Product`：

```tsx
// Shop.tsx
interface ShopProps {
  onAddItemToCart: (id: string) => void;
}

export default function Shop({ onAddItemToCart }: ShopProps) {
  return (
    <ul ...>
      {MOCK_PRODUCTS.map((product) => (
        <li key={product.id}>
          <Product {...product} onAddItemToCart={onAddItemToCart} />
        </li>
      ))}
    </ul>
  );
}
```

```tsx
// Product.tsx
interface ProductProps {
  id: string;
  // ... 其他商品字段
  onAddItemToCart: (id: string) => void;
}

export default function Product({ id, ..., onAddItemToCart }: ProductProps) {
  return (
    <article ...>
      ...
      <button onClick={() => onAddItemToCart(id)}>加入购物车</button>
    </article>
  );
}
```

---

## 5. 第三步：购物车展示与修改

**第二条 props 透传链：App → Header → Cart**

`shoppingCart` 和 `handleUpdateCartItemQuantity` 从 `App` 出发，经过 `Header`，到达 `Cart`：

```
App
└── Header  ← cart, onUpdateCartItemQuantity
    └── Cart  ← cart, onClose, onUpdateCartItemQuantity
```

`Header` 自己维护一个 `isCartOpen` state，控制 `Cart` 的显示与隐藏：

```tsx
// Header.tsx
interface HeaderProps {
  cart: CartItem[];
  onUpdateCartItemQuantity: (id: string, amount: number) => void;
}

export default function Header({ cart, onUpdateCartItemQuantity }: HeaderProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      {isCartOpen && (
        <Cart
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          onUpdateCartItemQuantity={onUpdateCartItemQuantity}
        />
      )}
      <header ...>
        <h1 ...>秦晖著作</h1>
        <button onClick={() => setIsCartOpen(true)}>
          购物车 ({cartQuantity})
        </button>
      </header>
    </>
  );
}
```

`Cart` 接收数据和回调，渲染列表，提供 +/- 按钮：

```tsx
// Cart.tsx
export default function Cart({ cart, onClose, onUpdateCartItemQuantity }: CartProps) {
  const totalPrice = cart.reduce((acc, prod) => acc + prod.item.price * prod.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black/70 z-10 flex items-center justify-center" onClick={onClose}>
      <div className="bg-stone-100 rounded-lg ..." onClick={(e) => e.stopPropagation()}>
        <h2>购物车</h2>
        {cart.map((prod) => (
          <li key={prod.item.id} ...>
            <span>{prod.item.title}</span>
            <div>
              <button onClick={() => onUpdateCartItemQuantity(prod.item.id, -1)}>-</button>
              <span>{prod.quantity}</span>
              <button onClick={() => onUpdateCartItemQuantity(prod.item.id, 1)}>+</button>
            </div>
          </li>
        ))}
        <p>合计：¥{totalPrice.toFixed(2)}</p>
        <button onClick={onClose}>关闭</button>
      </div>
    </div>
  );
}
```

`App` 把 `shoppingCart` 和 `handleUpdateCartItemQuantity` 一并传给 `Header`：

```tsx
// App.tsx
function handleUpdateCartItemQuantity(id: string, amount: number) {
  setShoppingCart((prev) => {
    const updatedCart = prev.map((prod) => ({ ...prod }));
    const index = updatedCart.findIndex((prod) => prod.item.id === id);
    if (index !== -1) {
      updatedCart[index].quantity += amount;
      if (updatedCart[index].quantity <= 0) {
        updatedCart.splice(index, 1);
      }
    }
    return updatedCart;
  });
}

return (
  <div ...>
    <Header
      cart={shoppingCart}
      onUpdateCartItemQuantity={handleUpdateCartItemQuantity}
    />
    <Shop onAddItemToCart={handleAddItemToCart} />
  </div>
);
```

---

## 6. state 更新：深拷贝与 StrictMode

`handleAddItemToCart` 和 `handleUpdateCartItemQuantity` 里都有这一行：

```tsx
const updatedCart = prev.map((prod) => ({ ...prod }));
```

这是深拷贝，不是浅拷贝。区别在哪里？

```tsx
// 浅拷贝：新数组，但数组里的对象还是原来的引用
const updatedCart = [...prev];

// 深拷贝：新数组，且数组里每个对象也是新创建的
const updatedCart = prev.map((prod) => ({ ...prod }));
```

当你写 `updatedCart[index].quantity += 1` 时，你在修改数组里的对象。浅拷贝情况下，`updatedCart[index]` 和 `prev[index]` 指向同一个对象——你实际上修改了原始 state，违反了 React 的不可变性要求。

在 React 的 **StrictMode** 下，开发环境里的 state 更新函数会被调用两次，专门用来暴露这类问题。浅拷贝会导致数量被加两次；深拷贝每次调用都基于独立的副本，结果正确。

---

## 7. Props Drilling 问题

梳理一下本章的两条 props 透传链：

**链路一：** `handleAddItemToCart` 从 `App` 传到 `Shop`，再传到 `Product`

```
App（定义 handleAddItemToCart）
  ↓ onAddItemToCart
Shop（不用，只是传递）
  ↓ onAddItemToCart
Product（真正调用的地方）
```

**链路二：** `shoppingCart` + `handleUpdateCartItemQuantity` 从 `App` 传到 `Header`，再传到 `Cart`

```
App（shoppingCart state，定义 handleUpdateCartItemQuantity）
  ↓ cart + onUpdateCartItemQuantity
Header（只用 cart 算 cartQuantity；不用 onUpdateCartItemQuantity，只是传递）
  ↓ cart + onUpdateCartItemQuantity
Cart（真正用到的地方）
```

`Shop` 和 `Header` 都只是中间节点，它们不消费这些 props，只是负责"透传"——这就是 **Props Drilling（属性透传）**。

在这个案例里组件树只有两层，还可以接受。但如果组件层级更深，或者需要共享数据的组件散落在树的各处，这种写法就会变得难以维护：每增加一个中间层级，就要多一处改动。

**Props Drilling 的特征：**

- 中间组件不需要某个 prop，但被迫接收并转发它
- prop 的类型定义需要在每一层组件的 interface 里重复声明
- 树结构变化时（增删层级、移动组件），要同步修改多处

---

## React DevTools 截图

![sc1](assets/sc1.png)

截图中选中的是 `App` 组件，右侧 hooks 面板显示：

```
state: [{...}, {...}]
```

这是 `useState` 的状态——购物车里有两本书，展开后能看到每个 `CartItem` 对象的完整内容（书名、价格、数量等）。

注意组件树的结构：`App > Header > Shop > Product × 6`。`App` 是整棵树的根，购物车的 state 就住在这里。`Header` 和 `Shop` 之所以出现在 `App` 的 hooks 里，是因为 state 在 `App`，操作函数也定义在 `App`，再通过 props 一层层往下传——这就是本章要解决的 Props Drilling。

---

## 小结

| 概念                | 说明                                                                 |
| ------------------- | -------------------------------------------------------------------- |
| state 提升          | 多个组件共享同一份 state 时，state 放在它们最近的共同祖先            |
| 操作函数随 state 走 | 修改 state 的函数定义在 state 所在的组件里，通过 props 往下传        |
| 深拷贝              | `prev.map(item => ({ ...item }))` 保证每次更新都基于独立副本         |
| StrictMode          | 开发环境下双调用 state 更新函数，暴露直接修改 state 的问题           |
| Props Drilling      | 中间组件被迫传递自己不需要的 props，是随组件层级加深而累积的维护负担 |

下一章用 **Context** 解决这个问题——让任意深度的子组件直接访问 `shoppingCart`，不再需要逐层透传。
