"use client";
import StoreLayout from "@/components/StoreLayout";

const AI_TOOLS = [
  {
    name: "LMarina.ai",
    emoji: "🎨",
    description: "AI зураг засварлах мэргэжлийн хэрэгсэл. Жирэмсэн зураг засварлахад маш тохиромжтой.",
    url: "https://lmarina.ai",
    features: ["Зураг засварлах", "AI portrait", "Background removal", "Photo enhancement"],
    color: "from-purple-500 to-indigo-600",
  },
  {
    name: "ChatGPT",
    emoji: "🤖",
    description: "OpenAI-ийн хиймэл оюун ухааны систем. Зураг үүсгэх, засварлах, зөвлөгөө авах.",
    url: "https://chat.openai.com",
    features: ["DALL-E зураг үүсгэх", "Зураг дүн шинжилгээ", "Зөвлөгөө", "Текст боловсруулах"],
    color: "from-green-500 to-emerald-600",
  },
  {
    name: "Google Gemini",
    emoji: "💎",
    description: "Google-ийн хамгийн хүчирхэг AI систем. Зураг засварлах, дүн шинжилгээ хийх.",
    url: "https://gemini.google.com",
    features: ["Зураг үүсгэх", "Зураг засварлах", "Multimodal AI", "Зураг шинжлэх"],
    color: "from-blue-500 to-cyan-600",
  },
  {
    name: "Midjourney",
    emoji: "🎭",
    description: "Зураг үүсгэх AI. Маш чанартай, урлаг шиг зураг бүтээнэ.",
    url: "https://midjourney.com",
    features: ["Art генерация", "Чанартай зураг", "Стиль сонгох", "Нарийн тохиргоо"],
    color: "from-rose-500 to-pink-600",
  },
  {
    name: "Canva AI",
    emoji: "🖼️",
    description: "Дизайн хийх, зураг засварлах онлайн хэрэгсэл. AI функцууд суулгасан.",
    url: "https://canva.com",
    features: ["Дизайн хийх", "Background устгах", "AI зураг", "Загвар сонгох"],
    color: "from-amber-500 to-orange-600",
  },
  {
    name: "Remove.bg",
    emoji: "✂️",
    description: "Зургийн ар дэвсгэрийг автоматаар устгах AI хэрэгсэл.",
    url: "https://remove.bg",
    features: ["Background устгах", "Автомат", "Хурдан", "Чанартай"],
    color: "from-teal-500 to-green-600",
  },
];

export default function ToolsPage() {
  return (
    <StoreLayout>
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-rose-600 via-pink-600 to-purple-700">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            🤖 AI Апп-ууд & Хэрэгслүүд
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Бидний ашигладаг AI зураг засварлах хэрэгслүүд
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {AI_TOOLS.map((tool, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className={`bg-gradient-to-r ${tool.color} p-6 text-white`}>
                  <span className="text-5xl block mb-3">{tool.emoji}</span>
                  <h3 className="text-xl font-bold">{tool.name}</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{tool.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {tool.features.map((feature, fIdx) => (
                      <span
                        key={fIdx}
                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-rose-600 font-semibold text-sm hover:text-rose-700 transition-colors"
                  >
                    Зочлох →
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl p-8 sm:p-12 text-white text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              AI-аар зураг засах хэрэггүй!
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Бид таны өмнөөс бүгдийг хийж өгнө. Зүгээр л зургаа илгээхэд л хангалттай. Нэг зураг ердөө 5,000₮.
            </p>
            <a
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-rose-600 rounded-full font-bold text-lg hover:bg-gray-50 transition-all"
            >
              Захиалга өгөх →
            </a>
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}
