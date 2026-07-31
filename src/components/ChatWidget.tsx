"use client";
import { useState, useEffect, useRef } from "react";

interface Message {
  id: number;
  sessionId: string;
  sender: string;
  message: string;
  isBot: boolean;
  createdAt: string;
}

function generateSessionId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get or create session ID
    let storedSessionId = localStorage.getItem("chat_session_id");
    if (!storedSessionId) {
      storedSessionId = generateSessionId();
      localStorage.setItem("chat_session_id", storedSessionId);
    }
    setSessionId(storedSessionId);

    // Load existing messages
    fetch(`/api/chat?sessionId=${storedSessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMessages(data);
          setShowWelcome(false);
        }
      })
      .catch(() => {});

    // Show notification after delay
    const timer = setTimeout(() => {
      if (!isOpen) {
        setUnreadCount(1);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    setInput("");
    setLoading(true);
    setShowWelcome(false);

    // Optimistic update
    const tempUserMsg: Message = {
      id: Date.now(),
      sessionId,
      sender: "user",
      message: messageText,
      isBot: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: messageText }),
      });
      const data = await res.json();

      if (data.botMessage) {
        setMessages((prev) => [...prev.slice(0, -1), data.userMessage, data.botMessage]);
      }
    } catch {
      // Keep optimistic message
    }
    setLoading(false);
  };

  const quickReplies = [
    { text: "💰 Үнийн мэдээлэл", message: "Үнэ хэд вэ?" },
    { text: "📸 Зургийн шаардлага", message: "Зураг ямар байх ёстой вэ?" },
    { text: "📞 Холбоо барих", message: "Холбоо барих мэдээлэл" },
    { text: "⏰ Хугацаа", message: "Хэдэн хоногт бэлэн болох вэ?" },
  ];

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen 
            ? "bg-gray-700 hover:bg-gray-800" 
            : "bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
        }`}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🤰</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold">Жирэмсэн Зураг</h3>
                <p className="text-white/80 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Онлайн • Автомат хариулагч
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 bg-gray-50">
            {showWelcome && messages.length === 0 && (
              <div className="text-center py-4">
                <span className="text-4xl block mb-3">👋</span>
                <h4 className="font-bold text-gray-900 mb-2">Сайн байна уу!</h4>
                <p className="text-gray-500 text-sm mb-4">
                  Би автомат туслах бот. Танд хэрхэн туслах вэ?
                </p>
                <div className="space-y-2">
                  {quickReplies.map((qr, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(qr.message)}
                      className="block w-full px-4 py-2 bg-white border rounded-xl text-sm text-gray-700 hover:bg-rose-50 hover:border-rose-200 transition-colors text-left"
                    >
                      {qr.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-3 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-br-md"
                      : msg.sender === "admin"
                      ? "bg-purple-100 text-purple-900 rounded-bl-md"
                      : "bg-white shadow-sm text-gray-800 rounded-bl-md border"
                  }`}
                >
                  {msg.sender === "admin" && (
                    <div className="text-xs text-purple-600 font-semibold mb-1">👤 Админ</div>
                  )}
                  {msg.sender === "bot" && msg.isBot && (
                    <div className="text-xs text-gray-400 mb-1">🤖 Автомат хариулт</div>
                  )}
                  {msg.message}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start mb-3">
                <div className="bg-white shadow-sm px-4 py-3 rounded-2xl rounded-bl-md border">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t flex gap-2 overflow-x-auto">
              {quickReplies.slice(0, 3).map((qr, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(qr.message)}
                  className="flex-shrink-0 px-3 py-1.5 bg-white border rounded-full text-xs text-gray-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                >
                  {qr.text}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Мессеж бичих..."
                className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
