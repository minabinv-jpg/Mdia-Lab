import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  User 
} from 'firebase/auth';
import { 
  X, Lock, Mail, ShieldCheck, LogOut, KeyRound, AlertCircle, 
  Inbox, Trash2, ExternalLink, Calendar, Phone, DollarSign, Film, MessageSquare
} from 'lucide-react';
import { 
  subscribeEstimates, 
  deleteEstimateFromFirestore, 
  EstimateDoc 
} from '../lib/firestoreService';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onNavigate?: (sectionId: string) => void;
}

const ADMIN_EMAIL = 'minabinv2@gmail.com';

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onNavigate
}) => {
  const [email, setEmail] = useState('minabinv2@gmail.com');
  const [password, setPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Admin Inquiries Tab state
  const [adminTab, setAdminTab] = useState<'overview' | 'inquiries'>('overview');
  const [estimates, setEstimates] = useState<EstimateDoc[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeEstimates((items) => {
      // Sort newest first
      const sorted = [...items].sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      setEstimates(sorted);
    });
    return () => unsubscribe();
  }, [currentUser]);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      let userCredential;
      if (isSignUpMode) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      const loggedInEmail = userCredential.user?.email;
      if (!loggedInEmail || loggedInEmail.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        await signOut(auth);
        alert('관리자 권한이 없습니다.');
        onClose();
        return;
      }

      onClose();
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        if (!isSignUpMode) {
          setErrorMsg("로그인 실패: 이메일 또는 비밀번호를 확인해 주세요.");
        } else {
          setErrorMsg("계정 생성 실패: 이메일 형식을 확인하거나 6자리 이상 비밀번호를 사용하세요.");
        }
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg("이미 등록된 이메일입니다. 로그인 모드로 시도해 주세요.");
      } else {
        setErrorMsg(err.message || "인증 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth with strict admin email verification
  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedInEmail = result.user?.email;

      // 엄격한 관리자 이메일 검증: minabinv2@gmail.com 만 승인
      if (!loggedInEmail || loggedInEmail.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        await signOut(auth);
        alert('관리자 권한이 없습니다.');
        onClose();
        return;
      }

      onClose();
    } catch (err: any) {
      console.error("Google Auth error:", err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg("Google 로그인 실패: 팝업 창 상태를 확인해 주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 견적 문의 데이터 영구 삭제 핸들러 (인라인 확인 연동)
  const executeDeleteEstimate = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteEstimateFromFirestore(id);
      // 로컬 상태 즉각 반영
      setEstimates(prev => prev.filter(item => item.id !== id));
      setDeleteSuccessMsg('견적 문의가 정상적으로 삭제되었습니다.');
      setTimeout(() => setDeleteSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to delete estimate:', err);
      alert('견적 문의 삭제 중 오류가 발생했습니다. 관리자 권한을 확인해 주세요.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onClose();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className={`bg-white rounded-2xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col ${
        currentUser ? (adminTab === 'inquiries' ? 'max-w-3xl' : 'max-w-lg') : 'max-w-md'
      }`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {currentUser ? (
          /* Already Logged In State */
          <div className="space-y-5 flex-1 flex flex-col min-h-0">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-[#0300b0] rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-neutral-900">
                      Mdia Lab 관리자 콘솔
                    </h3>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-50 text-[#0300b0] border border-blue-200 rounded">
                      AUTHORIZED
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 font-mono mt-0.5">
                    {currentUser.email || currentUser.displayName || 'Mdia Lab 총괄 관리자'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="로그아웃"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-neutral-200 gap-2">
              <button
                onClick={() => setAdminTab('overview')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
                  adminTab === 'overview'
                    ? 'border-[#0300b0] text-[#0300b0]'
                    : 'border-transparent text-gray-500 hover:text-neutral-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>관리 기능 및 바로가기</span>
              </button>

              <button
                onClick={() => setAdminTab('inquiries')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all cursor-pointer border-b-2 flex items-center gap-1.5 relative ${
                  adminTab === 'inquiries'
                    ? 'border-[#0300b0] text-[#0300b0]'
                    : 'border-transparent text-gray-500 hover:text-neutral-900'
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>실시간 견적 문의함</span>
                <span className="ml-1 px-1.5 py-0.2 bg-[#0300b0] text-white text-[10px] rounded-full font-mono">
                  {estimates.length}
                </span>
              </button>
            </div>

            {/* Tab 1: Overview & Quick Shortcuts */}
            {adminTab === 'overview' && (
              <div className="space-y-4 py-2 flex-1 overflow-y-auto pr-1">
                <div className="bg-neutral-50 p-4 rounded-xl text-xs text-neutral-700 border border-neutral-200 space-y-2.5">
                  <p className="font-bold text-neutral-900 flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-[#0300b0]" />
                    현재 활성화된 관리자 기능:
                  </p>
                  <ul className="space-y-1.5 text-neutral-600 pl-1">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0300b0]"></span>
                      <strong>히어로 대표 영상</strong>: 메인 화면 영상 우측 상단 '교체/수정' 클릭
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0300b0]"></span>
                      <strong>포트폴리오</strong>: 신규 동영상 등록(+), 기존 영상 수정 및 삭제 즉시 반영
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0300b0]"></span>
                      <strong>고객 후기 승인</strong>: 대기 중인 후기 공개/비공개 전환 및 삭제
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0300b0]"></span>
                      <strong>게시판 공식 답변</strong>: 고객 비밀글/질문에 공식 관리자 답변 등록
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0300b0]"></span>
                      <strong>상단 시네마 로고</strong>: 헤더 로고 클릭 시 로고 이미지 교체
                    </li>
                  </ul>
                </div>

                <div className="space-y-2 pt-1">
                  <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    관리 영역 바로가기
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => {
                        onClose();
                        if (onNavigate) onNavigate('portfolio');
                      }}
                      className="p-3 bg-white border border-neutral-200 rounded-xl hover:border-[#0300b0] hover:bg-blue-50/50 text-left transition-all cursor-pointer group"
                    >
                      <Film className="w-4 h-4 text-neutral-800 mb-1.5 group-hover:text-[#0300b0]" />
                      <p className="font-bold text-neutral-900">포트폴리오 관리</p>
                      <p className="text-[10px] text-neutral-500">영상 등록/수정/삭제</p>
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        if (onNavigate) onNavigate('testimonials');
                      }}
                      className="p-3 bg-white border border-neutral-200 rounded-xl hover:border-[#0300b0] hover:bg-blue-50/50 text-left transition-all cursor-pointer group"
                    >
                      <MessageSquare className="w-4 h-4 text-neutral-800 mb-1.5 group-hover:text-[#0300b0]" />
                      <p className="font-bold text-neutral-900">고객 후기 승인</p>
                      <p className="text-[10px] text-neutral-500">대기 후기 심사 및 공개</p>
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        if (onNavigate) onNavigate('bulletin-board');
                      }}
                      className="p-3 bg-white border border-neutral-200 rounded-xl hover:border-[#0300b0] hover:bg-blue-50/50 text-left transition-all cursor-pointer group"
                    >
                      <Calendar className="w-4 h-4 text-neutral-800 mb-1.5 group-hover:text-[#0300b0]" />
                      <p className="font-bold text-neutral-900">게시판 관리</p>
                      <p className="text-[10px] text-neutral-500">공지 작성 및 Q&A 답변</p>
                    </button>

                    <button
                      onClick={() => {
                        setAdminTab('inquiries');
                      }}
                      className="p-3 bg-[#0300b0]/5 border border-[#0300b0]/30 rounded-xl hover:bg-[#0300b0]/10 text-left transition-all cursor-pointer group"
                    >
                      <Inbox className="w-4 h-4 text-[#0300b0] mb-1.5" />
                      <p className="font-bold text-[#0300b0]">견적 문의 접수함</p>
                      <p className="text-[10px] text-neutral-600">{estimates.length}건 대기 중</p>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    관리창 닫기
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Live Inquiries Box */}
            {adminTab === 'inquiries' && (
              <div className="flex-1 flex flex-col min-h-0 overflow-y-auto space-y-3 pr-1">
                {deleteSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-bold flex items-center justify-between animate-in fade-in">
                    <span>✓ {deleteSuccessMsg}</span>
                    <button onClick={() => setDeleteSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-800">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {estimates.length === 0 ? (
                  <div className="text-center py-12 text-neutral-400 space-y-2">
                    <Inbox className="w-10 h-10 mx-auto opacity-40" />
                    <p className="text-xs">접수된 견적 문의가 아직 없습니다.</p>
                  </div>
                ) : (
                  estimates.map((est) => (
                    <div
                      key={est.id || est.createdAt}
                      className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3 relative text-xs hover:border-neutral-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-neutral-200 pb-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-neutral-900">
                              {est.name}
                            </span>
                            <span className="px-2 py-0.5 bg-blue-100 text-[#0300b0] rounded text-[11px] font-medium">
                              {est.category}
                            </span>
                            <span className="text-[11px] text-neutral-400 font-mono">
                              {est.createdAt ? new Date(est.createdAt).toLocaleString('ko-KR') : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-neutral-600 mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-neutral-400" />
                              <a href={`tel:${est.phone}`} className="hover:underline text-neutral-800">{est.phone}</a>
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-neutral-400" />
                              <a href={`mailto:${est.email}`} className="hover:underline text-neutral-800">{est.email}</a>
                            </span>
                          </div>
                        </div>

                        {/* 견적 문의 삭제 버튼 (활성화 및 즉각 연동) */}
                        <div className="shrink-0">
                          {confirmDeleteId === est.id ? (
                            <div className="flex items-center gap-1.5 animate-in fade-in">
                              <span className="text-[11px] text-red-600 font-bold hidden sm:inline">삭제할까요?</span>
                              <button
                                onClick={() => est.id && executeDeleteEstimate(est.id)}
                                disabled={deletingId === est.id}
                                className="px-2.5 py-1 bg-red-600 text-white text-[11px] font-bold rounded-md hover:bg-red-700 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                              >
                                {deletingId === est.id ? "삭제 중..." : "확인"}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                disabled={deletingId === est.id}
                                className="px-2 py-1 bg-neutral-200 text-neutral-700 text-[11px] font-medium rounded-md hover:bg-neutral-300 transition-colors cursor-pointer"
                              >
                                취소
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => est.id && setConfirmDeleteId(est.id)}
                              disabled={deletingId === est.id}
                              className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white rounded-md text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                              title="견적 문의 영구 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>문의 삭제</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-lg border border-neutral-100">
                        <div>
                          <span className="text-neutral-400 block font-medium">예산 범위</span>
                          <span className="text-neutral-800 font-semibold">{est.budget}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block font-medium">희망 일정</span>
                          <span className="text-neutral-800 font-semibold">{est.timeline}</span>
                        </div>
                      </div>

                      {est.youtubeRef && (
                        <div className="text-[11px] flex items-center gap-1.5 text-neutral-600 bg-white px-2.5 py-1.5 rounded border border-neutral-100">
                          <span className="text-neutral-400">참고 영상:</span>
                          <a
                            href={est.youtubeRef}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0300b0] hover:underline truncate flex items-center gap-1"
                          >
                            <span className="truncate max-w-xs">{est.youtubeRef}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      )}

                      <div className="bg-white p-3 rounded-lg border border-neutral-100">
                        <span className="text-neutral-400 text-[10px] block mb-1 font-medium">문의 내용</span>
                        <p className="text-neutral-800 whitespace-pre-wrap leading-relaxed">
                          {est.message}
                        </p>
                      </div>

                      {est.filesCount && est.filesCount > 0 && (
                        <p className="text-[11px] text-neutral-500">
                          📎 첨부된 기획 파일: <strong>{est.filesCount}개</strong>
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          /* Login Form State */
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 bg-neutral-100 text-neutral-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6 text-[#0300b0]" />
              </div>
              <h3 className="text-xl font-extrabold text-neutral-900">
                Mdia Lab 관리자 로그인
              </h3>
              <p className="text-xs text-neutral-500">
                동영상 삭제/등록 및 견적 문의 관리를 위한 관리자 인증입니다.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  관리자 이메일
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="minabinv2@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0300b0] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  비밀번호
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호 입력"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0300b0] focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: '#0300b0' }}
                className="w-full py-3.5 text-white text-xs font-bold tracking-wider uppercase rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {loading ? "인증 처리 중..." : (isSignUpMode ? "관리자 계정 만들기" : "관리자 로그인")}
              </button>
            </form>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-gray-200 w-full"></div>
              <span className="bg-white px-3 text-[11px] text-gray-400 font-mono">OR</span>
            </div>

            {/* Google Login Button */}
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full py-3 bg-white text-gray-700 border border-gray-300 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google 계정으로 관리자 로그인</span>
            </button>

            <div className="flex justify-between items-center text-xs text-neutral-500 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsSignUpMode(!isSignUpMode)}
                className="text-[#0300b0] font-bold hover:underline"
              >
                {isSignUpMode ? "기존 관리자 계정으로 로그인" : "신규 관리자 계정 생성"}
              </button>

              <span className="text-[10px] text-gray-400 font-mono">
                Firebase Secure Auth
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
