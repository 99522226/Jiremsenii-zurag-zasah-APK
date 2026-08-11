"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import StoreLayout from "@/components/StoreLayout";
import { useCartStore } from "@/store/cart";

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  featured: boolean;
  prompt?: string;
  rating: number;
  reviewCount: number;
}

const CATEGORIES = ["all", "Энгийн", "Байгаль", "Цэцэг", "Хос", "Студи", "Гэр бүл", "Урлаг"];
const SORT_OPTIONS = [
  { value: "newest", label: "Шинэ" },
  { value: "price_asc", label: "Үнэ: Бага → Их" },
  { value: "price_desc", label: "Үнэ: Их → Бага" },
  { value: "rating", label: "Үнэлгээ" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products?category=${category}&sort=${sort}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category, sort]);

  return (
    <StoreLayout>
      {/* Header */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-rose-600 via-pink-600 to-purple-700">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            🛍️ Бүтээгдэхүүнүүд
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            AI технологиор жирэмсэн үеийн зураг бүтээх. Нэг зураг 5,000₮
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b sticky top-16 sm:top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    category === cat
                      ? "bg-rose-600 text-white shadow-lg shadow-rose-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat === "all" ? "Бүгд" : cat}
                </button>
              ))}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2 bg-gray-100 rounded-xl text-sm text-gray-700 border-0 focus:ring-2 focus:ring-rose-500"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 bg-gray-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden">
                  <div className="skeleton h-64 w-full" />
                  <div className="p-5 space-y-3">
                    <div className="skeleton h-5 w-3/4 rounded" />
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-4 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl mb-4 block">🔍</span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Бүтээгдэхүүн олдсонгүй</h3>
              <p className="text-gray-500">Өөр ангилал сонгож үзнэ үү</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, idx) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <Link href={`/products/${product.slug}`} className="block relative overflow-hidden">
                    <img
                      src={product.images[0] || "/images/product1.jpg"}
                      alt={product.name}
                     className="w-full h-64 object-contain bg-gray-50 group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 bg-rose-600 text-white rounded-full text-xs font-bold">
                      {product.price.toLocaleString()}₮
                    </div>
                    <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700">
                      {product.category}
                    </div>
                  </Link>
                  <div className="p-5">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-rose-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-1 mt-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-sm">
                          {star <= Math.round((product.rating || 0) / 10) ? "⭐" : "☆"}
                        </span>
                      ))}
                      <span className="text-gray-400 text-xs ml-1">({product.reviewCount})</span>
                    </div>
                    <button
                      onClick={() =>
                        addItem({
                          productId: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.images[0] || "/images/product1.jpg",
                           prompt: product.prompt || "",
                        })
                      }
                      className="w-full mt-4 py-3 bg-rose-50 text-rose-600 rounded-2xl font-semibold hover:bg-rose-600 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Сагсанд нэмэх
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </StoreLayout>
  );
}
