import { pool, db } from "./index";
import { users, products, reviews } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminHash = await bcrypt.hash("admin123", 10);
  const [admin] = await db
    .insert(users)
    .values({
      name: "Админ",
      email: "jaagiierdene96@gmail.com",
      phone: "95009809",
      passwordHash: adminHash,
      role: "admin",
    })
    .onConflictDoNothing()
    .returning();

  // Create demo customers
  const customerHash = await bcrypt.hash("demo123", 10);
  const demoCustomers = [
    { name: "Сарантуяа", email: "sarantuya@demo.mn", phone: "99001122" },
    { name: "Болормаа", email: "bolormaa@demo.mn", phone: "99003344" },
    { name: "Нарантуяа", email: "narantuya@demo.mn", phone: "99005566" },
    { name: "Оюунчимэг", email: "oyuunchimeg@demo.mn", phone: "99007788" },
    { name: "Цэцэгмаа", email: "tsetsegmaa@demo.mn", phone: "99009900" },
  ];

  for (const c of demoCustomers) {
    await db
      .insert(users)
      .values({ ...c, passwordHash: customerHash, role: "customer" })
      .onConflictDoNothing();
  }

  // Seed products
  const productData = [
    {
      name: "Энгийн жирэмсэн зураг",
      slug: "engiin-jiremsen-zurag",
      description:
        "Таны ердийн зургийг AI технологиор жирэмсэн үеийн гоё зураг болгон хувиргана. Нүүр царай тод, эгц харсан зургаа илгээхэд л хангалттай. Мэргэжлийн засварлалт, 24 цагийн дотор хүлээн авна.",
      price: 5000,
      category: "Энгийн",
      images: ["/images/product1.jpg", "/images/sample-before.jpg", "/images/sample-after.jpg"],
      featured: true,
      tags: ["энгийн", "хямд", "түргэн"],
      rating: 48,
      reviewCount: 24,
    },
    {
      name: "Байгаль дэвсгэр зураг",
      slug: "baigal-devsgr-zurag",
      description:
        "Байгалийн гоё дэвсгэртэй жирэмсэн үеийн зураг. Цэцэрлэг, нуур, хээр талын дэвсгэр сонгох боломжтой. AI-аар мэргэжлийн түвшинд засварлана.",
      price: 5000,
      category: "Байгаль",
      images: ["/images/product2.jpg", "/images/product1.jpg"],
      featured: true,
      tags: ["байгаль", "гоё", "дэвсгэр"],
      rating: 50,
      reviewCount: 18,
    },
    {
      name: "Цэцгийн дэвсгэр зураг",
      slug: "tsetsgin-devsgr-zurag",
      description:
        "Цэцгийн дэвсгэртэй гоё жирэмсэн зураг. Сакура, лаванда, сарнай гэх мэт олон төрлийн цэцгийн дэвсгэрээс сонгоно уу.",
      price: 5000,
      category: "Цэцэг",
      images: ["/images/product3.jpg", "/images/product1.jpg"],
      featured: true,
      tags: ["цэцэг", "гоё", "ногоон"],
      rating: 49,
      reviewCount: 31,
    },
    {
      name: "Хосын жирэмсэн зураг",
      slug: "khosyn-jiremsen-zurag",
      description:
        "Хосоороо жирэмсэн үеийн зураг авахуулах. Хайртай хүнтэйгээ хамт дурсамжийн зураг. Хоёулангийнх нь зургийг илгээнэ үү.",
      price: 5000,
      category: "Хос",
      images: ["/images/product4.jpg", "/images/product2.jpg"],
      featured: true,
      tags: ["хос", "хайр", "дурсамж"],
      rating: 50,
      reviewCount: 15,
    },
    {
      name: "Студи зураг засвар",
      slug: "studi-zurag-zasvar",
      description:
        "Студийн мэргэжлийн гэрэлтүүлэгтэй жирэмсэн зураг. Гэрлийн тохиргоо, арын дэвсгэрийг бүрэн засварлана.",
      price: 5000,
      category: "Студи",
      images: ["/images/product1.jpg", "/images/product4.jpg"],
      featured: false,
      tags: ["студи", "мэргэжлийн", "гэрэл"],
      rating: 47,
      reviewCount: 12,
    },
    {
      name: "Нарны гэрэлд зураг",
      slug: "narny-gereld-zurag",
      description:
        "Нар шингэх үеийн гоё гэрэлд жирэмсэн зураг. Алтан өнгийн гэрэл, зөөлөн сүүдэр, мэргэжлийн засварлалт.",
      price: 5000,
      category: "Байгаль",
      images: ["/images/product2.jpg", "/images/product3.jpg"],
      featured: false,
      tags: ["нар", "алтан", "гэрэл"],
      rating: 49,
      reviewCount: 22,
    },
    {
      name: "Гэр бүлийн зураг",
      slug: "ger-buliin-zurag",
      description:
        "Гэр бүлийн бүх гишүүдтэй хамт жирэмсэн үеийн зураг. Хүүхэд, нөхөр бүгдийг нь оруулсан зураг.",
      price: 5000,
      category: "Гэр бүл",
      images: ["/images/product4.jpg", "/images/product1.jpg"],
      featured: true,
      tags: ["гэр бүл", "хүүхэд", "дурсамж"],
      rating: 48,
      reviewCount: 19,
    },
    {
      name: "Урлагийн зураг",
      slug: "urlagiin-zurag",
      description:
        "Урлагийн бүтээлч хэв маягаар жирэмсэн зураг. Зураг зурсан мэт, усан будаг, тосон будгийн хэв маяг.",
      price: 5000,
      category: "Урлаг",
      images: ["/images/product3.jpg", "/images/product2.jpg"],
      featured: false,
      tags: ["урлаг", "бүтээлч", "онцгой"],
      rating: 50,
      reviewCount: 8,
    },
  ];

  for (const p of productData) {
    await db.insert(products).values(p).onConflictDoNothing();
  }

  // Seed reviews
  const reviewData = [
    { productId: 1, userName: "Сарантуяа", rating: 5, comment: "Маш гоё болсон! Баярлалаа 🥰 Зургаа маш хурдан авсан." },
    { productId: 1, userName: "Болормаа", rating: 5, comment: "Гайхалтай! Жирэмсэн зургаа авахуулж чадаагүй байсан, энэ үйлчилгээг олсондоо баяртай." },
    { productId: 1, userName: "Нарантуяа", rating: 4, comment: "Сайн болсон, гэхдээ бага зэрэг засаад илгээвэл илүү сайн болно." },
    { productId: 2, userName: "Оюунчимэг", rating: 5, comment: "Байгалийн дэвсгэр дээр маш гоё харагдаж байна! Танд маш их баярлалаа." },
    { productId: 2, userName: "Цэцэгмаа", rating: 5, comment: "Нуурын дэвсгэр дээр маш сайхан болсон. Бүх найзууддаа санал болгоно!" },
    { productId: 3, userName: "Сарантуяа", rating: 5, comment: "Сакура цэцгийн дэвсгэр маш гоё! Бодсоноос ч илүү сайхан болсон." },
    { productId: 3, userName: "Болормаа", rating: 5, comment: "Цэцгийн дэвсгэр дээр үнэхээр гоё харагдаж байна. Маш их баярлалаа!" },
    { productId: 4, userName: "Нарантуяа", rating: 5, comment: "Нөхөртэйгөө хамт зураг авахуулсан, маш гоё болсон. Баярлалаа!" },
    { productId: 4, userName: "Оюунчимэг", rating: 4, comment: "Хосын зураг сайхан болсон, дахин захиалмаар байна." },
    { productId: 5, userName: "Цэцэгмаа", rating: 5, comment: "Студийн зураг маш мэргэжлийн түвшинд болсон!" },
    { productId: 6, userName: "Сарантуяа", rating: 5, comment: "Нарны гэрэлд авсан зураг маш сайхан, алтан өнгө гоё!" },
    { productId: 7, userName: "Болормаа", rating: 5, comment: "Гэр бүлийн зураг маш сайхан болсон, хүүхдүүдтэй хамт гоё!" },
    { productId: 8, userName: "Нарантуяа", rating: 5, comment: "Урлагийн хэв маягаар хийсэн зураг маш онцгой, гоё!" },
  ];

  for (const r of reviewData) {
    await db.insert(reviews).values(r).onConflictDoNothing();
  }

  console.log("✅ Seed complete!");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
