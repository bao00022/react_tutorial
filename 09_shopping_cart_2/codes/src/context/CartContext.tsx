import { createContext, useContext, useState } from "react";
import { MOCK_PRODUCTS, type CartItem } from "../data";

interface CartContextType {
  cart: CartItem[];
  addItem: (id: string) => void;
  updateQuantity: (id: string, amount: number) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  function addItem(id: string) {
    setCart((prev) => {
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

  function updateQuantity(id: string, amount: number) {
    setCart((prev) => {
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
    <CartContext.Provider value={{ cart, addItem, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
