import { useDispatch } from "react-redux";
import { addItem } from "../store/cartSlice";
import type { AppDispatch } from "../store/store";

interface ProductProps {
  id: string;
  image: string;
  title: string;
  price: number;
  description: string;
}

export default function Product({ id, image, title, price, description }: ProductProps) {
  const dispatch = useDispatch<AppDispatch>();

  return (
    <article className="flex flex-col bg-stone-800 rounded overflow-hidden hover:bg-stone-750 transition-colors h-full">
      <div className="aspect-2/3 overflow-hidden bg-stone-900">
        <img src={image} alt={title} className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="flex flex-col p-4 flex-1 gap-3">
        <h3 className="text-base font-semibold text-amber-300 leading-snug">{title}</h3>
        <p className="text-xs text-stone-400 leading-relaxed flex-1">{description}</p>
        <div className="flex items-center justify-between pt-2 border-t border-stone-700">
          <span className="text-stone-300 text-sm">¥{price.toFixed(2)}</span>
          <button
            onClick={() => dispatch(addItem(id))}
            className="bg-amber-700 hover:bg-amber-600 text-stone-100 py-1 px-3 rounded text-xs font-medium cursor-pointer tracking-wide"
          >
            加入购物车
          </button>
        </div>
      </div>
    </article>
  );
}
