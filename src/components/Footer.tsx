"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🤰</span>
              <span className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                Жирэмсэн Зураг
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
              Жирэмсэн үеийн зургүй эмэгтэйчүүдэд AI технологиор жирэмсэн үеийн гоё зураг бүтээж өгөх үйлчилгээ. Нэг зураг ердөө 5,000₮.
            </p>
            <div className="flex gap-3">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors">
                <span>📘</span>
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors">
                <span>📷</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Холбоосууд</h3>
            <ul className="space-y-3">
              <li><Link href="/products" className="text-gray-400 hover:text-rose-400 transition-colors">Бүтээгдэхүүн</Link></li>
              <li><Link href="/how-it-works" className="text-gray-400 hover:text-rose-400 transition-colors">Хэрхэн ажилладаг</Link></li>
              <li><Link href="/tools" className="text-gray-400 hover:text-rose-400 transition-colors">AI Апп-ууд</Link></li>
              <li><Link href="/install" className="text-gray-400 hover:text-rose-400 transition-colors">📱 Апп татах</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-rose-400 transition-colors">Холбоо барих</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Холбоо барих</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center gap-2">
                <span>📞</span>
                <a href="tel:95009809" className="hover:text-rose-400 transition-colors">95009809</a>
              </li>
              <li className="flex items-center gap-2">
                <span>📧</span>
                <a href="mailto:jaagiierdene96@gmail.com" className="hover:text-rose-400 transition-colors text-sm">jaagiierdene96@gmail.com</a>
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span>
                <span>Дорноговь, Сайншанд</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Жирэмсэн Зураг. Бүх эрх хуулиар хамгаалагдсан.
        </div>
      </div>
    </footer>
  );
}
