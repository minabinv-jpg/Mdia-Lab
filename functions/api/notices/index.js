/**
 * Cloudflare Pages Functions - /api/notices
 * 게시판 공지 및 일반 방문자 질문글 목록 조회 (GET), 새 글/질문 작성 (POST)
 * 
 * Cloudflare D1 바인딩: context.env.DB
 */

// 1. 게시글 목록 불러오기 (GET)
export async function onRequestGet(context) {
  const { env } = context;

  try {
    if (!env || !env.DB) {
      // D1 바인딩이 아직 없을 경우 fallback 또는 명확한 에러 반환
      return new Response(
        JSON.stringify({
          success: true,
          notices: []
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const { results } = await env.DB.prepare(
      `SELECT id, category, title, author, date, views, content, 
              (CASE WHEN password IS NOT NULL AND password != '' THEN 1 ELSE 0 END) as hasPassword,
              isSecret, pinned, answer, answeredAt, createdAt
       FROM Notices 
       ORDER BY pinned DESC, createdAt DESC`
    ).all();

    const formattedNotices = (results || []).map(row => ({
      ...row,
      pinned: !!row.pinned,
      isSecret: !!row.isSecret,
      hasPassword: !!row.hasPassword
    }));

    return new Response(
      JSON.stringify({
        success: true,
        notices: formattedNotices
      }),
      {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        }
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "게시글 목록을 불러오는 중 오류가 발생했습니다: " + err.message
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// 2. 새 질문 또는 게시글 작성 (POST)
export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, message: "올바르지 않은 JSON 요청 본문입니다." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const {
    category = "질문답변",
    title,
    author = "방문자",
    content,
    password,
    isSecret = true
  } = body;

  if (!title || !title.trim() || !content || !content.trim()) {
    return new Response(
      JSON.stringify({ success: false, message: "제목과 내용은 필수 입력 사항입니다." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const noticeId = "notice-" + Date.now();
  const dateStr = new Date().toISOString().split("T")[0];
  const nowIso = new Date().toISOString();
  const hasPasswordBool = !!(password && password.trim());
  const finalSecret = isSecret || hasPasswordBool;

  try {
    if (!env || !env.DB) {
      throw new Error("Cloudflare D1 DB 바인딩이 설정되지 않았습니다.");
    }

    // 테이블 존재 여부 안전 보장
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS Notices (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL DEFAULT '질문답변',
        title TEXT NOT NULL,
        author TEXT NOT NULL DEFAULT '방문자',
        date TEXT NOT NULL,
        views INTEGER NOT NULL DEFAULT 1,
        content TEXT NOT NULL,
        password TEXT,
        isSecret INTEGER NOT NULL DEFAULT 0,
        pinned INTEGER NOT NULL DEFAULT 0,
        answer TEXT,
        answeredAt TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    await env.DB.prepare(
      `INSERT INTO Notices (id, category, title, author, date, views, content, password, isSecret, pinned, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, 0, ?, ?)`
    )
      .bind(
        noticeId,
        category,
        title.trim(),
        author.trim() || "방문자",
        dateStr,
        content.trim(),
        password ? password.trim() : null,
        finalSecret ? 1 : 0,
        nowIso,
        nowIso
      )
      .run();

    const createdNotice = {
      id: noticeId,
      category,
      title: title.trim(),
      author: author.trim() || "방문자",
      date: dateStr,
      views: 1,
      content: content.trim(),
      hasPassword: hasPasswordBool,
      isSecret: finalSecret,
      pinned: false,
      createdAt: nowIso
    };

    return new Response(
      JSON.stringify({
        success: true,
        message: "게시글이 성공적으로 등록되었습니다.",
        notice: createdNotice
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "게시글 등록 처리 실패: " + err.message
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// OPTIONS 프리플라이트 지원
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
