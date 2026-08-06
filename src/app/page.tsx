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
  rating: number;
  reviewCount: number;
}

interface Settings {
  photo_price: { value: string; label: string };
  delivery_time: { value: string; label: string };
  phone: { value: string; label: string };
  email: { value: string; label: string };
  location: { value: string; label: string };
  [key: string]: { value: string; label: string };
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    Promise.all([
      fetch("/api/products?featured=true").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ])
      .then(([productsData, settingsData]) => {
        setProducts(productsData);
        setSettings(settingsData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const price = settings?.photo_price?.value || "5000";
  const deliveryTime = settings?.delivery_time?.value || "24";
  const phone = settings?.phone?.value || "95009809";

  return (
    <StoreLayout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/hero-bg.jpg"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm mb-6 animate-fade-in">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              AI зураг засварлах үйлчилгээ
            </div>
            <h1
              className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-fade-in"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Жирэмсэн үеийн{" "}
              <span className="text-rose-400">нандин</span>{" "}
              дурсамж
            </h1>
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-8 animate-fade-in delay-200">
              Жирэмсэн үеийн зургүй эмэгтэйчүүдэд AI технологиор жирэмсэн үеийн гоё зураг бүтээж өгнө. Зургаа илгээхэд л хангалттай!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in delay-300">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-4 bg-rose-600 text-white rounded-full font-semibold text-lg hover:bg-rose-700 transition-all hover:shadow-xl hover:shadow-rose-500/30 hover:-translate-y-0.5"
              >
                Захиалга өгөх →
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-semibold text-lg hover:bg-white/20 transition-all border border-white/20"
              >
                Хэрхэн ажилладаг?
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-8 animate-fade-in delay-400">
              <div>
                <div className="text-3xl font-bold text-white">{parseInt(price).toLocaleString()}₮</div>
                <div className="text-white/60 text-sm">Нэг зураг</div>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div>
                <div className="text-3xl font-bold text-white">{deliveryTime} цаг</div>
                <div className="text-white/60 text-sm">Хүлээн авах</div>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div>
                <div className="text-3xl font-bold text-white">100+</div>
                <div className="text-white/60 text-sm">Сэтгэл ханамж</div>
              </div>
            </div>
          </div>
        </div>
      </section>

     {/* Before/After Slider */}
<section className="py-20 bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <div className="text-center mb-16">
      <span className="text-rose-600 font-semibold text-sm tracking-wider uppercase">
        Жишээ
      </span>

      <h2
        className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-3"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Өмнө ба Дараа
      </h2>

      <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-lg">
        AI технологи ашиглан таны зургийг жирэмсний үеийн гоё зураг болгон хувиргана
      </p>
    </div>


   <div
  ref={containerRef}
  onMouseMove={handleMove}
  className="relative max-w-4xl mx-auto overflow-hidden rounded-3xl shadow-xl cursor-ew-resize"
  >   
      {/* After зураг */}
      <img
        src="/sample-after.jpg"
        alt="Дараа"
        className="w-full h-80 object-cover"
      />


      {/* Before зураг */}
      <div
        className="absolute top-0 left-0 h-full overflow-hidden"
        style={{ width: `${slider}%" }}
      >
        <img
          src="/sample-before.jpg"
          alt="Өмнө"
          className="h-96 w-full object-cover"
          style={{ maxWidth: "none" }}
        />
      </div>


      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 left-1/2 w-1 bg-white shadow-lg"
      >
        <div className="absolute top-1/2 -translate-y-1/2 -left-5 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
          ↔
        </div>
      </div>


      <div className="absolute bottom-5 left-5 bg-gray-900/80 text-white px-4 py-2 rounded-full">
        📸 Өмнө
      </div>

      <div className="absolute bottom-5 right-5 bg-rose-600/90 text-white px-4 py-2 rounded-full">
        ✨ Дараа
      </div>

    </div>

  </div>
</section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-rose-600 font-semibold text-sm tracking-wider uppercase">Алхамууд</span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Хэрхэн ажилладаг
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                emoji: "📸",
                title: "Зургаа илгээх",
                description: "Нүүр царай тод, эгц харсан, сүүдэр эффектгүй зургаа илгээнэ үү",
              },
              {
                step: "02",
                emoji: "🤖",
                title: "AI засварлалт",
                description: "Бид AI технологи ашиглан таны зургийг жирэмсэн болгож засварлана",
              },
              {
                step: "03",
                emoji: "💝",
                title: "Зураг хүлээн авах",
                description: `Засварласан гоё зургаа ${deliveryTime} цагийн дотор хүлээн авна`,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="relative p-8 bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="text-5xl mb-4">{item.emoji}</div>
                <div className="text-rose-300 text-6xl font-bold absolute top-4 right-6 opacity-20 group-hover:opacity-30 transition-opacity">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-16 bg-rose-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              ⚠️ Зураг илгээхдээ анхаарах зүйлс
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { emoji: "👤", text: "Нүүр царай тод байх" },
              { emoji: "👁️", text: "Эгц харсан байх" },
              { emoji: "🌑", text: "Сүүдэргүй байх" },
              { emoji: "✨", text: "Эффектгүй байх" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-5 bg-white/10 backdrop-blur-sm rounded-2xl text-white"
              >
                <span className="text-3xl">{item.emoji}</span>
                <span className="font-semibold">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-rose-600 font-semibold text-sm tracking-wider uppercase">Онцлох</span>
              <h2
                className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Онцлох бүтээгдэхүүн
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-2 text-rose-600 font-semibold hover:text-rose-700 transition-colors"
            >
              Бүгдийг үзэх →
            </Link>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-3xl overflow-hidden">
                  <div className="skeleton h-64 w-full" />
                  <div className="p-5 space-y-3">
                    <div className="skeleton h-5 w-3/4 rounded" />
                    <div className="skeleton h-4 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 8).map((product, idx) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <Link href={`/products/${product.slug}`} className="block relative overflow-hidden">
                    <img
                      src={product.images[0] || "/images/product1.jpg"}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-rose-600">
                      {product.category}
                    </div>
                  </Link>
                  <div className="p-5">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-bold text-gray-900 group-hover:text-rose-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-sm">
                          {star <= Math.round((product.rating || 0) / 10) ? "⭐" : "☆"}
                        </span>
                      ))}
                      <span className="text-gray-400 text-xs ml-1">({product.reviewCount})</span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xl font-bold text-rose-600">
                        {product.price.toLocaleString()}₮
                      </span>
                      <button
                        onClick={() =>
                          addItem({
                            productId: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.images[0] || "/images/product1.jpg",
                          })
                        }
                        className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10 sm:hidden">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-full font-semibold hover:bg-rose-700 transition-colors"
            >
              Бүгдийг үзэх →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-rose-600 via-pink-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Жирэмсэн үеийн гоё зургаа<br />одоо захиалаарай!
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
            Нэг зураг ердөө {parseInt(price).toLocaleString()}₮. Зургаа илгээхэд л хангалттай. {deliveryTime} цагийн дотор хүлээн аваарай.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="px-8 py-4 bg-white text-rose-600 rounded-full font-bold text-lg hover:bg-gray-50 transition-all hover:shadow-xl"
            >
              Захиалга өгөх
            </Link>
            <Link
              href="/install"
              className="px-8 py-4 bg-white/10 text-white rounded-full font-bold text-lg hover:bg-white/20 transition-all border border-white/20 flex items-center justify-center gap-2"
            >
              📱 Апп татах (Android)
            </Link>
          </div>
          <div className="mt-6">
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm"
            >
              📞 {phone}
            </a>
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}
