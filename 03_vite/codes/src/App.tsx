import Logo from "./components/Logo";

function App() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-green-200">
      <Logo />

      <p className="text-2xl text-stone-600 font-bold">My first Vite + React + TS + Tailwindcss project!</p>
    </div>
  );
}

export default App;
