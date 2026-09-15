/**
 * Cloudflare Pages Functions - /api/auth
 * 사용자 로그인 처리 및 권한(Admin/User) 반환
 * 
 * Cloudflare D1 바인딩: context.env.DB
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  // JSON 요청 바디 파싱
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, message: "올바르지 않은 JSON 요청 형식입니다." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { email, password, name } = body;

  if (!email) {
    return new Response(
      JSON.stringify({ success: false, message: "이메일은 필수 입력값입니다." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // 1. D1에서 사용자 조회
    const userStmt = env.DB.prepare(
      "SELECT id, email, name, role, createdAt, lastLoginAt FROM Users WHERE email = ?"
    );
    let user = await userStmt.bind(email).first();

    const nowIso = new Date().toISOString();

    // 사용자가 존재하지 않는 경우
    if (!user) {
      // admin@mdialab.com 등의 특정 이메일은 Admin 권한 부여, 그 외는 User 권한
      const assignedRole = email === "admin@mdialab.com" || email.includes("admin") ? "Admin" : "User";
      const newUserId = "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
      const userName = name || email.split("@")[0];

      await env.DB.prepare(
        "INSERT INTO Users (id, email, name, role, createdAt, lastLoginAt) VALUES (?, ?, ?, ?, ?, ?)"
      )
        .bind(newUserId, email, userName, assignedRole, nowIso, nowIso)
        .run();

      user = {
        id: newUserId,
        email,
        name: userName,
        role: assignedRole,
        createdAt: nowIso,
        lastLoginAt: nowIso
      };
    } else {
      // 기존 사용자의 마지막 로그인 일시 갱신
      await env.DB.prepare(
        "UPDATE Users SET lastLoginAt = ? WHERE id = ?"
      )
        .bind(nowIso, user.id)
        .run();

      user.lastLoginAt = nowIso;
    }

    // 로그인 성공 시 세션/토큰 및 활동 로그(LOGIN) 기록
    await env.DB.prepare(
      "INSERT INTO ActivityLogs (id, userId, loginTime, actionType, metadata, createdAt) VALUES (?, ?, ?, ?, ?, ?)"
    )
      .bind(
        "act_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
        user.id,
        nowIso,
        "LOGIN",
        JSON.stringify({ clientAgent: request.headers.get("User-Agent") || "Unknown" }),
        nowIso
      )
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        message: "로그인 성공",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          lastLoginAt: user.lastLoginAt
        }
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
        message: "D1 데이터베이스 인증 처리 중 오류 발생: " + err.message
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// OPTIONS 프리플라이트 요청 지원 (CORS 대응)
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
