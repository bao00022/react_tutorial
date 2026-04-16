import reactLogo from "../assets/react.svg";
import viteLogo from "/vite.svg";

export default function Logo() {
  return (
    <div className="flex gap-8 mb-8">
      <a href="https://vite.dev" target="_blank">
        <img src={viteLogo} className="w-16" alt="Vite logo" />
      </a>
      <a href="https://react.dev" target="_blank">
        <img src={reactLogo} className="w-16" alt="React logo" />
      </a>
    </div>
  );
}
