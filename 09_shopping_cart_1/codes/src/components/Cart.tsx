import type { CartItem } from "../data";

interface CartProps {
  cart: CartItem[];
  onClose: () => void;
  onUpdateCartItemQuantity: (id: string, amount: number) => void;
}

export default function Cart({ cart, onClose, onUpdateCartItemQuantity }: CartProps) {
  const totalPrice = cart.reduce((acc, prod) => acc + prod.item.price * prod.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black/70 z-10 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-stone-100 rounded-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-stone-200 border-b border-stone-300">
          <h2 className="text-base font-semibold text-stone-800 tracking-wide">购物车</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.length === 0 && <p className="text-stone-500 text-sm text-center py-8">购物车是空的</p>}

          {cart.length > 0 && (
            <ul className="flex flex-col gap-3">
              {cart.map((prod) => (
                <li key={prod.item.id} className="flex items-center gap-3 py-3 border-b border-stone-200 last:border-0">
                  <img src={prod.item.image} alt={prod.item.title} className="w-10 h-14 object-cover object-top rounded shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{prod.item.title}</p>
                    <p className="text-xs text-stone-500 mt-0.5">¥{prod.item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onUpdateCartItemQuantity(prod.item.id, -1)}
                      className="w-6 h-6 rounded bg-stone-300 hover:bg-stone-400 text-stone-700 font-bold text-sm cursor-pointer flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-sm font-medium text-stone-800">{prod.quantity}</span>
                    <button
                      onClick={() => onUpdateCartItemQuantity(prod.item.id, 1)}
                      className="w-6 h-6 rounded bg-stone-300 hover:bg-stone-400 text-stone-700 font-bold text-sm cursor-pointer flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-6 py-4 bg-stone-200 border-t border-stone-300 flex items-center justify-between">
          <p className="text-sm text-stone-700">
            合计：<strong className="text-stone-900">¥{totalPrice.toFixed(2)}</strong>
          </p>
          <button
            onClick={onClose}
            className="bg-amber-700 hover:bg-amber-600 text-stone-100 px-4 py-2 rounded text-sm font-medium cursor-pointer"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
