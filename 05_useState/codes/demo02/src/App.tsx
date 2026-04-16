import Message from "./components/Message";
import { useState } from "react";

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

const initHistory: ChatMessage[] = [
  { id: 1, message: "Hello!", sender: "user" },
  { id: 2, message: "Hello! How are you?", sender: "bot" },
  { id: 3, message: "Fine, thank you, and you?", sender: "user" },
  { id: 4, message: "I am good!", sender: "bot" },
];

function App() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(initHistory);
  // const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
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

  const buttonDisabled: boolean = !question.trim();

  return (
    <div className="max-w-lg w-full mx-auto h-screen rounded bg-gray-100 flex flex-col gap-4">
      {/* chat history */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-4">
        {chatHistory.map((chat) => (
          <Message key={chat.id} message={chat.message} sender={chat.sender} />
        ))}
      </div>

      {/* form */}
      <form onSubmit={handleSubmit} className="w-full flex gap-4 p-4">
        <input value={question} onChange={handleChange} className="flex-1 border border-gray-400 bg-white rounded px-2 py-1" />
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
