import React, { useState, useEffect } from 'react';
import { NoticeItem } from '../types';
import { 
  MessageSquare, Pin, Eye, Plus, Search, Calendar, User, X, Check, 
  FileText, Lock, KeyRound, Trash2, ShieldCheck, CornerDownRight, MessageCircleQuestion,
  Edit, ShieldAlert
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface BoardNoticeProps {
  currentUser?: FirebaseUser | null;
  onOpenAdminAuth?: () => void;
}

export const BoardNotice: React.FC<BoardNoticeProps> = ({ currentUser, onOpenAdminAuth }) => {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);

  // Password Verification Modal State
  const [pendingNotice, setPendingNotice] = useState<NoticeItem | null>(null);
  const [enteredPassword, setEnteredPassword] = useState<string>('');
  const [verifyError, setVerifyError] = useState<string>('');
  const [verifying, setVerifying] = useState<boolean>(false);

  // Cache for verified passwords in current browser session
  const [sessionPasswords, setSessionPasswords] = useState<Record<string, string>>({});

  // New post form state
  const [newCategory, setNewCategory] = useState<"공지" | "강의안내" | "제작일기" | "질문답변">('질문답변');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newAuthor, setNewAuthor] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newIsSecret, setNewIsSecret] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Edit post form state
  const [editCategory, setEditCategory] = useState<"공지" | "강의안내" | "제작일기" | "질문답변">('질문답변');
  const [editTitle, setEditTitle] = useState<string>('');
  const [editContent, setEditContent] = useState<string>('');
  const [editPassword, setEditPassword] = useState<string>('');
  const [editIsSecret, setEditIsSecret] = useState<boolean>(true);
  const [editPinned, setEditPinned] = useState<boolean>(false);

  // Admin Answer State
  const [adminAnswer, setAdminAnswer] = useState<string>('');
  const [submittingAnswer, setSubmittingAnswer] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await fetch('/api/notices');
      const data = await res.json();
      if (data.success) {
        setNotices(data.notices);
      }
    } catch (e) {
      console.error('Failed to fetch notices:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    if (!currentUser) {
      setNewCategory('질문답변');
      setNewIsSecret(true);
    }
    setShowCreateModal(true);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    // Validation for regular users
    if (!currentUser) {
      if (!newPassword.trim()) {
        alert("질문답변 글 작성을 위해 비밀번호를 입력해주세요.\n입력하신 비밀번호로 작성된 질문과 답변을 확인하실 수 있습니다.");
        return;
      }
    }

    const postCategory = currentUser ? newCategory : '질문답변';
    const postSecret = currentUser ? newIsSecret : true;

    setSubmitting(true);
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: postCategory,
          title: newTitle,
          author: newAuthor || '방문자',
          content: newContent,
          password: newPassword || undefined,
          isSecret: postSecret
        })
      });
      const data = await res.json();
      if (data.success) {
        setNotices([data.notice, ...notices]);
        setNewTitle('');
        setNewAuthor('');
        setNewContent('');
        setNewPassword('');
        setNewIsSecret(true);
        setShowCreateModal(false);
        alert(currentUser ? "게시글이 성공적으로 등록되었습니다." : "질문답변 게시글이 비밀글로 성공적으로 등록되었습니다.");
      }
    } catch (e) {
      console.error('Failed to create post:', e);
      alert("게시글 등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditModal = (notice: NoticeItem) => {
    setEditingNotice(notice);
    setEditCategory(notice.category);
    setEditTitle(notice.title);
    setEditContent(notice.content);
    setEditIsSecret(notice.isSecret || notice.hasPassword);
    setEditPinned(!!notice.pinned);
    setEditPassword('');
    setShowEditModal(true);
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotice || !editTitle.trim() || !editContent.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/notices/${editingNotice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          category: editCategory,
          pinned: editPinned,
          isSecret: editIsSecret,
          password: editPassword || undefined,
          isAdmin: !!currentUser
        })
      });
      const data = await res.json();
      if (data.success) {
        setNotices(prev => prev.map(n => n.id === editingNotice.id ? data.notice : n));
        setSelectedNotice(data.notice);
        setShowEditModal(false);
        setEditingNotice(null);
        alert("게시글이 성공적으로 수정되었습니다.");
      } else {
        alert(data.message || "게시글 수정에 실패했습니다.");
      }
    } catch (e) {
      console.error('Failed to update post:', e);
      alert("게시글 수정 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const verifyAndOpen = async (notice: NoticeItem, pwd?: string, isAdminOverride?: boolean) => {
    setVerifying(true);
    setVerifyError('');
    try {
      const res = await fetch(`/api/notices/${notice.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd, isAdmin: isAdminOverride || !!currentUser })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedNotice(data.notice);
        if (pwd) {
          setSessionPasswords(prev => ({ ...prev, [notice.id]: pwd }));
        }
        setPendingNotice(null);
        setAdminAnswer(data.notice.answer || '');
      } else {
        setVerifyError(data.message || '비밀번호가 일치하지 않습니다.');
      }
    } catch (e) {
      setVerifyError('비밀번호 검증 중 오류가 발생했습니다.');
    } finally {
      setVerifying(false);
    }
  };

  const handleNoticeClick = (notice: NoticeItem) => {
    // If user is Admin or post has no password/secret OR user already verified password in session:
    if (currentUser) {
      verifyAndOpen(notice, undefined, true);
    } else if (sessionPasswords[notice.id]) {
      verifyAndOpen(notice, sessionPasswords[notice.id]);
    } else if (!notice.hasPassword && !notice.isSecret) {
      verifyAndOpen(notice, undefined, false);
    } else {
      // Prompt password modal
      setPendingNotice(notice);
      setEnteredPassword('');
      setVerifyError('');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingNotice || !enteredPassword) return;
    verifyAndOpen(pendingNotice, enteredPassword);
  };

  const handleDeleteNotice = async (notice: NoticeItem) => {
    if (!window.confirm(`[${notice.title}] 게시글을 삭제하시겠습니까?`)) return;

    const cachedPwd = sessionPasswords[notice.id];
    setDeleting(true);
    try {
      const res = await fetch(`/api/notices/${notice.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: cachedPwd,
          isAdmin: !!currentUser
        })
      });
      const data = await res.json();
      if (data.success) {
        setNotices(prev => prev.filter(n => n.id !== notice.id));
        setSelectedNotice(null);
        alert("게시글이 삭제되었습니다.");
      } else {
        alert(data.message || "삭제 실패: 비밀번호가 일치하지 않습니다.");
      }
    } catch (e) {
      console.error("Delete error:", e);
      alert("삭제 처리 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveAnswer = async (noticeId: string) => {
    if (!adminAnswer.trim()) return;
    setSubmittingAnswer(true);
    try {
      const res = await fetch(`/api/notices/${noticeId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer: adminAnswer,
          isAdmin: true
        })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedNotice(data.notice);
        setNotices(prev => prev.map(n => n.id === noticeId ? { ...n, answer: data.notice.answer, answeredAt: data.notice.answeredAt } : n));
        alert("답변이 정상적으로 등록되었습니다.");
      } else {
        alert(data.message || "답변 등록 권한이 없거나 처리 실패했습니다.");
      }
    } catch (e) {
      console.error("Save answer error:", e);
      alert("답변 저장 중 오류가 발생했습니다.");
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const categories = ['전체', '공지', '강의안내', '제작일기', '질문답변'];

  const filteredNotices = notices.filter((item) => {
    const matchesCategory = activeTab === '전체' || item.category === activeTab;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="bulletin-board" className="py-20 bg-[#F5F5F5] border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-400 tracking-[0.3em] uppercase block">
              COMMUNITY & NOTICE
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
              공지사항 & 질문 게시판
            </h2>
            <p className="text-base text-gray-500">
              Mdia Lab의 최근 스튜디오 소식, 영상 제작 안내 및 비밀번호 설정 기반 질문/답변 공간입니다.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            style={{ backgroundColor: '#0300b0' }}
            className="inline-flex items-center gap-2 px-6 py-3.5 text-white text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-opacity cursor-pointer shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>새 질문 / 글 작성하기</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center mb-6 bg-white p-4 border border-[#E5E5E5] rounded-xl">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-4 py-2 text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                  activeTab === cat
                    ? 'bg-[#1A1A1A] text-white'
                    : 'bg-[#F5F5F5] text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="게시글 제목, 내용 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F5F5F5] border border-[#E5E5E5] rounded-md focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>
        </div>

        {/* Board Table List View */}
        <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F5F5] border-b border-[#E5E5E5] text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-24 text-center">분류</th>
                  <th className="py-3.5 px-4">제목</th>
                  <th className="py-3.5 px-4 w-32">작성자</th>
                  <th className="py-3.5 px-4 w-28 text-center">작성일</th>
                  <th className="py-3.5 px-4 w-20 text-center">조회</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      게시글 목록을 불러오는 중입니다...
                    </td>
                  </tr>
                ) : filteredNotices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      등록된 게시글이 없습니다. 첫 번째 글을 남겨보세요!
                    </td>
                  </tr>
                ) : (
                  filteredNotices.map((notice) => (
                    <tr
                      key={notice.id}
                      onClick={() => handleNoticeClick(notice)}
                      className={`hover:bg-[#F5F5F5] transition-colors cursor-pointer ${
                        notice.pinned ? 'bg-amber-50/40 font-semibold' : ''
                      }`}
                    >
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider ${
                            notice.category === '공지'
                              ? 'bg-[#1A1A1A] text-white'
                              : 'bg-[#F5F5F5] text-gray-700 border border-[#E5E5E5]'
                          }`}
                        >
                          {notice.category}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-bold text-[#1A1A1A] hover:underline">
                        <div className="flex items-center gap-2">
                          {notice.pinned && <Pin className="w-3.5 h-3.5 text-amber-600 shrink-0 fill-amber-500" />}
                          {(notice.isSecret || notice.hasPassword) && (
                            <div className="flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5 text-[#0300b0] shrink-0" title="비밀글 (비밀번호 입력 후 조회)" />
                              {currentUser && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded shrink-0">
                                  관리자 즉시열람
                                </span>
                              )}
                            </div>
                          )}
                          <span className="line-clamp-1">{notice.title}</span>
                          {notice.answer && (
                            <span className="text-[10px] font-normal px-2 py-0.5 bg-blue-50 text-[#0300b0] border border-blue-200 rounded shrink-0">
                              답변완료
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-gray-600 font-normal">
                        {notice.author}
                      </td>

                      <td className="py-4 px-4 text-center text-gray-400 font-mono text-[11px]">
                        {notice.date}
                      </td>

                      <td className="py-4 px-4 text-center text-gray-400 font-mono text-[11px]">
                        {notice.views}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Password Prompt Modal for Secret Post */}
      {pendingNotice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#0300b0]" />
                <span>비밀글 확인 (비밀번호 입력)</span>
              </h3>
              <button onClick={() => setPendingNotice(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
              [<strong>{pendingNotice.title}</strong>]<br />
              작성 시 설정하신 비밀번호를 입력하시면 질문 내용 및 답변을 확인하실 수 있습니다.
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-gray-500" />
                  <span>비밀번호</span>
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="작성 시 입력한 비밀번호"
                  value={enteredPassword}
                  onChange={(e) => setEnteredPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#0300b0] font-mono"
                />
              </div>

              {verifyError && (
                <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                  ⚠️ {verifyError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setPendingNotice(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={verifying}
                  style={{ backgroundColor: '#0300b0' }}
                  className="px-5 py-2 text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                >
                  {verifying ? '확인 중...' : '비밀번호 확인 및 조회'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Read Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto text-left">
            <div className="flex justify-between items-start mb-4 border-b border-neutral-200 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-2.5 py-1 bg-neutral-900 text-white rounded font-mono inline-block">
                    {selectedNotice.category}
                  </span>
                  {(selectedNotice.isSecret || selectedNotice.hasPassword) && (
                    <span className="text-xs font-bold px-2 py-0.5 bg-blue-50 text-[#0300b0] border border-blue-200 rounded flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>비밀글 보호됨</span>
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-neutral-900 leading-snug">
                  {selectedNotice.title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-neutral-500 mt-2">
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {selectedNotice.author}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {selectedNotice.date}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> 조회수 {selectedNotice.views}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Post Content Body */}
            <div className="py-4 text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap font-sans bg-gray-50/60 p-4 rounded-xl border border-gray-100">
              {selectedNotice.content}
            </div>

            {/* Answer Section */}
            {selectedNotice.answer && (
              <div className="mt-6 p-4 bg-blue-50/70 border border-blue-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#0300b0] flex items-center gap-1.5">
                    <CornerDownRight className="w-4 h-4" />
                    <span>Mdia Lab 공식 답변</span>
                  </span>
                  {selectedNotice.answeredAt && (
                    <span className="text-[10px] text-gray-500 font-mono">{selectedNotice.answeredAt}</span>
                  )}
                </div>
                <p className="text-xs text-neutral-800 leading-relaxed whitespace-pre-wrap font-sans pl-5 border-l-2 border-[#0300b0]">
                  {selectedNotice.answer}
                </p>
              </div>
            )}

            {/* Admin Answer Editor Section */}
            {currentUser && (
              <div className="mt-6 p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <ShieldCheck className="w-4 h-4 text-[#0300b0]" />
                    <span>관리자 전용 답변 등록 / 수정</span>
                  </div>
                  <span className="text-[10px] text-amber-700 font-medium">
                    (질문자가 작성시 입력한 동일 비밀번호로 보호됨)
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-tight">
                  💡 등록하신 답변은 작성자가 질문을 남길 때 설정한 비밀번호로 동일하게 보호됩니다. 방문자가 비밀번호를 입력하면 질문 본문과 본 답변을 함께 확인할 수 있습니다.
                </p>
                <textarea
                  rows={3}
                  value={adminAnswer}
                  onChange={(e) => setAdminAnswer(e.target.value)}
                  placeholder="질문에 대한 Mdia Lab 공식 답변을 입력하세요..."
                  className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none focus:border-[#0300b0]"
                ></textarea>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleSaveAnswer(selectedNotice.id)}
                    disabled={submittingAnswer}
                    style={{ backgroundColor: '#0300b0' }}
                    className="px-4 py-2 text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    {submittingAnswer ? '답변 저장 중...' : '답변 등록 완료'}
                  </button>
                </div>
              </div>
            )}

            {/* Action Bar (Edit, Delete and Close) */}
            <div className="mt-8 pt-4 border-t border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentUser && (
                  <button
                    onClick={() => handleOpenEditModal(selectedNotice)}
                    className="px-4 py-2 bg-blue-50 text-[#0300b0] border border-blue-200 text-xs font-bold rounded-lg hover:bg-blue-100 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>게시글 수정하기</span>
                  </button>
                )}

                <button
                  onClick={() => handleDeleteNotice(selectedNotice)}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-100 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{deleting ? "삭제 중..." : "게시글 삭제하기"}</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedNotice(null)}
                className="px-5 py-2 bg-neutral-900 text-white text-xs font-bold rounded-lg hover:bg-neutral-800 cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 text-left animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <MessageCircleQuestion className="w-5 h-5 text-[#0300b0]" />
                <span>새 질문 / 글 작성하기</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Admin vs Visitor Info Notice */}
            {currentUser ? (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>관리자 로그인 상태: 공지사항, 강의안내, 제작일기, 질문답변 모든 카테고리에서 작성 가능합니다.</span>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2 text-xs font-bold text-[#0300b0]">
                <Lock className="w-4 h-4 text-[#0300b0] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  일반 방문자는 <strong>[질문답변]</strong> 카테고리만 <strong>비밀글</strong>로 작성하실 수 있습니다. 설정하신 비밀번호로 질문 내용과 관리자의 답변을 확인하실 수 있습니다.
                </span>
              </div>
            )}

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">카테고리</label>
                  {currentUser ? (
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0300b0] bg-white cursor-pointer"
                    >
                      <option value="질문답변">질문답변</option>
                      <option value="제작일기">제작일기</option>
                      <option value="강의안내">강의안내</option>
                      <option value="공지">공지사항</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled
                      value="질문답변 (비밀글전용)"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-gray-100 font-bold text-[#0300b0]"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">작성자 성함 / 소속</label>
                  <input
                    type="text"
                    placeholder="이름 또는 기업명"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0300b0]"
                  />
                </div>
              </div>

              {/* Password & Secret Toggle */}
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      disabled={!currentUser}
                      checked={currentUser ? newIsSecret : true}
                      onChange={(e) => setNewIsSecret(e.target.checked)}
                      className="w-4 h-4 text-[#0300b0] rounded focus:ring-0 cursor-pointer"
                    />
                    <Lock className="w-3.5 h-3.5 text-[#0300b0]" />
                    <span>비밀글로 작성 {!currentUser && '(일반 사용자 자동 적용)'}</span>
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1 flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-[#0300b0]" />
                    <span>비밀번호 {!currentUser ? <strong className="text-red-500">(필수 *)</strong> : '(선택)'}</span>
                  </label>
                  <input
                    type="password"
                    required={!currentUser}
                    placeholder="조회 및 답변 확인용 비밀번호 4자리 이상"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0300b0] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="제목을 입력하세요"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0300b0]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="궁금하신 내용이나 영상 제작 관련 문의글을 남겨주시면 담당자가 동일한 비밀번호 기반의 비밀 답변을 등록해 드립니다."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0300b0]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-neutral-100 text-neutral-700 text-xs font-bold rounded-lg hover:bg-neutral-200 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ backgroundColor: '#0300b0' }}
                  className="px-5 py-2 text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                >
                  {submitting ? '등록 중...' : '게시글 등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Post Modal (Admin / User) */}
      {showEditModal && editingNotice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 text-left animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#0300b0]" />
                <span>게시글 수정 (관리자)</span>
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePost} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">카테고리</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0300b0] bg-white cursor-pointer"
                  >
                    <option value="질문답변">질문답변</option>
                    <option value="제작일기">제작일기</option>
                    <option value="강의안내">강의안내</option>
                    <option value="공지">공지사항</option>
                  </select>
                </div>

                <div className="flex items-center gap-4 pt-5">
                  <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPinned}
                      onChange={(e) => setEditPinned(e.target.checked)}
                      className="w-4 h-4 text-[#0300b0] rounded focus:ring-0 cursor-pointer"
                    />
                    <Pin className="w-3.5 h-3.5 text-amber-600" />
                    <span>상단 고정 공지</span>
                  </label>

                  <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editIsSecret}
                      onChange={(e) => setEditIsSecret(e.target.checked)}
                      className="w-4 h-4 text-[#0300b0] rounded focus:ring-0 cursor-pointer"
                    />
                    <Lock className="w-3.5 h-3.5 text-[#0300b0]" />
                    <span>비밀글 보호</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0300b0]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0300b0]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-neutral-100 text-neutral-700 text-xs font-bold rounded-lg hover:bg-neutral-200 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ backgroundColor: '#0300b0' }}
                  className="px-5 py-2 text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                >
                  {submitting ? '수정 중...' : '게시글 수정 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
};

