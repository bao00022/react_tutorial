import { useState, useMemo } from "react";
import { BOOKS } from "./data";
import Stats from "./components/Stats";
import BookCard from "./components/BookCard";

function App() {
  const [keyword, setKeyword] = useState("");
  const [memoText, setMemoText] = useState("");

  // useMemo：只在 keyword 变化时重新过滤
  const filteredBooks = useMemo(
    () => BOOKS.filter((b) => b.title.includes(keyword) || b.author.includes(keyword)),
    [keyword]
  );

  // useMemo：只在 filteredBooks 变化时重新计算统计数据
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

  return (
    <div className="h-screen bg-stone-950 flex flex-col">
      <header className="px-6 py-4 bg-stone-900 border-b border-stone-700 flex items-center gap-4 shrink-0">
        <h1 className="text-base font-semibold text-stone-100 shrink-0">图书检索台</h1>
        <input
          className="w-72 bg-stone-800 text-stone-100 border border-stone-600 rounded px-3 py-1.5 text-sm placeholder:text-stone-500 focus:outline-none focus:border-amber-600"
          placeholder="搜索书名或作者..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </header>

      <Stats total={stats.total} avgPrice={stats.avgPrice} totalValue={stats.totalValue} maxPrice={stats.maxPrice} />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>

        <aside className="w-72 shrink-0 border-l border-stone-700 p-4 flex flex-col gap-3">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">备忘录</p>
            <p className="text-xs text-stone-600 mt-1">在此输入内容，同时观察控制台</p>
          </div>
          <textarea
            className="flex-1 bg-stone-800 text-stone-300 text-sm border border-stone-700 rounded p-3 resize-none placeholder:text-stone-600 focus:outline-none focus:border-stone-600"
            placeholder="开始输入..."
            value={memoText}
            onChange={(e) => setMemoText(e.target.value)}
          />
        </aside>
      </div>
    </div>
  );
}

export default App;
