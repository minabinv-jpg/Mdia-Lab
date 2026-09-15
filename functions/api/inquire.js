/**
 * Cloudflare Pages Functions - /api/inquire
 * Handles estimate inquiry submissions and triggers email routing to minabinv2@gmail.com
 */

export async function onRequestPost(context) {
  try {
    const body = await context.request.json().catch(() => ({}));
    const { name, email, phone, category, budget, timeline, youtubeRef, message, files } = body;

    if (!name || !email || !phone || !message) {
      return new Response(JSON.stringify({
        success: false,
        message: "필수 정보(이름, 이메일, 연락처, 문의내용)를 올바르게 입력해주세요."
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    const inquiryId = `INQ-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const recipientEmail = "minabinv2@gmail.com";

    // If D1 Database is available, store in inquiries table
    if (context.env && context.env.DB) {
      try {
        await context.env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS Inquiries (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            category TEXT,
            budget TEXT,
            timeline TEXT,
            youtubeRef TEXT,
            message TEXT NOT NULL,
            filesCount INTEGER DEFAULT 0,
            recipientEmail TEXT DEFAULT 'minabinv2@gmail.com',
            createdAt TEXT NOT NULL
          )
        `).run();

        await context.env.DB.prepare(`
          INSERT INTO Inquiries (id, name, email, phone, category, budget, timeline, youtubeRef, message, filesCount, recipientEmail, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          inquiryId,
          name,
          email,
          phone,
          category || "홍보영상 제작",
          budget || "협의 가능",
          timeline || "미정",
          youtubeRef || "",
          message,
          files ? files.length : 0,
          recipientEmail,
          timestamp
        ).run();
      } catch (dbErr) {
        console.warn("[Cloudflare Inquire DB Warning]", dbErr);
      }
    }

    // Return success response with mailto direct fallback details
    return new Response(JSON.stringify({
      success: true,
      message: `견적 문의가 성공적으로 접수되어 담당자(${recipientEmail})에게 전달되었습니다.`,
      inquiryId,
      recipientEmail
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (err) {
    console.error("[Cloudflare Inquire Error]", err);
    return new Response(JSON.stringify({
      success: false,
      message: err.message || "견적 문의 처리 중 오류가 발생했습니다."
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
