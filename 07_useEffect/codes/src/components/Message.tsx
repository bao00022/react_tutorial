import { CircleUserRound, Bot } from "lucide-react";

interface MessageProps {
  message: string;
  sender: "user" | "bot";
}

export default function Message({ message, sender }: MessageProps) {
  // 更清晰的条件类名组织
  const containerClass = `flex gap-4 items-center ${
    sender === "bot"
      ? "flex-row-reverse justify-end" // 机器人：图标在左，内容左对齐
      : "justify-end" // 用户：正常顺序，内容右对齐
  }`;

  return (
    <div className={containerClass}>
      <p className="bg-white py-2 px-4 rounded">{message}</p>

      {sender === "bot" ? <Bot className="text-blue-500" /> : <CircleUserRound className="text-green-500" />}
    </div>
  );
}
