"use client";
import Link from "next/link";
import StoreLayout from "@/components/StoreLayout";

export default function HowItWorksPage() {
  return (
    <StoreLayout>
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-rose-600 via-pink-600 to-purple-700">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            ⚡ Хэрхэн ажилладаг
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            AI технологи ашиглан жирэмсэн үеийн зураг бүтээх энгийн процесс
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {[
              {
                step: 1,
                emoji: "📸",
                title: "Зургаа бэлдэх",
                description: "Нүүр царайгаа тод, эгц харсан, сүүдэр ба эффектгүй зургаа бэлдэнэ үү. Чанартай зураг байх тусам үр дүн сайн гарна.",
                tips: [
                  "Гэрэлтэй газар зураг авах",
                  "Камер руу шууд харах",
                  "Нүүр царай бүрэн харагдах",
                  "Шүүлтүүр, эффект ашиглахгүй",
                ],
              },
              {
                step: 2,
                emoji: "🛒",
                title: "Захиалга өгөх",
                description: "Хүссэн бүтээгдэхүүнээ сонгоод сагсанд нэмнэ үү. Захиалгын маягтыг бөглөж, зургаа оруулна уу.",
                tips: [
                  "Бүтээгдэхүүн сонгох",
                  "Сагсанд нэмэх",
                  "Мэдээллээ оруулах",
                  "Зургаа байршуулах",
                ],
              },
              {
                step: 3,
                emoji: "💳",
                title: "Төлбөр төлөх",
                description: "Банкны шилжүүлэг, QPay, SocialPay эсвэл бэлнээр төлбөрөө хийнэ үү.",
                tips: [
                  "Банкны шилжүүлэг",
                  "QPay",
                  "SocialPay",
                  "Бэлнээр",
                ],
              },
              {
                step: 4,
                emoji: "🤖",
                title: "AI засварлалт",
                description: "Бид AI технологи (LMarina.ai, ChatGPT, Google Gemini) ашиглан таны зургийг мэргэжлийн түвшинд жирэмсэн болгон засварлана.",
                tips: [
                  "LMarina.ai ашиглан засварлах",
                  "ChatGPT оюун ухаан",
                  "Google Gemini AI",
                  "Мэргэжлийн засварлалт",
                ],
              },
              {
                step: 5,
                emoji: "💝",
                title: "Зураг хүлээн авах",
                description: "Засварласан гоё зургаа имэйлээр эсвэл хяналтын самбараар дамжуулан 24 цагийн дотор хүлээн авна.",
                tips: [
                  "Имэйлээр хүлээн авах",
                  "Хяналтын самбараас татах",
                  "24 цагийн дотор",
                  "Үнэгүй дахин засварлалт",
                ],
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-lg shadow-rose-200">
                    <span className="text-4xl">{item.emoji}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-rose-300 text-sm font-bold">АЛХАМ {item.step}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">{item.description}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {item.tips.map((tip, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="w-1.5 h-1.5 bg-rose-400 rounded-full" />
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-3 px-8 py-4 bg-rose-600 text-white rounded-full font-bold text-lg hover:bg-rose-700 transition-all hover:shadow-xl hover:shadow-rose-200"
            >
              Одоо захиалга өгөх →
            </Link>
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}
