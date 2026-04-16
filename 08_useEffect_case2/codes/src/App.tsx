import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { fetchSuggestions } from "./lib";

function App() {
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSelected, setIsSelected] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isSelected) {
      setIsSelected(false);
      return;
    }

    if (!keyword) {
      setSuggestions([]);
      return;
    }

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
    }, 500); // 防抖延迟

    return () => clearTimeout(timer);
  }, [keyword]);

  function handleSelect(suggest: string) {
    setIsSelected(true);
    setKeyword(suggest);
    setSuggestions([]);
  }

  return (
    <div className="mt-32 flex flex-col gap-4 w-96 mx-auto bg-gray-100 p-4 rounded-2xl">
      <div className="w-full flex gap-2">
        <input
          className="w-full p-2 border bg-white border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="enter keyword here..."
        />
        <button className="py-1 px-4 text-sm font-bold bg-green-500 text-white rounded-full cursor-pointer">Search</button>
      </div>

      {loading && <div>Loading...</div>}

      {error && <div className="text-red-500">{error}</div>}

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
}

export default App;
