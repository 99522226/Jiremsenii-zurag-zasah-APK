"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import StoreLayout from "@/components/StoreLayout";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

 useEffect(() => {
  // Check if already installed
  const checkInstalled = () => {
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }
  };

  checkInstalled();

  // Android / Chrome / Edge install prompt
  const handler = (e: Event) => {
    e.preventDefault();

    setDeferredPrompt(e as BeforeInstallPromptEvent);
    setCanInstall(true);
  };

  window.addEventListener("beforeinstallprompt", handler);

  // App installed
  const installedHandler = () => {
    setIsInstalled(true);
    setCanInstall(false);
    setDeferredPrompt(null);
  };

  window.addEventListener("appinstalled", installedHandler);

  // Register service worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
  }

  return () => {
    window.removeEventListener("beforeinstallprompt", handler);
    window.removeEventListener("appinstalled", installedHandler);
  };
}, []);

const handleInstall = async () => {
  if (!deferredPrompt) {
    alert(
      "Таны браузер одоогоор шууд суулгах цонхыг дэмжихгүй байна. Chrome эсвэл Edge ашиглана уу."
    );
    return;
  }

  await deferredPrompt.prompt();

  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === "accepted") {
    setIsInstalled(true);
    setCanInstall(false);
  }

  setDeferredPrompt(null);
};

  return (
    <StoreLayout>
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-rose-600 via-pink-600 to-purple-700">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            📱 Апп суулгах
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Android утсандаа апп суулгаад хялбар ашиглаарай
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {isInstalled ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-xl">
              <span className="text-7xl block mb-6">✅</span>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Апп суугдсан!</h2>
              <p className="text-gray-600 text-lg mb-8">
                Та аль хэдийн аппыг суулгасан байна. Одоо ашиглах боломжтой!
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-rose-600 text-white rounded-full font-bold text-lg hover:bg-rose-700 transition-all"
              >
                Апп нээх →
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Install Button */}
              {canInstall && (
                <div className="bg-gradient-to-br from-rose-600 to-pink-600 rounded-3xl p-8 text-white text-center shadow-xl">
                  <span className="text-6xl block mb-4">📱</span>
                  <h2 className="text-2xl font-bold mb-4">Апп суулгах</h2>
                  <p className="text-white/80 mb-6">
                    Доорх товчийг дарж аппыг утсандаа суулгана уу
                  </p>
                  <button
                    onClick={handleInstall}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white text-rose-600 rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-lg"
                  >
                    ✨ Одоо суулгах
                  </button>
                </div>
              )}

              {/* Manual Instructions */}
              <div className="bg-white rounded-3xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                  📖 Суулгах заавар (Chrome)
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-rose-600">1</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Chrome хөтөч нээх</h3>
                      <p className="text-gray-600 text-sm">
                        Android утсан дээрээ Chrome хөтчийг нээнэ үү
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-rose-600">2</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Вэбсайт руу орох</h3>
                      <p className="text-gray-600 text-sm">
                        Хаягийн мөрөнд энэ вэбсайтын хаягийг оруулна
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-rose-600">3</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Меню товчийг дарах</h3>
                      <p className="text-gray-600 text-sm">
                        Баруун дээд буланд байх 3 цэгэн менюг дарна (⋮)
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-rose-600">4</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">"Add to Home screen" сонгох</h3>
                      <p className="text-gray-600 text-sm">
                        Менюгээс "Add to Home screen" эсвэл "Install app" сонголтыг дарна
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-rose-600">5</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Баталгаажуулах</h3>
                      <p className="text-gray-600 text-sm">
                        "Add" эсвэл "Install" товчийг дарж баталгаажуулна
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="bg-white rounded-3xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                  ✨ PWA-ийн давуу талууд
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { emoji: "⚡", title: "Хурдан", desc: "Натив апп шиг хурдан ажиллана" },
                    { emoji: "📴", title: "Оффлайн", desc: "Интернэтгүй үед ч ашиглах боломжтой" },
                    { emoji: "🔔", title: "Мэдэгдэл", desc: "Push мэдэгдэл хүлээн авах" },
                    { emoji: "🏠", title: "Home screen", desc: "Утасны home screen дээр байрлана" },
                    { emoji: "💾", title: "Хөнгөн", desc: "Бага зай эзэлнэ, хурдан суулгана" },
                    { emoji: "🔄", title: "Автомат шинэчлэл", desc: "Шинэчлэлүүд автоматаар ирнэ" },
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <span className="text-2xl">{feature.emoji}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{feature.title}</h3>
                        <p className="text-gray-600 text-xs mt-1">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Help */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8">
                <h3 className="font-bold text-gray-900 mb-4">❓ Тусламж хэрэгтэй юу?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Хэрэв апп суулгахад асуудал гарвал бидэнтэй холбогдоорой
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="tel:95009809"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors"
                  >
                    📞 95009809
                  </a>
                  <a
                    href="mailto:jaagiierdene96@gmail.com"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    📧 Имэйл бичих
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </StoreLayout>
  );
}
