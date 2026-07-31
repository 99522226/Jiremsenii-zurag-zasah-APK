"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StoreLayout from "@/components/StoreLayout";
import { useAuthStore } from "@/store/auth";

const LANGUAGES = [
  { code: "mn", name: "🇲🇳 Монгол", nativeName: "Монгол хэл" },
  { code: "en", name: "🇺🇸 English", nativeName: "English" },
  { code: "ru", name: "🇷🇺 Русский", nativeName: "Русский язык" },
  { code: "zh", name: "🇨🇳 中文", nativeName: "中文" },
  { code: "ko", name: "🇰🇷 한국어", nativeName: "한국어" },
  { code: "ja", name: "🇯🇵 日本語", nativeName: "日本語" },
];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    password: "",
    language: "mn" 
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin 
        ? { email: form.email, password: form.password } 
        : { 
            name: form.name, 
            email: form.email, 
            phone: form.phone, 
            password: form.password,
            language: form.language 
          };
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Алдаа гарлаа");
      } else {
        setAuth(data.user, data.token);
        router.push("/dashboard");
      }
    } catch {
      setError("Сервертэй холбогдож чадсангүй");
    }
    setLoading(false);
  };

  return (
    <StoreLayout>
      <div className="pt-32 pb-20 min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <span className="text-5xl block mb-4">🤰</span>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {isLogin ? "Нэвтрэх" : "Бүртгүүлэх"}
              </h1>
              <p className="text-gray-500 mt-2 text-sm">
                {isLogin ? "Тавтай морилно у|" : "Шинэ хаяг үүсгэх"}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 animate-fade-in">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Нэр</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Таны нэр"
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Утасны дугаар</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="99XXXXXX"
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🌐 Хэл / Language
                    </label>
                    <select
                      value={form.language}
                      onChange={(e) => setForm({ ...form, language: e.target.value })}
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name} — {lang.nativeName}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Интерфэйсийн хэлийг сонгоно уу
                    </p>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Имэйл</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Нууц үг</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Уншиж байна..." : isLogin ? "Нэвтрэх" : "Бүртгүүлэх"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-rose-600 font-medium text-sm hover:underline"
              >
                {isLogin ? "Шинэ хаяг үүсгэх →" : "← Нэвтрэх рүү буцах"}
              </button>
            </div>

            {isLogin && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl text-xs text-gray-500">
                <p className="font-medium mb-1">Жишээ хаяг:</p>
                <p>Админ: jaagiierdene96@gmail.com / admin123</p>
                <p>Хэрэглэгч: sarantuya@demo.mn / demo123</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
