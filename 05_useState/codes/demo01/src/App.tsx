import { useState } from "react";

function App() {
  let count = 0;
  const [newCount, setNewCount] = useState(0);

  function handleClick1() {
    count = count + 1; // 变量确实变了
    console.log("按钮被点击了，当前count值：", count); // 控制台也能看到新值
  }

  function handleClick2() {
    console.log("按钮被点击了，当前newCount值：", newCount);
    setNewCount(newCount + 1); // 这里 newCount = 0 → 结果是 1
    setNewCount(newCount + 1); // 依然是基于 newCount = 0 → 结果还是 1
    setNewCount(newCount + 1); // 依然是基于 newCount = 0 → 结果还是 1
  }

  // 回调写法（函数式更新）是 React 专门提供来解决这个问题
  // 这里的 setCount(updaterFn)，React 会把 updaterFn 放到更新队列里，并且依次执行，这样每一步都能拿到最新的状态

  function handleClick3() {
    console.log("按钮被点击了，当前newCount值：", newCount);
    setNewCount((newCount) => newCount + 1);
    setNewCount((newCount) => newCount + 1);
    setNewCount((newCount) => newCount + 1);
  }

  return (
    <div className="app">
      <h1>一个由Count引发的思考</h1>
      <div className="card">
        <p>count: {count}</p>
        <p>普通的let变量count在界面上始终显示为0</p>
        <div className="btns">
          <button onClick={handleClick1}>btn+1</button>
        </div>
      </div>

      <div className="card">
        <p>{newCount}</p>
        <p>用state跟踪的newCount在改变时会触发页面重新渲染</p>
        <div className="btns">
          <button onClick={handleClick2}>btn+1普通</button>
          <button onClick={handleClick3}>btn+1函数式</button>
        </div>
      </div>
    </div>
  );
}

export default App;

// React 最早期（0.x ~ 0.13 时代）
// 那时 React 没有异步批处理（batched updates），setState 基本就是同步的

// React 引入批处理（0.14 / 15.x）
// React 为了提升性能，引入了 batched updates（批量更新）：
// 在一个事件回调中，多个 setState 会被合并处理，等到事件结束再统一渲染。
// 那么每次调用都会读取 同一个旧的 count 值，导致结果看起来像只加了 1
