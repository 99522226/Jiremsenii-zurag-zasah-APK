import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { chatSessions, chatMessages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// Admin send message to user
export async function POST(req: NextRequest) {
  try {
    const { sessionId, message } = await req.json();

    if (!sessionId || !message) {
      return NextResponse.json({ error: "sessionId болон message шаардлагатай" }, { status: 400 });
    }

    // Save admin message
    const [adminMessage] = await db
      .insert(chatMessages)
      .values({
        sessionId,
        sender: "admin",
        message,
        isBot: false,
      })
      .returning();

    // Update session
    await db
      .update(chatSessions)
      .set({ updatedAt: new Date() })
      .where(eq(chatSessions.sessionId, sessionId));

    return NextResponse.json(adminMessage);
  } catch (error) {
    console.error("Admin chat error:", error);
    return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
  }
}

// Get session details with messages
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("sessionId");

    if (!sessionId) {
      // Get all sessions with last message
      const sessions = await db
        .select()
        .from(chatSessions)
        .orderBy(desc(chatSessions.updatedAt));

      const sessionsWithLastMessage = await Promise.all(
        sessions.map(async (session) => {
          const [lastMessage] = await db
            .select()
            .from(chatMessages)
            .where(eq(chatMessages.sessionId, session.sessionId))
            .orderBy(desc(chatMessages.createdAt))
            .limit(1);

          const messageCount = await db
            .select()
            .from(chatMessages)
            .where(eq(chatMessages.sessionId, session.sessionId));

          return {
            ...session,
            lastMessage: lastMessage?.message || "",
            messageCount: messageCount.length,
          };
        })
      );

      return NextResponse.json(sessionsWithLastMessage);
    }

    // Get specific session with all messages
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.sessionId, sessionId));

    if (!session) {
      return NextResponse.json({ error: "Session олдсонгүй" }, { status: 404 });
    }

    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt);

    return NextResponse.json({
      session,
      messages,
    });
  } catch (error) {
    console.error("Admin chat GET error:", error);
    return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
  }
}
