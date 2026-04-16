import { memo } from "react";
import type { Book } from "../data";

interface BookCardProps {
  book: Book;
  isFavorited: boolean;
  onFavorite: (id: string) => void;
}

function BookCard({ book, isFavorited, onFavorite }: BookCardProps) {
  console.log("BookCard rendered:", book.title);

  return (
    <div className="bg-stone-800 rounded p-3 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-stone-100 leading-snug">{book.title}</h3>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-amber-400 text-sm font-semibold">¥{book.price}</span>
          <button
            onClick={() => onFavorite(book.id)}
            className={`text-lg leading-none transition-colors ${
              isFavorited ? "text-amber-400" : "text-stone-600 hover:text-stone-400"
            }`}
            aria-label={isFavorited ? "取消收藏" : "收藏"}
          >
            {isFavorited ? "★" : "☆"}
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 text-xs text-stone-500">
        <span>{book.author}</span>
        <span>·</span>
        <span className="bg-stone-700 text-stone-400 px-1.5 py-0.5 rounded">{book.category}</span>
        <span>·</span>
        <span>{book.year}年</span>
      </div>
    </div>
  );
}

export default memo(BookCard);
