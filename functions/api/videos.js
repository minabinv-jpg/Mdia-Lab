/**
 * Cloudflare Pages Functions - /api/videos
 * 영상 목록 불러오기(GET), 관리자 영상 업로드(POST), 영상 삭제(DELETE)
 * 
 * Cloudflare D1 바인딩: context.env.DB
 */

// 1. 영상 목록 불러오기 (GET)
export async function onRequestGet(context) {
  const { env } = context;

  try {
    const { results } = await env.DB.prepare(
      "SELECT id, title, videoUrl, youtubeId, category, client, year, description, runtime, isFeatured, createdAt FROM Videos ORDER BY createdAt DESC"
    ).all();

    return new Response(
      JSON.stringify({
        success: true,
        videos: results || []
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
        message: "영상 목록을 불러오는 중 오류가 발생했습니다: " + err.message
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// 2. 관리자 영상 업로드 (POST)
export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, message: "올바르지 않은 JSON 데이터입니다." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const {
    id,
    title,
    videoUrl,
    youtubeId,
    category = "광고/홍보영상",
    client = "Mdia Lab",
    year = new Date().getFullYear().toString(),
    description = "",
    runtime = "02:00",
    isFeatured = false,
    userRole = "Admin"
  } = body;

  // 권한 검증: 관리자(Admin)만 영상 업로드 가능
  if (userRole !== "Admin") {
    return new Response(
      JSON.stringify({ success: false, message: "영상 등록 권한이 없습니다. (관리자 전용)" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!title || !videoUrl) {
    return new Response(
      JSON.stringify({ success: false, message: "영상 제목과 영상 URL은 필수 입력 사항입니다." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const videoId = id || "vid_" + Date.now();
  const nowIso = new Date().toISOString();

  try {
    await env.DB.prepare(
      `INSERT INTO Videos (id, title, videoUrl, youtubeId, category, client, year, description, runtime, isFeatured, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        videoId,
        title,
        videoUrl,
        youtubeId || "",
        category,
        client,
        year,
        description,
        runtime,
        isFeatured ? 1 : 0,
        nowIso,
        nowIso
      )
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        message: "영상 등록이 완료되었습니다.",
        video: {
          id: videoId,
          title,
          videoUrl,
          youtubeId,
          category,
          client,
          year,
          description,
          runtime,
          isFeatured: !!isFeatured,
          createdAt: nowIso
        }
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
        message: "D1 데이터베이스에 영상 등록 실패: " + err.message
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// 3. 영상 삭제 (DELETE)
export async function onRequestDelete(context) {
  const { request, env } = context;

  const url = new URL(request.url);
  const videoId = url.searchParams.get("id");

  let body = {};
  try {
    body = await request.json();
  } catch (e) {
    // URL 파라미터로 넘겼을 수 있으므로 통과
  }

  const targetId = videoId || body.id;
  const userRole = body.userRole || "Admin";

  if (userRole !== "Admin") {
    return new Response(
      JSON.stringify({ success: false, message: "영상 삭제 권한이 없습니다. (관리자 전용)" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!targetId) {
    return new Response(
      JSON.stringify({ success: false, message: "삭제할 영상의 ID(id)가 필요합니다." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const result = await env.DB.prepare(
      "DELETE FROM Videos WHERE id = ?"
    )
      .bind(targetId)
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        message: `영상(${targetId})이 성공적으로 삭제되었습니다.`,
        deletedId: targetId
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
        message: "D1 영상 삭제 처리 실패: " + err.message
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
