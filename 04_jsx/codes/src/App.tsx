import "./App.css";

// 类型定义放在组件外部（最佳实践）
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

export default function App() {
  // ── 普通 JS 代码区 ──────────────────────────────────────────
  const title: string = "user list";
  const age: number = 15;
  const count: number = 0;

  const users: User[] = [
    { id: 1, name: "Alice", email: "alice@abc.com", age: 18 },
    { id: 2, name: "Bob", email: "bob@abc.com", age: 16 },
    { id: 3, name: "Carol", email: "carol@abc.com", age: 20 },
  ];

  // ── 返回 JSX ────────────────────────────────────────────────
  return (
    // 1. JSX 必须有单一根元素，这里用 <div> 作为根
    <div className="p-6 flex flex-col gap-6">
      {/* ── 2. 注释：JSX 中注释必须写在 {} 里 ── */}
      {/* 这是 JSX 注释，HTML 注释 <!-- --> 在 JSX 中无效 */}

      {/* ── 3. 嵌入变量和表达式 ── */}
      {/* {} 里可以放任何 JS 表达式：变量、运算、函数调用 */}
      <h1 className="text-xl font-bold text-red-600">{title.toUpperCase()}</h1>
      <p>1 + 1 = {1 + 1}</p>
      <p>age: {age}</p>

      {/* ── 4. 条件渲染：三元表达式 ── */}
      {age >= 18 ? <p className="text-green-600">成年人</p> : <p className="text-orange-500">未成年人</p>}

      {/* ── 5. 条件渲染：&& 短路（age < 18 为 true，渲染后面的内容） ── */}
      {age < 18 && <p>未成年提示：请监护人陪同</p>}

      {/* ── 6. && 的数字陷阱 ── */}
      {/* 错误写法：count 为 0 时会直接渲染数字 0，而不是不渲染 */}
      {/* {count && <p>有数据</p>}  ← 当 count=0 时，页面会显示 "0" */}
      {/* 正确写法：用 Boolean 转换或三元表达式 */}
      {count > 0 && <p>有 {count} 条数据</p>}
      {!!count && <p>有 {count} 条数据（!! 转布尔值）</p>}

      {/* ── 7. 属性：className 和内联样式 ── */}
      {/* HTML 中 class 在 JSX 中要写成 className */}
      <p className="active">className 示例（来自 App.css）</p>

      {/* 内联样式用对象，属性名用驼峰命名 */}
      <p style={{ color: "purple", fontSize: "18px", backgroundColor: "#f0f0f0" }}>内联样式示例</p>

      {/* ── 8. 列表渲染：直接放 JSX 数组 ── */}
      {/* JSX 可以直接渲染数组中的 JSX 元素，每项必须有 key */}
      <ul>{[<li key={1}>手写数组 item 1</li>, <li key={2}>手写数组 item 2</li>, <li key={3}>手写数组 item 3</li>]}</ul>

      {/* ── 9. 列表渲染：map ── */}
      {/* 真实场景中使用 map 从数据生成 JSX，key 应选数据中的唯一 id */}
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} — {user.email}
          </li>
        ))}
      </ul>

      {/* ── 10. 列表渲染：filter + map ── */}
      {/* 先过滤，再渲染 */}
      <p className="font-bold">成年用户(age &gt;= 18): </p>
      <ul>
        {users
          .filter((user) => user.age >= 18)
          .map((user) => (
            <li key={user.id}>
              {user.name} — {user.age}岁
            </li>
          ))}
      </ul>
    </div>
  );
}
