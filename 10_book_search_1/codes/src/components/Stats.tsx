interface StatsProps {
  total: number;
  avgPrice: number;
  totalValue: number;
  maxPrice: number;
}

export default function Stats({ total, avgPrice, totalValue, maxPrice }: StatsProps) {
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-1 px-6 py-3 bg-stone-900 border-b border-stone-700 text-sm shrink-0">
      <span className="text-stone-400">
        共 <strong className="text-stone-100">{total}</strong> 本
      </span>
      <span className="text-stone-400">
        均价 <strong className="text-amber-400">¥{avgPrice.toFixed(0)}</strong>
      </span>
      <span className="text-stone-400">
        总价值 <strong className="text-amber-400">¥{totalValue.toLocaleString()}</strong>
      </span>
      <span className="text-stone-400">
        最高 <strong className="text-amber-400">¥{maxPrice}</strong>
      </span>
    </div>
  );
}
