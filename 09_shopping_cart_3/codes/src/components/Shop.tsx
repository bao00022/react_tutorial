import { MOCK_PRODUCTS, type Product } from "../data";
import ProductCard from "./Product";

export default function Shop() {
  return (
    <section className="px-8 py-8">
      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {MOCK_PRODUCTS.map((product: Product) => (
          <li key={product.id}>
            <ProductCard {...product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
