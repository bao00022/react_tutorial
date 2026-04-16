import { useState } from "react";
import Header from "./components/Header";
import Shop from "./components/Shop";
import { MOCK_PRODUCTS, type CartItem } from "./data";

function App() {
  const [shoppingCart, setShoppingCart] = useState<CartItem[]>([]);

  function handleAddItemToCart(id: string) {
    setShoppingCart((prev) => {
      const updatedCart = prev.map((prod) => ({ ...prod }));
      const index = updatedCart.findIndex((prod) => prod.item.id === id);
      if (index !== -1) {
        updatedCart[index].quantity += 1;
      } else {
        const product = MOCK_PRODUCTS.find((p) => p.id === id);
        if (product) {
          updatedCart.push({ item: product, quantity: 1 });
        }
      }
      return updatedCart;
    });
  }

  function handleUpdateCartItemQuantity(id: string, amount: number) {
    setShoppingCart((prev) => {
      const updatedCart = prev.map((prod) => ({ ...prod }));
      const index = updatedCart.findIndex((prod) => prod.item.id === id);
      if (index !== -1) {
        updatedCart[index].quantity += amount;
        if (updatedCart[index].quantity <= 0) {
          updatedCart.splice(index, 1);
        }
      }
      return updatedCart;
    });
  }

  return (
    <div className="bg-stone-950 min-h-screen">
      <Header
        cart={shoppingCart}
        onUpdateCartItemQuantity={handleUpdateCartItemQuantity}
      />
      <Shop onAddItemToCart={handleAddItemToCart} />
    </div>
  );
}

export default App;
