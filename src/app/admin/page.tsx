"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  featured: boolean;
  prompt?: string;
  rating: number;
  reviewCount: number;
}

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{ productId: number; name: string; price: number; quantity: number }>;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  uploadedPhoto: string | null;
  prompt?: string;
  editedPhoto: string | null;
  notes: string | null;
  adminNotes: string | null;
  createdAt: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  language: string;
  role: string;
  createdAt: string;
}

const LANGUAGE_LABELS: Record<string, string> = {
  mn: "🇲🇳 Монгол",
  en: "🇺🇸 English",
  ru: "🇷🇺 Русский",
  zh: "🇨🇳 中文",
  ko: "🇰🇷 한국어",
  ja: "🇯🇵 日本語",
};

interface SettingsData {
  [key: string]: { value: string; label: string };
}

interface ChatSession {
  id: number;
  sessionId: string;
  userName: string | null;
  userEmail: string | null;
  userPhone: string | null;
  status: string;
  lastMessage: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  id: number;
  sessionId: string;
  sender: string;
  message: string;
  isBot: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const { user, loadFromStorage, logout } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "users" | "settings" | "chat">("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<SettingsData>({});
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Chat states
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [adminReply, setAdminReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Product form states
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
 const [productForm, setProductForm] = useState({
  name: "",
  slug: "",
  description: "",
  price: "5000",
  category: "Энгийн",
  images: "",
  featured: false,
  prompt: "",
});

  const [generatingPrompt, setGeneratingPrompt] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.push("/auth");
      return;
    }
    if (user.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    fetchData();
    fetchSettings();
  }, [mounted, user, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats?all=true");
      const data = await res.json();
      setStats(data.stats);
      setProducts(data.products || []);
      setOrders(data.orders || []);
      setUsers(data.users || []);
    } catch {}
    setLoading(false);
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings(data);
    } catch {}
  };

  const fetchChatSessions = async () => {
    try {
      const res = await fetch("/api/chat/admin");
      const data = await res.json();
      setChatSessions(data);
    } catch {}
  };

  const fetchChatMessages = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/chat/admin?sessionId=${sessionId}`);
      const data = await res.json();
      setChatMessages(data.messages || []);
    } catch {}
  };

  const sendAdminReply = async () => {
    if (!selectedChat || !adminReply.trim()) return;
    setSendingReply(true);
    try {
      const res = await fetch("/api/chat/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: selectedChat, message: adminReply }),
      });
      if (res.ok) {
        const newMsg = await res.json();
        setChatMessages((prev) => [...prev, newMsg]);
        setAdminReply("");
        fetchChatSessions();
      }
    } catch {}
    setSendingReply(false);
  };

  useEffect(() => {
    if (activeTab === "chat") {
      fetchChatSessions();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedChat) {
      fetchChatMessages(selectedChat);
    }
  }, [selectedChat]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleGeneratePrompt = async () => {
  if (!productForm.images.trim()) {
    alert("Эхлээд бүтээгдэхүүний зураг upload хийнэ үү.");
    return;
  }

  const imageUrl = productForm.images
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)[0];

  if (!imageUrl) {
    alert("Бүтээгдэхүүний зураг олдсонгүй.");
    return;
  }

  setGeneratingPrompt(true);

  try {
    const res = await fetch("/api/generate-prompt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Prompt үүсгэхэд алдаа гарлаа");
      return;
    }

    setProductForm((prev) => ({
      ...prev,
      prompt: data.prompt || "",
    }));
  } catch (error) {
    console.error("Generate prompt error:", error);
    alert("Prompt үүсгэхэд алдаа гарлаа");
  } finally {
    setGeneratingPrompt(false);
  }
};

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert("Товч дарагдлаа!");
    try {
      const endpoint = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products";
      const method = editingProduct ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...productForm,
          price: parseInt(productForm.price),
          images: productForm.images.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });

     if (res.ok) {
        setShowProductForm(false);
        setEditingProduct(null);
        setProductForm({
          name: "",
          slug: "",
          description: "",
          price: "5000",
          category: "Энгийн",
          images: "",
          featured: false,
           prompt: "",
        });
        fetchData();
      } else {
        const errText = await res.text();
        alert("Алдаа гарлаа: " + errText);
      }
    } catch (err) {
      alert("Алдаа гарлаа: " + String(err));
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Бүтээгдэхүүнийг устгах уу?")) return;
    try {
      await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      fetchData();
    } catch {}
  };

 const handleUpdateOrder = async (
  orderId: number,
  updates: Record<string, string>
) => {
  try {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) return;

    // Төлсөн эсвэл "Боловсруулж байна" үед AI зураг үүсгэнэ
if (
  updates.paymentStatus === "paid" ||
  updates.status === "processing"
) {
      const orderRes = await fetch(`/api/orders/${orderId}`);
      const order = await orderRes.json();

      if (order.uploadedPhoto && order.prompt) {
        const generateRes = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl: order.uploadedPhoto,
            prompt: order.prompt,
          }),
        });

        const generatedData = await generateRes.json();

        if (generateRes.ok && generatedData.url) {
          await fetch(`/api/orders/${orderId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              editedPhoto: generatedData.url,
            }),
          });
        } else {
          console.error(
            "AI зураг үүсгэхэд алдаа:",
            generatedData.error
          );
        }
      }
    }

    fetchData();
  } catch (error) {
    console.error("Order update error:", error);
  }
};

  const handleSettingChange = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: { ...prev[key], value },
    }));
    setSettingsSaved(false);
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
      }
    } catch {}
    setSavingSettings(false);
  };

  if (!mounted || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Уншиж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-purple-900 to-purple-800 shadow-xl transform transition-transform duration-300 lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-purple-700">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚙️</span>
              <span className="text-lg font-bold text-white">Админ Панел</span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {[
              { id: "dashboard", icon: "📊", label: "Хяналтын самбар" },
              { id: "chat", icon: "💬", label: "Чат харилцагч", badge: chatSessions.filter(s => s.status === "active").length },
              { id: "settings", icon: "💰", label: "Үнэ & Тохиргоо" },
              { id: "products", icon: "🛍️", label: "Бүтээгдэхүүн" },
              { id: "orders", icon: "📦", label: "Захиалгууд" },
              { id: "users", icon: "👥", label: "Хэрэглэгчид" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-white/20 text-white"
                    : "text-purple-200 hover:bg-white/10"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span>{item.icon}</span>
                  {item.label}
                </span>
                {"badge" in item && typeof item.badge === "number" && item.badge > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-purple-700">
            <Link
              href="/"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-purple-200 hover:bg-white/10 transition-colors mb-2"
            >
              <span>🏠</span> Нүүр хуудас
            </Link>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-white/10 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition-colors"
            >
              Гарах
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {activeTab === "dashboard" && "📊 Хяналтын самбар"}
              {activeTab === "chat" && "💬 Чат харилцагч"}
              {activeTab === "settings" && "💰 Үнэ & Тохиргоо"}
              {activeTab === "products" && "🛍️ Бүтээгдэхүүн удирдах"}
              {activeTab === "orders" && "📦 Захиалгууд"}
              {activeTab === "users" && "👥 Хэрэглэгчид"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
              Админ
            </span>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-fade-in">
              {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-6">
                      <div className="skeleton h-8 w-16 rounded mb-2" />
                      <div className="skeleton h-6 w-1/2 rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Current Price Banner */}
                  <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-white/80 mb-1">Одоогийн үнэ</h3>
                        <p className="text-4xl font-bold">{parseInt(settings.photo_price?.value || "5000").toLocaleString()}₮</p>
                        <p className="text-white/70 text-sm mt-1">Нэг зургийн үнэ</p>
                      </div>
                      <button
                        onClick={() => setActiveTab("settings")}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-medium text-sm transition-colors"
                      >
                        Өөрчлөх →
                      </button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">📦</span>
                        <span className="text-xs text-green-600 font-semibold">+12%</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
                      <p className="text-gray-500 text-sm">Нийт захиалга</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">💰</span>
                        <span className="text-xs text-green-600 font-semibold">+8%</span>
                      </div>
                      <p className="text-3xl font-bold text-green-600">
                        {(stats?.revenue || 0).toLocaleString()}₮
                      </p>
                      <p className="text-gray-500 text-sm">Нийт орлого</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">🛍️</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
                      <p className="text-gray-500 text-sm">Бүтээгдэхүүн</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">👥</span>
                        <span className="text-xs text-blue-600 font-semibold">+5</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                      <p className="text-gray-500 text-sm">Хэрэглэгчид</p>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-4">📊 Захиалгын статистик</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">⏳ Хүлээгдэж буй</span>
                          <span className="font-bold text-yellow-600">{stats?.pendingOrders || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">🔄 Боловсруулж буй</span>
                          <span className="font-bold text-blue-600">{stats?.processingOrders || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">✅ Дууссан</span>
                          <span className="font-bold text-green-600">{stats?.completedOrders || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-4">💳 Төлбөрийн статистик</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">💵 Төлөгдсөн</span>
                          <span className="font-bold text-green-600">
                            {(stats?.revenue || 0).toLocaleString()}₮
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">⏳ Хүлээгдэж буй</span>
                          <span className="font-bold text-yellow-600">
                            {(stats?.pendingRevenue || 0).toLocaleString()}₮
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-fade-in">
              {settingsSaved && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <span>✅</span> Тохиргоо амжилттай хадгалагдлаа!
                </div>
              )}

              {/* Price Settings */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>💰</span> Үнийн тохиргоо
                </h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Нэг зургийн үнэ (₮)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={settings.photo_price?.value || "5000"}
                        onChange={(e) => handleSettingChange("photo_price", e.target.value)}
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 text-2xl font-bold text-rose-600"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">₮</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Нүүр хуудас болон бүх хуудсанд харагдана</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Хүргэлтийн хугацаа (цаг)
                    </label>
                    <input
                      type="number"
                      value={settings.delivery_time?.value || "24"}
                      onChange={(e) => handleSettingChange("delivery_time", e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
              {/* Price Settings */}
<div className="bg-white rounded-2xl p-6 shadow-sm">
  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
    <span>💰</span> Үнийн тохиргоо
  </h3>

  <div className="grid sm:grid-cols-2 gap-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Нэг зургийн үнэ (₮)
      </label>

      <div className="relative">
        <input
          type="number"
          value={settings.photo_price?.value || "5000"}
          onChange={(e) =>
            handleSettingChange("photo_price", e.target.value)
          }
          className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 text-2xl font-bold text-rose-600"
        />

        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
          ₮
        </span>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Нүүр хуудас болон бүх хуудсанд харагдана
      </p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Хүргэлтийн хугацаа (цаг)
      </label>

      <input
        type="number"
        value={settings.delivery_time?.value || "24"}
        onChange={(e) =>
          handleSettingChange("delivery_time", e.target.value)
        }
        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500"
      />
    </div>
  </div>
</div>

{/* Before / After Image Settings */}
<div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
    <span>🖼️</span> Өмнөх ба дараах зураг
  </h3>

  <div className="grid sm:grid-cols-2 gap-6">

    {/* Өмнөх зураг */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Өмнөх зураг
      </label>

      <ImageUpload
        label="Өмнөх зураг upload хийх"
        value={settings.before_image?.value || ""}
        onChange={(url) =>
          handleSettingChange("before_image", url)
        }
      />

      {settings.before_image?.value && (
        <img
          src={settings.before_image.value}
          alt="Өмнөх зураг"
          className="mt-3 w-full h-48 object-cover rounded-xl"
        />
      )}
    </div>

    {/* Дараах зураг */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Дараах зураг
      </label>

      <ImageUpload
        label="Дараах зураг upload хийх"
        value={settings.after_image?.value || ""}
        onChange={(url) =>
          handleSettingChange("after_image", url)
        }
      />

      {settings.after_image?.value && (
        <img
          src={settings.after_image.value}
          alt="Дараах зураг"
          className="mt-3 w-full h-48 object-cover rounded-xl"
        />
      )}
    </div>

  </div>
</div>

              {/* Contact Settings */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>📞</span> Холбоо барих мэдээлэл
                </h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Утасны дугаар
                    </label>
                    <input
                      type="text"
                      value={settings.phone?.value || "85525385"}
                      onChange={(e) => handleSettingChange("phone", e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Имэйл хаяг
                    </label>
                    <input
                      type="email"
                      value={settings.email?.value || "jaagiierdene96@gmail.com"}
                      onChange={(e) => handleSettingChange("email", e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Байршил
                    </label>
                    <input
                      type="text"
                      value={settings.location?.value || "Дорноговь, Сайншанд"}
                      onChange={(e) => handleSettingChange("location", e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Settings */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>🏦</span> Банкны мэдээлэл
                </h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Банкны нэр
                    </label>
                    <input
                      type="text"
                      value={settings.bank_name?.value || "Хаан банк"}
                      onChange={(e) => handleSettingChange("bank_name", e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Дансны дугаар
                    </label>
                    <input
                      type="text"
                      value={settings.bank_account?.value || "5000XXXXXXXX"}
                      onChange={(e) => handleSettingChange("bank_account", e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Данс эзэмшигчийн нэр
                    </label>
                    <input
                      type="text"
                      value={settings.account_holder?.value || "Жаргал Эрдэнэ"}
                      onChange={(e) => handleSettingChange("account_holder", e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="px-8 py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {savingSettings ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Хадгалж байна...
                    </>
                  ) : (
                    <>
                      ✅ Тохиргоо хадгалах
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Products */}
          {activeTab === "products" && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Бүтээгдэхүүн</h2>
                <button
                  onClick={() => {
                    setShowProductForm(true);
                    setEditingProduct(null);
                    setProductForm({
                      name: "",
                      slug: "",
                      description: "",
                      price: settings.photo_price?.value || "5000",
                      category: "Энгийн",
                      images: "",
                      featured: false,
                      prompt: "",
                    });
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
                >
                  + Шинэ бүтээгдэхүүн
                </button>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-6">
                      <div className="skeleton h-6 w-1/3 rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{product.category}</p>
                          <p className="text-2xl font-bold text-purple-600 mt-2">
                            {product.price.toLocaleString()}₮
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setProductForm({
                                name: product.name,
                                slug: product.slug,
                                description: product.description,
                                price: product.price.toString(),
                                category: product.category,
                                images: product.images.join(", "),
                                featured: product.featured,
                                prompt: product.prompt || "",
                              });
                              setShowProductForm(true);
                            }}
                            className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                          >
                            Засах
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                          >
                            Устгах
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Product Form Modal */}
              {showProductForm && (
             <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
  <div className="bg-white rounded-2xl w-full max-w-[95vw] mx-auto my-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
                    <div className="p-6 border-b">
                      <h2 className="text-xl font-bold text-gray-900">
                        {editingProduct ? "Бүтээгдэхүүн засах" : "Шинэ бүтээгдэхүүн"}
                      </h2>
                    </div>
                    <form onSubmit={handleProductSubmit} className="p-6 space-y-4 overflow-x-hidden">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Нэр</label>
                        <input
                          type="text"
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                        <input
                          type="text"
                          value={productForm.slug}
                          onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                          className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Тайлбар</label>
                        <textarea
                          value={productForm.description}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Үнэ (₮)</label>
                          <input
                            type="number"
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Ангилал</label>
                          <select
                            value={productForm.category}
                            onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="Энгийн">Энгийн</option>
                            <option value="Байгаль">Байгаль</option>
                            <option value="Цэцэг">Цэцэг</option>
                            <option value="Хос">Хос</option>
                            <option value="Студи">Студи</option>
                            <option value="Гэр бүл">Гэр бүл</option>
                            <option value="Урлаг">Урлаг</option>
                          </select>
                        </div>
                      </div>
                      <div>
                       <ImageUpload
                          label="Бүтээгдэхүүний зураг"
                          value={productForm.images.split(",")[0]?.trim() || ""}
                          onChange={(url) => {
                            const existing = productForm.images
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean);
                            setProductForm({
                              ...productForm,
                              images: [url, ...existing].join(", "),
                            });
                          }}
                        />

                       <div className="mt-4">
  <button
    type="button"
    onClick={handleGeneratePrompt}
    disabled={generatingPrompt || !productForm.images.trim()}
    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {generatingPrompt ? (
      <span className="flex items-center justify-center gap-2">
        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        🤖 Prompt үүсгэж байна...
      </span>
    ) : (
      "🤖 AI Prompt автоматаар үүсгэх"
    )}
  </button>
</div>

{productForm.prompt && (
  <div className="mt-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      🤖 AI Prompt
    </label>

    <textarea
      value={productForm.prompt}
      onChange={(e) =>
        setProductForm({
          ...productForm,
          prompt: e.target.value,
        })
      }
      rows={8}
      className="w-full px-4 py-3 border rounded-xl bg-purple-50 text-sm text-gray-700 focus:ring-2 focus:ring-purple-500"
    />

   <div className="flex items-center justify-between mt-2">
  <p className="text-xs text-gray-500">
    Энэ prompt-ийг зөвхөн админ ашиглана.
  </p>

  <button
    type="button"
    onClick={() =>
      setProductForm((prev) => ({
        ...prev,
        prompt: "",
      }))
    }
    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
  >
    🗑️ Prompt устгах
  </button>
</div>
  </div>
)} 

                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={productForm.featured}
                          onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                          className="w-5 h-5 text-purple-600 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">Онцлох бүтээгдэхүүн</span>
                      </label>
                      <div className="flex gap-4 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowProductForm(false);
                            setEditingProduct(null);
                          }}
                          className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                        >
                          Цуцлах
                        </button>
                   <button
                          type="button"
                          onClick={handleProductSubmit}
                          className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
                        >
                          {editingProduct ? "Хадгалах" : "Үүсгэх"}
                        </button>

                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Orders */}
          {activeTab === "orders" && (
            <div className="space-y-4 animate-fade-in">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-6">
                      <div className="skeleton h-6 w-1/3 rounded" />
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center">
                  <span className="text-6xl block mb-4">📭</span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Захиалга байхгүй</h3>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm"> 

                    {order.uploadedPhoto && (
  <div className="mt-4">
    <p className="text-sm font-semibold text-gray-700 mb-2">
      Хэрэглэгчийн оруулсан зураг
    </p>

    <img
      src={order.uploadedPhoto}
      alt="Хэрэглэгчийн оруулсан зураг"
      className="w-full max-w-md rounded-xl border object-cover"
    />
  </div>
)}
                   {order.prompt && (
  <div className="mt-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      🤖 AI Prompt
    </label>

    <div className="w-full p-4 bg-purple-50 border border-purple-200 rounded-xl text-sm text-gray-700 whitespace-pre-wrap">
      {order.prompt}
    </div>
  </div>
)} 
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900">Захиалга #{order.id}</h3>
                        <p className="text-sm text-gray-600">{order.customerName}</p>
                        <p className="text-xs text-gray-400">{order.customerPhone}</p>
                      </div>
                      <p className="text-xl font-bold text-purple-600">
                        {order.totalAmount.toLocaleString()}₮
                      </p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Төлөв</label>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrder(order.id, { status: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="pending">⏳ Хүлээгдэж буй</option>
                          <option value="processing">🔄 Боловсруулж байна</option>
                          <option value="completed">✅ Дууссан</option>
                          <option value="cancelled">❌ Цуцлагдсан</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Төлбөр</label>
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => handleUpdateOrder(order.id, { paymentStatus: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="pending">Төлөгдөөгүй</option>
                          <option value="paid">Төлсөн</option>
                          <option value="refunded">Буцаагдсан</option>
                        </select>
                      </div>
                       <div className="mt-4">
  <ImageUpload
    label="Зассан зураг"
    value={order.editedPhoto || ""}
    onChange={(url) =>
      handleUpdateOrder(order.id, { editedPhoto: url })
    }
  />

  {order.editedPhoto && (
    <img
      src={order.editedPhoto}
      alt="Зассан зураг"
      className="mt-4 w-full max-w-md rounded-xl border object-cover"
    />
  )}

  {order.status === "completed" && (
    <button
      type="button"
      onClick={async () => {
        if (!confirm("Энэ дууссан захиалгыг устгах уу?")) return;

        try {
          const res = await fetch(`/api/orders?id=${order.id}`, {
            method: "DELETE",
          });

          if (!res.ok) {
            alert("Захиалга устгахад алдаа гарлаа");
            return;
          }

          setOrders((prev) =>
            prev.filter((o) => o.id !== order.id)
          );
        } catch (error) {
          console.error(error);
          alert("Захиалга устгахад алдаа гарлаа");
        }
      }}
      className="mt-4 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
    >
      🗑️ Устгах
    </button>
  )}
</div> 
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Users */}
          {activeTab === "users" && (
            <div className="space-y-4 animate-fade-in">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-6">
                      <div className="skeleton h-6 w-1/3 rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                users.map((u) => (
                  <div key={u.id} className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{u.name}</h3>
                          <p className="text-sm text-gray-500">{u.email}</p>
                          {u.phone && <p className="text-xs text-gray-400">{u.phone}</p>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {u.role === "admin" ? "Админ" : "Хэрэглэгч"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {LANGUAGE_LABELS[u.language] || u.language || "🇲🇳 Монгол"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Chat */}
          {activeTab === "chat" && (
            <div className="animate-fade-in h-[calc(100vh-140px)]">
              <div className="grid lg:grid-cols-3 gap-6 h-full">
                {/* Sessions List */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-bold text-gray-900">💬 Харилцаанууд</h3>
                    <p className="text-xs text-gray-500 mt-1">{chatSessions.length} нийт</p>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {chatSessions.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <span className="text-4xl block mb-2">💬</span>
                        <p>Чат байхгүй</p>
                      </div>
                    ) : (
                      chatSessions.map((session) => (
                        <button
                          key={session.sessionId}
                          onClick={() => setSelectedChat(session.sessionId)}
                          className={`w-full p-4 border-b text-left hover:bg-gray-50 transition-colors ${
                            selectedChat === session.sessionId ? "bg-purple-50 border-l-4 border-l-purple-500" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                                {(session.userName || "?").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 text-sm">
                                  {session.userName || "Зочин"}
                                </h4>
                                <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                  {session.lastMessage}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-gray-400">
                                {new Date(session.updatedAt).toLocaleDateString("mn-MN")}
                              </span>
                              {session.messageCount > 0 && (
                                <span className="block mt-1 px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-xs">
                                  {session.messageCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
                  {selectedChat ? (
                    <>
                      <div className="p-4 border-b bg-gray-50">
                        <h3 className="font-bold text-gray-900">
                          {chatSessions.find((s) => s.sessionId === selectedChat)?.userName || "Зочин"}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {chatSessions.find((s) => s.sessionId === selectedChat)?.userPhone || "Утас байхгүй"}
                        </p>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-[300px]">
                        {chatMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`mb-3 flex ${msg.sender === "user" ? "justify-start" : "justify-end"}`}
                          >
                            <div
                              className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                                msg.sender === "user"
                                  ? "bg-white shadow-sm text-gray-800 rounded-bl-md border"
                                  : msg.sender === "admin"
                                  ? "bg-purple-600 text-white rounded-br-md"
                                  : "bg-gray-200 text-gray-700 rounded-br-md"
                              }`}
                            >
                              {msg.sender === "bot" && (
                                <div className="text-xs opacity-70 mb-1">🤖 Автомат</div>
                              )}
                              {msg.sender === "admin" && (
                                <div className="text-xs opacity-70 mb-1">👤 Админ</div>
                              )}
                              {msg.message}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 bg-white border-t">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={adminReply}
                            onChange={(e) => setAdminReply(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendAdminReply()}
                            placeholder="Хариу бичих..."
                            className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <button
                            onClick={sendAdminReply}
                            disabled={!adminReply.trim() || sendingReply}
                            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                          >
                            {sendingReply ? "..." : "Илгээх"}
                          </button>
                        </div>
                        <div className="flex gap-2 mt-2 overflow-x-auto">
                          {[
                            "Баярлалаа!",
                            "85828385 руу залгана уу.",
                            "Захиалга өгнө үү: /products",
                          ].map((quick, idx) => (
                            <button
                              key={idx}
                              onClick={() => setAdminReply(quick)}
                              className="flex-shrink-0 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                            >
                              {quick}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 min-h-[400px]">
                      <div className="text-center">
                        <span className="text-6xl block mb-4">💬</span>
                        <p>Харилцаа сонгоно уу</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
