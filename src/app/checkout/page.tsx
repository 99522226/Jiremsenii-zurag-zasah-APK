"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import StoreLayout from "@/components/StoreLayout";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";

interface Settings {
  [key: string]: { value: string; label: string };
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { user, loadFromStorage } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [uploadedPhoto, setUploadedPhoto] = useState<string>("");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [prompt, setPrompt] = useState<string>("");
  const [analyzingReference, setAnalyzingReference] = useState(false);
  const [settings, setSettings] = useState<Settings>({});

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    paymentMethod: "bank_transfer",
    notes: "",
  });

  useEffect(() => {
    setMounted(true);
    loadFromStorage();
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => {});
  }, [loadFromStorage]);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: user.phone || "",
      }));
    }
  }, [user]);

const handleFileUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  try {
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`${file.name} зураг upload хийхэд алдаа гарлаа`);
        continue;
      }

      setUploadedPhotos((prev) => [...prev, data.url]);
    }

    // Дараагийн код одоо uploadedPhotos-оос ажиллана
  } catch (err) {
    console.error(err);
    alert("Зураг upload хийхэд алдаа гарлаа");
  } finally {
    // Нэг input-оос дахин ижил зураг сонгох боломжтой болгоно
    e.target.value = "";
  }
};

  const analyzeReferenceImage = async () => {
  const referenceImage = items[0]?.image;

  if (!referenceImage) {
    alert("Каталогийн зураг олдсонгүй");
    return;
  }

  setAnalyzingReference(true);

  try {
    const res = await fetch("/api/analyze-reference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl: referenceImage,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Prompt үүсгэхэд алдаа гарлаа");
    }

    setPrompt(data.prompt);

    console.log("Generated prompt:", data.prompt);
  } catch (error) {
    console.error("Reference analysis error:", error);
    alert("Каталогийн зургийг боловсруулахад алдаа гарлаа");
  } finally {
    setAnalyzingReference(false);
  }
};
const handleSubmit = async () => {
  setSubmitting(true);

  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,

        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),

        totalAmount: totalPrice(),

        // Эхний зураг
        uploadedPhoto: uploadedPhotos[0] || uploadedPhoto || null,

        // Бүх зураг
        uploadedPhotos: uploadedPhotos,

        prompt: prompt || null,
      }),
    });

    if (res.ok) {
      const order = await res.json();

      setOrderId(order.id);
      setOrderComplete(true);
      clearCart();
    } else {
      const errorData = await res.json().catch(() => null);
      console.error("Order create error:", errorData);

      alert("Захиалга үүсгэхэд алдаа гарлаа");
    }
  } catch (error) {
    console.error("Order submit error:", error);
    alert("Захиалга илгээхэд алдаа гарлаа");
  } finally {
    setSubmitting(false);
  }
};
  // Get settings values with defaults
  const phone = settings.phone?.value || "85525385";
  const email = settings.email?.value || "jaagiierdene96@gmail.com";
  const bankName = settings.bank_name?.value || "Хаан банк";
  const bankAccount = settings.bank_account?.value || "5000XXXXXXXX";
  const accountHolder = settings.account_holder?.value || "Эрдэнэ Түвшинжаргал ";
  const deliveryTime = settings.delivery_time?.value || "24";

  if (!mounted) return null;

  if (orderComplete) {
    return (
      <StoreLayout>
        <div className="pt-32 pb-20 min-h-screen bg-gray-50">
          <div className="max-w-xl mx-auto px-4 text-center">
            <div className="bg-white rounded-3xl p-10 shadow-xl animate-scale-in">
              <span className="text-7xl block mb-6">🎉</span>
              <h1
                className="text-3xl font-bold text-gray-900 mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Захиалга амжилттай!
              </h1>
              <p className="text-gray-500 mb-6">
                Захиалгын дугаар: <span className="font-bold text-rose-600">#{orderId}</span>
              </p>

              <div className="bg-rose-50 rounded-2xl p-6 text-left mb-8">
                <h3 className="font-bold text-rose-800 mb-3">📋 Дараагийн алхамууд:</h3>
                <ul className="space-y-2 text-rose-700 text-sm">
                  <li>1. Төлбөрөө шилжүүлнэ үү</li>
                  <li>2. Зургаа имэйлээр илгээнэ үү</li>
                  <li>3. {deliveryTime} цагийн дотор засварласан зургаа хүлээн авна</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 text-left mb-8">
                <h3 className="font-bold text-gray-800 mb-3">💳 Төлбөр шилжүүлэх:</h3>
                <p className="text-gray-600 text-sm">{bankName}: {bankAccount}</p>
                <p className="text-gray-600 text-sm">Нэр: {accountHolder}</p>
                <p className="text-gray-600 text-sm">Гүйлгээний утга: #{orderId}</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 text-left mb-8">
                <h3 className="font-bold text-gray-800 mb-3">📞 Холбоо барих:</h3>
                <p className="text-gray-600 text-sm">Утас: {phone}</p>
                <p className="text-gray-600 text-sm">Email: {email}</p>
              </div>

              <div className="flex gap-4 justify-center">
                <Link
                  href="/"
                  className="px-6 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors"
                >
                  Нүүр хуудас
                </Link>
                <Link
                  href="/dashboard"
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Миний захиалга
                </Link>
              </div>
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (items.length === 0) {
    return (
      <StoreLayout>
        <div className="pt-32 pb-20 min-h-screen bg-gray-50 text-center">
          <span className="text-6xl block mb-4">🛒</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Сагс хоосон байна</h1>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-full font-semibold hover:bg-rose-700 transition-colors"
          >
            Дэлгүүр үзэх →
          </Link>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="pt-24 sm:pt-28 pb-20 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1
            className="text-3xl font-bold text-gray-900 mb-8"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            🛒 Захиалга
          </h1>

          {/* Steps */}
          <div className="flex items-center justify-center gap-4 mb-10">
            {[
              { n: 1, label: "Мэдээлэл" },
              { n: 2, label: "Зураг оруулах" },
              { n: 3, label: "Баталгаажуулах" },
            ].map((s) => (
              <div key={s.n} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    step >= s.n ? "bg-rose-600 text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {s.n}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${step >= s.n ? "text-gray-900" : "text-gray-400"}`}>
                  {s.label}
                </span>
                {s.n < 3 && <div className={`w-8 sm:w-16 h-0.5 ${step > s.n ? "bg-rose-600" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {step === 1 && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm animate-fade-in">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">👤 Хэрэглэгчийн мэдээлэл</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Нэр *</label>
                      <input
                        type="text"
                        value={form.customerName}
                        onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                        placeholder="Таны нэр"
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Имэйл *</label>
                      <input
                        type="email"
                        value={form.customerEmail}
                        onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                        placeholder="email@example.com"
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Утасны дугаар *</label>
                      <input
                        type="tel"
                        value={form.customerPhone}
                        onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                        placeholder="99XXXXXX"
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Төлбөрийн хэлбэр</label>
                      <select
                        value={form.paymentMethod}
                        onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      >
                        <option value="bank_transfer">🏦 Банкны шилжүүлэг</option>
                        <option value="qpay">📱 QPay</option>
                        <option value="socialpay">💳 SocialPay</option>
                        <option value="cash">💵 Бэлнээр</option>
                      </select>
                    </div>
                    <button
                      onClick={() => {
                        if (form.customerName && form.customerEmail && form.customerPhone) {
                          setStep(2);
                        }
                      }}
                      disabled={!form.customerName || !form.customerEmail || !form.customerPhone}
                      className="w-full py-4 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Үргэлжлүүлэх →
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm animate-fade-in">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">📸 Зураг оруулах</h2>

                  <button
  type="button"
  onClick={analyzeReferenceImage}
  disabled={analyzingReference}
  className="mb-4 px-4 py-2 bg-purple-600 text-white rounded-xl"
>
  {analyzingReference
    ? "🤖 Prompt үүсгэж байна..."
    : "🤖 Каталогийн зурагт Prompt үүсгэх"}
</button>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <h3 className="font-bold text-amber-800 text-sm mb-2">⚠️ Зураг илгээхдээ анхаарах:</h3>
                    <ul className="space-y-1 text-amber-700 text-xs">
                      <li>✅ Нүүр, царай тод байх</li>
                      <li>✅ Эгц харсан байх</li>
                      <li>✅ Сүүдэргүй байх</li>
                      <li>✅ Эффектгүй байх</li>
                    </ul>
                  </div>

                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-rose-400 transition-colors">

  {uploadedPhotos.length > 0 ? (
    <div className="space-y-5">

      {/* Оруулсан зургууд */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {uploadedPhotos.map((photo, index) => (
          <div key={photo} className="relative">

            <img
              src={photo}
              alt={`Uploaded ${index + 1}`}
              className="w-full aspect-square object-cover rounded-xl"
            />

            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
              {index + 1}-р хүн
            </div>

            <button
              type="button"
              onClick={() => {
                setUploadedPhotos((prev) =>
                  prev.filter((_, i) => i !== index)
                );

                if (index === 0) {
                  setUploadedPhoto("");
                }
              }}
              className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              ×
            </button>

          </div>
        ))}
      </div>

      <p className="text-green-600 font-medium">
        ✅ {uploadedPhotos.length} зураг амжилттай оруулсан
      </p>

      {/* Дахин зураг нэмэх */}
      <label className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors cursor-pointer">

        <span>➕</span>
        Дахин зураг нэмэх

        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

      </label>

    </div>
  ) : (
    <div>
      <span className="text-5xl block mb-4">📷</span>

      <p className="text-gray-600 mb-4">
        Зургаа энд оруулна уу
      </p>

      <label className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors cursor-pointer">

        <span>📷</span>
        Зураг сонгох

        <input
  type="file"
  accept="image/*"
  multiple
  onChange={handleFileUpload}
  className="hidden"
/>

      </label>
    </div>
  )}

</div> 
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Нэмэлт тэмдэглэл</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Тусгай хүсэлт байвал энд бичнэ үү..."
                      rows={3}
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                      ← Буцах
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 py-4 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition-colors"
                    >
                      Үргэлжлүүлэх →
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm animate-fade-in">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">✅ Баталгаажуулах</h2>

                  <div className="space-y-4 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-700 text-sm mb-2">Хэрэглэгчийн мэдээлэл</h3>
                      <p className="text-gray-900">{form.customerName}</p>
                      <p className="text-gray-600 text-sm">{form.customerEmail}</p>
                      <p className="text-gray-600 text-sm">{form.customerPhone}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-700 text-sm mb-2">Төлбөрийн хэлбэр</h3>
                      <p className="text-gray-900">
                        {form.paymentMethod === "bank_transfer" && "🏦 Банкны шилжүүлэг"}
                        {form.paymentMethod === "qpay" && "📱 QPay"}
                        {form.paymentMethod === "socialpay" && "💳 SocialPay"}
                        {form.paymentMethod === "cash" && "💵 Бэлнээр"}
                      </p>
                    </div>

                    {uploadedPhoto && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="font-semibold text-gray-700 text-sm mb-2">Оруулсан зураг</h3>
                        <img src={uploadedPhoto} alt="" className="w-24 h-24 object-cover rounded-xl" />
                      </div>
                    )}

                    {form.notes && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="font-semibold text-gray-700 text-sm mb-2">Тэмдэглэл</h3>
                        <p className="text-gray-600 text-sm">{form.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                      ← Буцах
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 py-4 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50"
                    >
                      {submitting ? "Илгээж байна..." : "Захиалга батлах ✓"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-36">
                <h3 className="font-bold text-gray-900 mb-4">📦 Захиалгын хураангуй</h3>
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">x{item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {(item.price * item.quantity).toLocaleString()}₮
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-600">Нийт:</span>
                    <span className="text-2xl font-bold text-rose-600">
                      {totalPrice().toLocaleString()}₮
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
