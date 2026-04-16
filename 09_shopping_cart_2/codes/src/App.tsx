import { CartProvider } from "./context/CartContext";
import Header from "./components/Header";
import Shop from "./components/Shop";

function App() {
  return (
    <CartProvider>
      <div className="bg-stone-950 min-h-screen">
        <Header />
        <Shop />
      </div>
    </CartProvider>
  );
}

export default App;
