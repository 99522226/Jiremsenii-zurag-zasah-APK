import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { chatSessions, chatMessages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// Auto-reply bot responses
const BOT_RESPONSES: { keywords: string[]; response: string }[] = [
  {
    keywords: ["сайн байна уу", "сайн уу", "hello", "hi", "привет"],
    response: "Сайн байна уу! 👋 Би автомат туслах бот. Танд хэрхэн туслах вэ?\n\n📸 Зураг засварлах үйлчилгээ\n💰 Үнийн мэдээлэл\n📞 Холбоо барих\n❓ Асуулт",
  },
  {
    keywords: ["үнэ", "хэд", "price", "төлбөр", "зардал"],
    response: "💰 **Үнийн мэдээлэл:**\n\nНэг зургийн үнэ: **5,000₮**\n\n✅ AI технологиор засварлалт\n✅ 24 цагийн дотор бэлэн\n✅ Чанарын баталгаа\n\nЗахиалга өгөхийг хүсвэл /products хуудас руу орно уу!",
  },
  {
    keywords: ["хэрхэн", "яаж", "how", "захиалга", "order"],
    response: "📝 **Захиалга өгөх заавар:**\n\n1️⃣ Бүтээгдэхүүн сонгох\n2️⃣ Сагсанд нэмэх\n3️⃣ Мэдээллээ бөглөх\n4️⃣ Зургаа оруулах\n5️⃣ Төлбөр төлөх\n6️⃣ 24 цагт бэлэн!\n\n⚠️ Зураг: Нүүр тод, эгц харсан, сүүдэргүй байх",
  },
  {
    keywords: ["зураг", "photo", "шаардлага", "requirement"],
    response: "📸 **Зургийн шаардлага:**\n\n✅ Нүүр царай тод байх\n✅ Эгц харсан байх\n✅ Сүүдэргүй байх\n✅ Эффектгүй байх\n\n❌ Бүдэг зураг\n❌ Хажуу харсан\n❌ Фильтр хэрэглэсэн",
  },
  {
    keywords: ["холбоо", "contact", "утас", "phone", "email", "имэйл"],
    response: "📞 **Холбоо барих:**\n\n📱 Утас: 85525385\n📧 Email: jaagiierdene96@gmail.com\n📍 Байршил: Дорноговь, Сайншанд\n\n🕐 Ажлын цаг: Даваа-Баасан 09:00-18:00",
  },
  {
    keywords: ["хугацаа", "хэдэн", "delivery", "time", "өдөр"],
    response: "⏰ **Хүргэлтийн хугацаа:**\n\n📦 Ердийн: 24 цагийн дотор\n⚡ Яаралтай: 12 цагийн дотор (нэмэлт төлбөртэй)\n\nТөлбөр хийгдсэний дараа эхэлнэ.",
  },
  {
    keywords: ["төлбөр", "payment", "банк", "qpay", "данс"],
    response: "💳 **Төлбөрийн сонголт:**\n\n🏦 Банкны шилжүүлэг\n📱 QPay\n💰 SocialPay\n💵 Бэлнээр\n\n🏦 Хаан банк: 5064788284\n👤 Эрдэнэ Түвшинжаргал",
  },
  {
    keywords: ["баярлалаа", "thank", "thanks", "рахмат"],
    response: "Зүгээр дээ! 😊 Танд туслахдаа баяртай байлаа.\n\nӨөр асуулт байвал бичээрэй. 💬",
  },
  {
    keywords: ["байршил", "хаана", "location", "address", "хаяг"],
    response: "📍 **Байршил:**\n\nДорноговь аймаг, Сайншанд сум\nМонгол улс\n\n🗺️ Бид онлайн үйлчилгээ үзүүлдэг тул хаанаас ч захиалга өгөх боломжтой!",
  },
  {
    keywords: ["буцаалт", "refund", "буцаах", "cancel"],
    response: "↩️ **Буцаалтын бодлого:**\n\n✅ Зураг чанарын шаардлага хангаагүй бол үнэгүй дахин засна\n✅ Ажил эхлээгүй бол 100% буцаалт\n⚠️ Ажил дууссан бол буцаалт хийгдэхгүй\n\nАсуудал гарвал: 95009809",
  },
];

function getBotResponse(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  for (const item of BOT_RESPONSES) {
    for (const keyword of item.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return item.response;
      }
    }
  }
  
  return null;
}

function getDefaultBotResponse(): string {
  return "🤔 Уучлаарай, таны асуултыг ойлгосонгүй.\n\nДараах сэдвүүдээр асууна уу:\n• Үнэ\n• Захиалга\n• Зургийн шаардлага\n• Холбоо барих\n• Хугацаа\n• Төлбөр\n\nЭсвэл 📞 95009809 руу залгана уу!";
}

// Get chat history
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("sessionId");
    const all = url.searchParams.get("all");

    // Admin: get all sessions
    if (all === "true") {
      const sessions = await db
        .select()
        .from(chatSessions)
        .orderBy(desc(chatSessions.updatedAt));
      
      return NextResponse.json(sessions);
    }

    // Get messages for specific session
    if (sessionId) {
      const messages = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId))
        .orderBy(chatMessages.createdAt);
      
      return NextResponse.json(messages);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error("Chat GET error:", error);
    return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
  }
}

// Send message
export async function POST(req: NextRequest) {
  try {
    const { sessionId, message, userName, userEmail, userPhone } = await req.json();

    if (!sessionId || !message) {
      return NextResponse.json({ error: "sessionId болон message шаардлагатай" }, { status: 400 });
    }

    // Check if session exists, create if not
    const [existingSession] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.sessionId, sessionId));

    if (!existingSession) {
      await db.insert(chatSessions).values({
        sessionId,
        userName: userName || null,
        userEmail: userEmail || null,
        userPhone: userPhone || null,
        status: "active",
      });
    } else {
      // Update session
      await db
        .update(chatSessions)
        .set({ 
          updatedAt: new Date(),
          userName: userName || existingSession.userName,
          userEmail: userEmail || existingSession.userEmail,
          userPhone: userPhone || existingSession.userPhone,
        })
        .where(eq(chatSessions.sessionId, sessionId));
    }

    // Save user message
    const [userMessage] = await db
      .insert(chatMessages)
      .values({
        sessionId,
        sender: "user",
        message,
        isBot: false,
      })
      .returning();

    // Generate bot response
    const botResponseText = getBotResponse(message) || getDefaultBotResponse();
    
    const [botMessage] = await db
      .insert(chatMessages)
      .values({
        sessionId,
        sender: "bot",
        message: botResponseText,
        isBot: true,
      })
      .returning();

    return NextResponse.json({
      userMessage,
      botMessage,
    });
  } catch (error) {
    console.error("Chat POST error:", error);
    return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
  }
}
