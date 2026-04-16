import Message from "./components/Message";
import { useState, useRef, useEffect } from "react";

export interface ChatMessage {
  id: number;
  message: string;
  sender: "user" | "bot";
}

export const replies: string[] = [
  "Interesting question!",
  "I'm not sure~",
  "What do you think?",
  "Haha, that's a tough one!",
  "Let me think...",
];

function App() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuestion(e.target.value);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (question) {
      setChatHistory((prev) => [
        ...prev,
        { id: prev.length + 1, message: question, sender: "user" },
        { id: prev.length + 2, message: replies[Math.floor(Math.random() * replies.length)], sender: "bot" },
      ]);
      setQuestion("");
    } else {
      return;
    }
  }

  // 本章节新增：使用 useRef 来创建一个 DOM 引用
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 当 chatHistory 更新时，滚动到底部
    // scrollIntoView 方法是原生 DOM API，用于将元素滚动到可见区域
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 在组件挂载时，自动聚焦输入框
    inputRef.current?.focus();
  }, []);

  const buttonDisabled: boolean = !question.trim();

  return (
    <div className="max-w-lg w-full mx-auto h-screen rounded bg-gray-100 flex flex-col gap-4">
      {/* chat history */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-4">
        {chatHistory.map((chat) => (
          <Message key={chat.id} message={chat.message} sender={chat.sender} />
        ))}
        {/* 在这里定义一个"锚点" */}
        <div ref={bottomRef} />
      </div>

      {/* form */}
      <form onSubmit={handleSubmit} className="w-full flex gap-4 p-4">
        <input
          value={question}
          onChange={handleChange}
          ref={inputRef} // 将输入框与 inputRef 关联
          className="flex-1 border border-gray-400 bg-white rounded px-2 py-1"
        />
        <button
          type="submit"
          disabled={buttonDisabled}
          className={`px-2 py-1 rounded-full text-white cursor-pointer ${buttonDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default App;
