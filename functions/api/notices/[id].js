/**
 * Cloudflare Pages Functions - /api/notices/[id]
 * 개별 게시글 조회/수정/삭제 및 [id]/verify, [id]/answer 처리
 */

export async function onRequestGet(context) {
  const { params, env } = context;
  const noticeId = params.id;

  try {
    const notice = await env.DB.prepare(
      `SELECT id, category, title, author, date, views, content,
              (CASE WHEN password IS NOT NULL AND password != '' THEN 1 ELSE 0 END) as hasPassword,
              isSecret, pinned, answer, answeredAt, createdAt
       FROM Notices WHERE id = ?`
    ).bind(noticeId).first();

    if (!notice) {
      return new Response(JSON.stringify({ success: false, message: "게시글을 찾을 수 없습니다." }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      notice: {
        ...notice,
        pinned: !!notice.pinned,
        isSecret: !!notice.isSecret,
        hasPassword: !!notice.hasPassword
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestPut(context) {
  const { params, request, env } = context;
  const noticeId = params.id;

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ success: false, message: "올바르지 않은 본문입니다." }), { status: 400 });
  }

  const { title, content, category, pinned, isSecret, password, isAdmin } = body;

  try {
    const notice = await env.DB.prepare("SELECT * FROM Notices WHERE id = ?").bind(noticeId).first();
    if (!notice) {
      return new Response(JSON.stringify({ success: false, message: "게시글을 찾을 수 없습니다." }), { status: 404 });
    }

    // 비밀번호 또는 관리자 여부 검증
    if (!isAdmin && notice.password && notice.password !== password) {
      return new Response(JSON.stringify({ success: false, message: "수정 권한이 없거나 비밀번호가 일치하지 않습니다." }), { status: 401 });
    }

    const newTitle = title || notice.title;
    const newContent = content || notice.content;
    const newCategory = category || notice.category;
    const newPinned = typeof pinned === "boolean" ? (pinned ? 1 : 0) : notice.pinned;
    const newSecret = typeof isSecret === "boolean" ? (isSecret ? 1 : 0) : notice.isSecret;
    const newPassword = password !== undefined ? (password ? password.trim() : null) : notice.password;
    const nowIso = new Date().toISOString();

    await env.DB.prepare(
      `UPDATE Notices 
       SET title = ?, content = ?, category = ?, pinned = ?, isSecret = ?, password = ?, updatedAt = ?
       WHERE id = ?`
    )
      .bind(newTitle, newContent, newCategory, newPinned, newSecret, newPassword, nowIso, noticeId)
      .run();

    return new Response(JSON.stringify({
      success: true,
      notice: {
        id: noticeId,
        title: newTitle,
        content: newContent,
        category: newCategory,
        pinned: !!newPinned,
        isSecret: !!newSecret,
        hasPassword: !!newPassword,
        author: notice.author,
        date: notice.date,
        views: notice.views,
        answer: notice.answer,
        answeredAt: notice.answeredAt
      }
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}

export async function onRequestDelete(context) {
  const { params, request, env } = context;
  const noticeId = params.id;

  let body = {};
  try {
    body = await request.json();
  } catch (e) {}

  const { password, isAdmin } = body;

  try {
    const notice = await env.DB.prepare("SELECT password FROM Notices WHERE id = ?").bind(noticeId).first();
    if (!notice) {
      return new Response(JSON.stringify({ success: false, message: "게시글을 찾을 수 없습니다." }), { status: 404 });
    }

    if (isAdmin || !notice.password || notice.password === password) {
      await env.DB.prepare("DELETE FROM Notices WHERE id = ?").bind(noticeId).run();
      return new Response(JSON.stringify({ success: true, message: "게시글이 삭제되었습니다." }), { status: 200 });
    }

    return new Response(JSON.stringify({ success: false, message: "비밀번호가 일치하지 않습니다." }), { status: 401 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}
