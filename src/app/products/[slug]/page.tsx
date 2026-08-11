"use client";
import { useState, useEffect, use } from "react";
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

interface Review {
  id: number;
  productId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ userName: "", rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data.product);
        setReviews(data.reviews || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const submitReview = async () => {
    if (!reviewForm.userName || !reviewForm.comment || !product) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...reviewForm, productId: product.id }),
      });
      if (res.ok) {
        const newReview = await res.json();
        setReviews([newReview, ...reviews]);
        setReviewForm({ userName: "", rating: 5, comment: "" });
        setShowReviewForm(false);
      }
    } catch {}
    setSubmitting(false);
  };

  if (loading) {
    return (
      <StoreLayout>
        <div className="pt-32 pb-20 max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="skeleton h-96 rounded-3xl" />
            <div className="space-y-4">
              <div className="skeleton h-8 w-3/4 rounded" />
              <div className="skeleton h-6 w-1/4 rounded" />
              <div className="skeleton h-20 w-full rounded" />
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!product) {
    return (
      <StoreLayout>
        <div className="pt-32 pb-20 text-center">
          <span className="text-6xl block mb-4">😔</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Бүтээгдэхүүн олдсонгүй</h1>
          <Link href="/products" className="text-rose-600 font-semibold hover:underline">
            ← Буцах
          </Link>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="pt-24 sm:pt-28 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-rose-600 transition-colors">Нүүр</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-rose-600 transition-colors">Бүтээгдэхүүн</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div>
              <div className="relative overflow-hidden rounded-3xl bg-gray-100 mb-4">
                <img
                  src={product.images[selectedImage] || "/images/product1.jpg"}
                  alt={product.name}
                 className="w-full h-[400px] sm:h-[500px] object-contain bg-gray-50"
                />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all ${
                        selectedImage === idx
                          ? "ring-3 ring-rose-500 ring-offset-2"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >
                     <img src={img} alt="" className="w-full h-full object-contain bg-gray-50" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-sm font-medium mb-4">
                {product.category}
              </div>
              <h1
                className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-lg">
                      {star <= Math.round((product.rating || 0) / 10) ? "⭐" : "☆"}
                    </span>
                  ))}
                </div>
                <span className="text-gray-500">({reviews.length} сэтгэгдэл)</span>
              </div>

              <div className="text-4xl font-bold text-rose-600 mb-6">
                {product.price.toLocaleString()}₮
              </div>

              <p className="text-gray-600 leading-relaxed text-lg mb-8">{product.description}</p>

              {/* Important notes */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
                <h3 className="font-bold text-amber-800 mb-3">⚠️ Зураг илгээхдээ анхаарах:</h3>
                <ul className="space-y-2 text-amber-700 text-sm">
                  <li className="flex items-center gap-2">✅ Нүүр, царай тод байх</li>
                  <li className="flex items-center gap-2">✅ Эгц харсан байх</li>
                  <li className="flex items-center gap-2">✅ Сүүдэргүй байх</li>
                  <li className="flex items-center gap-2">✅ Эффектгүй байх</li>
                </ul>
              </div>

              <button
                onClick={() =>
                  addItem({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.images[0] || "/images/product1.jpg",
                   prompt: "",
                  })
                }
                className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold text-lg hover:bg-rose-700 transition-all hover:shadow-xl hover:shadow-rose-200 flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Сагсанд нэмэх — {product.price.toLocaleString()}₮
              </button>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-2xl block mb-1">🤖</span>
                  <span className="text-xs text-gray-600 font-medium">AI засварлалт</span>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-2xl block mb-1">⏰</span>
                  <span className="text-xs text-gray-600 font-medium">24 цагт бэлэн</span>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-2xl block mb-1">💯</span>
                  <span className="text-xs text-gray-600 font-medium">Чанарын баталгаа</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-16 border-t pt-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                💬 Сэтгэгдлүүд ({reviews.length})
              </h2>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-5 py-2 bg-rose-50 text-rose-600 rounded-xl font-medium hover:bg-rose-100 transition-colors"
              >
                ✍️ Сэтгэгдэл бичих
              </button>
            </div>

            {showReviewForm && (
              <div className="bg-gray-50 rounded-2xl p-6 mb-8 animate-fade-in">
                <h3 className="font-bold text-gray-900 mb-4">Сэтгэгдэл бичих</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Таны нэр"
                    value={reviewForm.userName}
                    onChange={(e) => setReviewForm({ ...reviewForm, userName: e.target.value })}
                    className="w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Үнэлгээ</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className="text-2xl transition-transform hover:scale-125"
                        >
                          {star <= reviewForm.rating ? "⭐" : "☆"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    placeholder="Сэтгэгдлээ бичнэ үү..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                  <button
                    onClick={submitReview}
                    disabled={submitting || !reviewForm.userName || !reviewForm.comment}
                    className="px-6 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Илгээж байна..." : "Илгээх"}
                  </button>
                </div>
              </div>
            )}

            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <span className="text-4xl block mb-3">💬</span>
                <p className="text-gray-500">Сэтгэгдэл байхгүй байна. Эхлээд та бичээрэй!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-6 bg-gray-50 rounded-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 font-bold">
                          {review.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{review.userName}</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className="text-xs">
                                {star <= review.rating ? "⭐" : "☆"}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
