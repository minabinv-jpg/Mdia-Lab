/**
 * Cloudflare Pages Functions - /api/notices/[id]/verify
 * 게시글 비밀번호 확인 또는 관리자 조회
 */

export async function onRequestPost(context) {
  const { params, request, env } = context;
  const noticeId = params.id;

  let body = {};
  try {
    body = await request.json();
  } catch (e) {}

  const { password, isAdmin } = body;

  try {
    const notice = await env.DB.prepare("SELECT * FROM Notices WHERE id = ?").bind(noticeId).first();
    if (!notice) {
      return new Response(JSON.stringify({ success: false, message: "게시글을 찾을 수 없습니다." }), { status: 404 });
    }

    // 관리자이거나 비밀번호가 없거나 비밀번호가 일치하는 경우
    if (isAdmin || !notice.password || notice.password === password) {
      // 조회수 1 증가
      const newViews = (notice.views || 0) + 1;
      await env.DB.prepare("UPDATE Notices SET views = ? WHERE id = ?").bind(newViews, noticeId).run();

      return new Response(JSON.stringify({
        success: true,
        notice: {
          id: notice.id,
          category: notice.category,
          title: notice.title,
          author: notice.author,
          date: notice.date,
          views: newViews,
          content: notice.content,
          hasPassword: !!notice.password,
          isSecret: !!notice.isSecret,
          pinned: !!notice.pinned,
          answer: notice.answer,
          answeredAt: notice.answeredAt
        }
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: false, message: "비밀번호가 일치하지 않습니다." }), { status: 401 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}
