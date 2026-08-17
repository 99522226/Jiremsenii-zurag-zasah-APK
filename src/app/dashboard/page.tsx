"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

interface Order {
  id: number;
  dailyOrderNumber: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{ productId: number; name: string; price: number; quantity: number }>;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  uploadedPhoto: string | null;
  editedPhoto: string | null;
  notes: string | null;
  adminNotes: string | null;
  createdAt: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  pending: { label: "Хүлээгдэж буй", color: "bg-yellow-100 text-yellow-800", emoji: "⏳" },
  processing: { label: "Боловсруулж байна", color: "bg-blue-100 text-blue-800", emoji: "🔄" },
  completed: { label: "Дууссан", color: "bg-green-100 text-green-800", emoji: "✅" },
  cancelled: { label: "Цуцлагдсан", color: "bg-red-100 text-red-800", emoji: "❌" },
};

const PAYMENT_LABELS: Record<string, string> = {
  pending: "Төлөгдөөгүй",
  paid: "Төлсөн",
  refunded: "Буцаагдсан",
};

export default function DashboardPage() {
  const { user, loadFromStorage, logout } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "admin">("orders");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editedPhotoUrl, setEditedPhotoUrl] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);

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
    fetchOrders();
  }, [mounted, user, router]);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const url =
        user.role === "admin"
          ? "/api/orders?all=true"
          : `/api/orders?email=${encodeURIComponent(user.email)}`;
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data);
    } catch {}
    setLoading(false);
  };

  const updateOrder = async (orderId: number, updates: Record<string, string | null>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(orders.map((o) => (o.id === orderId ? updated : o)));
        setSelectedOrder(updated);
      }
    } catch {}
    setSaving(false);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Уншиж байна...</p>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === "admin";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🤰</span>
              <span className="text-lg font-bold text-rose-600" style={{ fontFamily: "'Playfair Display', serif" }}>
                Жирэмсэн Зураг
              </span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <button
              onClick={() => { setActiveTab("orders"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "orders" ? "bg-rose-50 text-rose-600" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>📦</span> {isAdmin ? "Бүх захиалга" : "Миний захиалга"}
            </button>
            {isAdmin && (
              <button
                onClick={() => { setActiveTab("admin"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === "admin" ? "bg-rose-50 text-rose-600" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>⚙️</span> Админ удирдлага
              </button>
            )}
            <Link
              href="/"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <span>🏠</span> Нүүр хуудас
            </Link>
            <Link
              href="/products"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <span>🛍️</span> Дэлгүүр
            </Link>
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                <p className="text-gray-500 text-xs truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
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
        {/* Top bar */}
        <header className="bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {activeTab === "orders" ? (isAdmin ? "📦 Бүх захиалга" : "📦 Миний захиалга") : "⚙️ Админ удирдлага"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isAdmin ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
              {isAdmin ? "Админ" : "Хэрэглэгч"}
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {activeTab === "orders" && (
            <div>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-6">
                      <div className="skeleton h-6 w-1/3 rounded mb-3" />
                      <div className="skeleton h-4 w-1/2 rounded mb-2" />
                      <div className="skeleton h-4 w-1/4 rounded" />
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center">
                  <span className="text-6xl block mb-4">📭</span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Захиалга байхгүй</h3>
                  <p className="text-gray-500 mb-6">Одоогоор захиалга ирээгүй байна</p>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors"
                  >
                    Дэлгүүр үзэх →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const status = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
                  const displayStatus =
  order.editedPhoto && order.status === "processing"
    ? STATUS_LABELS.completed
    : status;
                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          setSelectedOrder(order);
                          setEditedPhotoUrl(order.editedPhoto || "");
                          setAdminNotes(order.adminNotes || "");
                        }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-gray-900">
  Захиалга #{order.dailyOrderNumber}
</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${displayStatus.color}`}>
  {displayStatus.emoji} {displayStatus.label}
</span> 
                            </div>
                            {isAdmin && (
                              <p className="text-sm text-gray-600">
                                {order.customerName} • {order.customerPhone}
                              </p>
                            )}
                            <p className="text-sm text-gray-500">
                              {order.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-rose-600">
                              {order.totalAmount.toLocaleString()}₮
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(order.createdAt).toLocaleDateString("mn-MN")}
                            </p>
                          </div>
                        </div>

                        {/* Show photos */}
                        <div className="flex gap-4 mt-4">
                          {order.uploadedPhoto && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">📸 Оруулсан зураг</p>
                              <img src={order.uploadedPhoto} alt="" className="w-16 h-16 rounded-lg object-cover" />
                            </div>
                          )}
                          {order.editedPhoto && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">✨ Засварласан зураг</p>
                              <img src={order.editedPhoto} alt="" className="w-16 h-16 rounded-lg object-cover" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "admin" && isAdmin && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <span className="text-3xl block mb-2">📦</span>
                  <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                  <p className="text-gray-500 text-sm">Нийт захиалга</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <span className="text-3xl block mb-2">⏳</span>
                  <p className="text-3xl font-bold text-yellow-600">{orders.filter((o) => o.status === "pending").length}</p>
                  <p className="text-gray-500 text-sm">Хүлээгдэж буй</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <span className="text-3xl block mb-2">🔄</span>
                  <p className="text-3xl font-bold text-blue-600">{orders.filter((o) => o.status === "processing").length}</p>
                  <p className="text-gray-500 text-sm">Боловсруулж буй</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <span className="text-3xl block mb-2">✅</span>
                  <p className="text-3xl font-bold text-green-600">{orders.filter((o) => o.status === "completed").length}</p>
                  <p className="text-gray-500 text-sm">Дууссан</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">💰 Нийт орлого</h3>
                <p className="text-4xl font-bold text-rose-600">
                  {orders
                    .filter((o) => o.status !== "cancelled")
                    .reduce((sum, o) => sum + o.totalAmount, 0)
                    .toLocaleString()}₮
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">📞 Холбоо барих мэдээлэл</h3>
                <div className="space-y-2 text-gray-600">
                  <p>📞 Утас: 95009809</p>
                  <p>📧 Email: jaagiierdene96@gmail.com</p>
                  <p>📍 Байршил: Дорноговь, Сайншанд</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Захиалга #{selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 text-sm mb-2">👤 Хэрэглэгч</h3>
                  <p className="text-gray-900 font-medium">{selectedOrder.customerName}</p>
                  <p className="text-gray-600 text-sm">{selectedOrder.customerEmail}</p>
                  <p className="text-gray-600 text-sm">{selectedOrder.customerPhone}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 text-sm mb-2">💰 Төлбөр</h3>
                  <p className="text-2xl font-bold text-rose-600">{selectedOrder.totalAmount.toLocaleString()}₮</p>
                  <p className="text-gray-600 text-sm mt-1">
                    {PAYMENT_LABELS[selectedOrder.paymentStatus] || selectedOrder.paymentStatus}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 text-sm mb-2">📦 Бүтээгдэхүүн</h3>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-1">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="font-medium">{(item.price * item.quantity).toLocaleString()}₮</span>
                  </div>
                ))}
              </div>

              {/* Photos section */}
              <div className="grid sm:grid-cols-2 gap-4">
                {selectedOrder.uploadedPhoto && (
                  <div>
                    <h3 className="font-semibold text-gray-700 text-sm mb-2">📸 Оруулсан зураг</h3>
                    <img src={selectedOrder.uploadedPhoto} alt="" className="w-full h-auto max-h-96 object-contain rounded-xl bg-gray-100" />
                  </div>
                )}
                {selectedOrder.editedPhoto && (
                  <div>
                    <h3 className="font-semibold text-gray-700 text-sm mb-2">✨ Засварласан зураг</h3>
                    <img src={selectedOrder.editedPhoto} alt="" className="w-full h-auto max-h-96 object-contain rounded-xl bg-gray-100" />
                  </div>
                )}
              </div>

              {selectedOrder.notes && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 text-sm mb-2">📝 Хэрэглэгчийн тэмдэглэл</h3>
                  <p className="text-gray-600 text-sm">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Admin controls */}
              {isAdmin && (
                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-bold text-gray-900">🔧 Админ удирдлага</h3>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Төлөв</label>
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => updateOrder(selectedOrder.id, { status: e.target.value })}
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="pending">⏳ Хүлээгдэж буй</option>
                        <option value="processing">🔄 Боловсруулж байна</option>
                        <option value="completed">✅ Дууссан</option>
                        <option value="cancelled">❌ Цуцлагдсан</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Төлбөрийн төлөв</label>
                      <select
                        value={selectedOrder.paymentStatus}
                        onChange={(e) => updateOrder(selectedOrder.id, { paymentStatus: e.target.value })}
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="pending">Төлөгдөөгүй</option>
                        <option value="paid">Төлсөн</option>
                        <option value="refunded">Буцаагдсан</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ✨ Засварласан зургийн URL (хэрэглэгч рүү илгээх)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editedPhotoUrl}
                        onChange={(e) => setEditedPhotoUrl(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500"
                      />
                      <button
                        onClick={() => updateOrder(selectedOrder.id, { editedPhoto: editedPhotoUrl || null })}
                        disabled={saving}
                        className="px-4 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors disabled:opacity-50"
                      >
                        {saving ? "..." : "Хадгалах"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">📝 Админ тэмдэглэл</label>
                    <div className="flex gap-2">
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows={2}
                        className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500"
                      />
                      <button
                        onClick={() => updateOrder(selectedOrder.id, { adminNotes: adminNotes || null })}
                        disabled={saving}
                        className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 self-end"
                      >
                        {saving ? "..." : "Хадгалах"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
