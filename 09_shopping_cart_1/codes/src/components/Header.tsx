import { useState } from "react";
import type { CartItem } from "../data";
import Cart from "./Cart";

interface HeaderProps {
  cart: CartItem[];
  onUpdateCartItemQuantity: (id: string, amount: number) => void;
}

export default function Header({ cart, onUpdateCartItemQuantity }: HeaderProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      {isCartOpen && (
        <Cart
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          onUpdateCartItemQuantity={onUpdateCartItemQuantity}
        />
      )}

      <header className="flex justify-between items-center px-8 py-5 bg-stone-900 border-b border-stone-700">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-widest text-stone-100">秦晖著作</h1>
        </div>
        <button
          onClick={() => setIsCartOpen(true)}
          className="bg-amber-700 text-stone-100 px-4 py-2 rounded hover:bg-amber-600 cursor-pointer text-sm font-medium tracking-wide"
        >
          购物车 ({cartQuantity})
        </button>
      </header>
    </>
  );
}
