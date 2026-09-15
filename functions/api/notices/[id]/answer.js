/**
 * Cloudflare Pages Functions - /api/notices/[id]/answer
 * 관리자 질문 답변 등록
 */

export async function onRequestPost(context) {
  const { params, request, env } = context;
  const noticeId = params.id;

  let body = {};
  try {
    body = await request.json();
  } catch (e) {}

  const { answer, isAdmin } = body;

  if (!isAdmin) {
    return new Response(JSON.stringify({ success: false, message: "관리자만 답변을 등록할 수 있습니다." }), { status: 403 });
  }

  if (!answer || !answer.trim()) {
    return new Response(JSON.stringify({ success: false, message: "답변 내용을 입력해주세요." }), { status: 400 });
  }

  try {
    const notice = await env.DB.prepare("SELECT * FROM Notices WHERE id = ?").bind(noticeId).first();
    if (!notice) {
      return new Response(JSON.stringify({ success: false, message: "게시글을 찾을 수 없습니다." }), { status: 404 });
    }

    const answeredAt = new Date().toISOString();
    await env.DB.prepare("UPDATE Notices SET answer = ?, answeredAt = ? WHERE id = ?").bind(answer.trim(), answeredAt, noticeId).run();

    return new Response(JSON.stringify({
      success: true,
      notice: {
        ...notice,
        answer: answer.trim(),
        answeredAt,
        hasPassword: !!notice.password,
        isSecret: !!notice.isSecret,
        pinned: !!notice.pinned
      }
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}
