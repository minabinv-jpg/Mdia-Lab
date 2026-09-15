/**
 * Cloudflare Pages Functions - /api/activity
 * 일반 사용자의 활동 데이터(영상 시청 완료, 카테고리 클릭 등)를 저장 (POST)
 * 
 * Cloudflare D1 바인딩: context.env.DB
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, message: "올바르지 않은 JSON 요청 형식입니다." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const {
    userId = "anonymous_guest",
    actionType,               // 'VIDEO_COMPLETE', 'CATEGORY_CLICK', 'SEARCH', 'PAGE_VIEW' 등
    videoId = null,
    categoryClicked = null,
    metadata = {}
  } = body;

  if (!actionType) {
    return new Response(
      JSON.stringify({ success: false, message: "활동 유형(actionType)은 필수 입력 사항입니다." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const logId = "act_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
  const nowIso = new Date().toISOString();

  try {
    // Users 외래키 제약조건 고려하여 미존재 시 익명 게스트 등록
    if (userId.startsWith("anonymous_") || userId === "guest") {
      await env.DB.prepare(
        "INSERT OR IGNORE INTO Users (id, email, name, role, createdAt) VALUES (?, ?, ?, ?, ?)"
      )
        .bind(userId, `${userId}@guest.mdialab.local`, "방문자 게스트", "User", nowIso)
        .run();
    }

    // 활동 로그 삽입
    await env.DB.prepare(
      `INSERT INTO ActivityLogs (id, userId, loginTime, videoId, categoryClicked, actionType, metadata, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        logId,
        userId,
        body.loginTime || null,
        videoId || null,
        categoryClicked || null,
        actionType,
        typeof metadata === "string" ? metadata : JSON.stringify(metadata),
        nowIso
      )
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        message: "활동 데이터가 성공적으로 기록되었습니다.",
        logId
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
        message: "D1 활동 로그 저장 중 오류 발생: " + err.message
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// 활동 로그 조회 (GET) - 관리자용 통계/분석 목적
export async function onRequestGet(context) {
  const { env } = context;

  try {
    const { results } = await env.DB.prepare(
      `SELECT a.id, a.userId, u.email as userEmail, u.name as userName, a.videoId, a.categoryClicked, a.actionType, a.metadata, a.createdAt
       FROM ActivityLogs a
       LEFT JOIN Users u ON a.userId = u.id
       ORDER BY a.createdAt DESC
       LIMIT 100`
    ).all();

    return new Response(
      JSON.stringify({
        success: true,
        count: results ? results.length : 0,
        logs: results || []
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "활동 로그 조회 실패: " + err.message
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
