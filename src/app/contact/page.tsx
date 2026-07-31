"use client";
import StoreLayout from "@/components/StoreLayout";

export default function ContactPage() {
  return (
    <StoreLayout>
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-rose-600 via-pink-600 to-purple-700">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            📞 Холбоо барих
          </h1>
          <p className="text-white/80 text-lg">Бидэнтэй холбогдоод захиалгаа өгнө үү</p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Бидний мэдээлэл
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">📞</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Утасны дугаар</h3>
                      <a href="tel:95009809" className="text-rose-600 text-lg font-bold hover:underline">
                        95009809
                      </a>
                      <p className="text-gray-500 text-sm mt-1">Даваа - Баасан: 09:00 - 18:00</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">📧</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Имэйл хаяг</h3>
                      <a href="mailto:jaagiierdene96@gmail.com" className="text-rose-600 font-bold hover:underline">
                        jaagiierdene96@gmail.com
                      </a>
                      <p className="text-gray-500 text-sm mt-1">24 цагийн дотор хариу өгнө</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">📍</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Байршил</h3>
                      <p className="text-rose-600 font-bold">Дорноговь, Сайншанд</p>
                      <p className="text-gray-500 text-sm mt-1">Монгол улс</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl p-8 text-white">
                <h3 className="text-xl font-bold mb-4">🕐 Ажлын цагийн хуваарь</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/80">Даваа - Баасан</span>
                    <span className="font-semibold">09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Бямба</span>
                    <span className="font-semibold">10:00 - 16:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Ням</span>
                    <span className="font-semibold">Амрана</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                ❓ Түгээмэл асуултууд
              </h2>

              <div className="space-y-6">
                {[
                  {
                    q: "Хэрхэн захиалга өгөх вэ?",
                    a: "Бүтээгдэхүүн сонгоод, сагсанд нэмж, захиалгын маягт бөглөнө үү. Зургаа оруулахаа мартузай.",
                  },
                  {
                    q: "Зураг ямар шаардлагатай вэ?",
                    a: "Нүүр царай тод, эгц харсан, сүүдэр ба эффектгүй зураг байх ёстой.",
                  },
                  {
                    q: "Хэдэн хоногт бэлэн болох вэ?",
                    a: "Ихэвчлэн 24 цагийн дотор бэлэн болно. Ачаалалтай үед 48 цаг хүртэл болно.",
                  },
                  {
                    q: "Нэг зургийн үнэ хэд вэ?",
                    a: "Нэг зургийн үнэ 5,000₮. Олон зураг захиалахад хөнгөлөлттэй.",
                  },
                  {
                    q: "Засварласан зургаа хэрхэн авах вэ?",
                    a: "Имэйлээр эсвэл хяналтын самбараар дамжуулан засварласан зургаа хүлээн авна.",
                  },
                  {
                    q: "Дахин засуулах боломжтой юу?",
                    a: "Тийм, нэг удаа үнэгүй дахин засуулах боломжтой.",
                  },
                ].map((faq, idx) => (
                  <div key={idx} className="border-b border-gray-100 pb-4 last:border-0">
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}
