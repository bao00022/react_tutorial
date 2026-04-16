import { createContext, useContext, useReducer } from "react";
import { MOCK_PRODUCTS, type CartItem } from "../data";

// --- Action 类型定义 ---

type CartAction =
  | { type: "ADD_ITEM"; id: string }
  | { type: "UPDATE_QUANTITY"; id: string; amount: number };

// --- Reducer ---

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "ADD_ITEM": {
      const updatedCart = state.map((prod) => ({ ...prod }));
      const index = updatedCart.findIndex((prod) => prod.item.id === action.id);
      if (index !== -1) {
        updatedCart[index].quantity += 1;
      } else {
        const product = MOCK_PRODUCTS.find((p) => p.id === action.id);
        if (product) updatedCart.push({ item: product, quantity: 1 });
      }
      return updatedCart;
    }
    case "UPDATE_QUANTITY": {
      const updatedCart = state.map((prod) => ({ ...prod }));
      const index = updatedCart.findIndex((prod) => prod.item.id === action.id);
      if (index !== -1) {
        updatedCart[index].quantity += action.amount;
        if (updatedCart[index].quantity <= 0) updatedCart.splice(index, 1);
      }
      return updatedCart;
    }
  }
}

// --- Context ---

interface CartContextType {
  cart: CartItem[];
  addItem: (id: string) => void;
  updateQuantity: (id: string, amount: number) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, []);

  function addItem(id: string) {
    dispatch({ type: "ADD_ITEM", id });
  }

  function updateQuantity(id: string, amount: number) {
    dispatch({ type: "UPDATE_QUANTITY", id, amount });
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
