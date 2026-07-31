"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { openCart, totalItems, items } = useCartStore();
  const { user, loadFromStorage } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadFromStorage();
    // Load cart from localStorage
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          useCartStore.setState({ items: parsed });
        }
      } catch {}
    }

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadFromStorage]);

  const count = mounted ? totalItems() : 0;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🤰</span>
            <span
              className={`text-lg sm:text-xl font-bold transition-colors ${
                scrolled ? "text-rose-600" : "text-white"
              }`}
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Жирэмсэн Зураг
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                scrolled ? "text-gray-700" : "text-white/90"
              }`}
            >
              Нүүр
            </Link>
            <Link
              href="/products"
              className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                scrolled ? "text-gray-700" : "text-white/90"
              }`}
            >
              Бүтээгдэхүүн
            </Link>
            <Link
              href="/how-it-works"
              className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                scrolled ? "text-gray-700" : "text-white/90"
              }`}
            >
              Хэрхэн ажилладаг
            </Link>
            <Link
              href="/tools"
              className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                scrolled ? "text-gray-700" : "text-white/90"
              }`}
            >
              AI Апп-ууд
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                scrolled ? "text-gray-700" : "text-white/90"
              }`}
            >
              Холбоо барих
            </Link>
            <Link
              href="/install"
              className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                scrolled ? "text-gray-700" : "text-white/90"
              }`}
            >
              📱 Апп татах
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openCart}
              className={`relative p-2 rounded-full transition-colors ${
                scrolled
                  ? "text-gray-700 hover:bg-gray-100"
                  : "text-white hover:bg-white/20"
              }`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>

            {mounted && user ? (
              <Link
                href={user.role === "admin" ? "/admin" : "/dashboard"}
                className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  scrolled
                    ? "bg-rose-600 text-white hover:bg-rose-700"
                    : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                }`}
              >
                <span>{user.role === "admin" ? "⚙️" : "👤"}</span>
                <span>{user.name}</span>
              </Link>
            ) : (
              <Link
                href="/auth"
                className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  scrolled
                    ? "bg-rose-600 text-white hover:bg-rose-700"
                    : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                }`}
              >
                Нэвтрэх
              </Link>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                scrolled ? "text-gray-700" : "text-white"
              }`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t shadow-lg animate-fade-in">
          <div className="px-4 py-4 space-y-2">
            {[
              { href: "/", label: "🏠 Нүүр" },
              { href: "/products", label: "🛍️ Бүтээгдэхүүн" },
              { href: "/how-it-works", label: "⚡ Хэрхэн ажилладаг" },
              { href: "/tools", label: "🤖 AI Апп-ууд" },
              { href: "/install", label: "📱 Апп татах" },
              { href: "/contact", label: "📞 Холбоо барих" },
              { href: user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/auth", label: user ? (user.role === "admin" ? "⚙️ Админ Панел" : "👤 Хяналтын самбар") : "🔐 Нэвтрэх" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-rose-50 hover:text-rose-600 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
