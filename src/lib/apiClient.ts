/**
 * Mdia Lab - Cloudflare D1 & Pages Functions API Client
 * 
 * Cloudflare Pages Functions (/api/auth, /api/videos, /api/activity)와 통신하는 전용 클라이언트
 * 네트워크 지연, 예외 및 에러 UI 메시지 처리 완비
 */

export interface D1User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'User';
  lastLoginAt?: string;
  createdAt?: string;
}

export interface D1Video {
  id: string;
  title: string;
  videoUrl: string;
  youtubeId?: string;
  category: string;
  client: string;
  year: string;
  description: string;
  runtime?: string;
  isFeatured?: boolean;
  createdAt?: string;
}

export interface ActivityPayload {
  userId?: string;
  actionType: 'LOGIN' | 'VIDEO_COMPLETE' | 'CATEGORY_CLICK' | 'SEARCH' | 'PAGE_VIEW';
  videoId?: string;
  categoryClicked?: string;
  loginTime?: string;
  metadata?: Record<string, any>;
}

// 로컬 스토리지에 임시 캐시된 사용자 세션 키
const USER_STORAGE_KEY = 'mdialab_d1_user';

export const apiClient = {
  // 1. 현재 로그인 사용자 가져오기
  getCurrentUser(): D1User | null {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  // 로컬 세션 저장
  setCurrentUser(user: D1User | null) {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  },

  // 2. /api/auth 로그인 처리 및 권한 조회
  async login(email: string, password?: string, name?: string): Promise<{ success: boolean; user?: D1User; message?: string }> {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || `로그인 요청 실패 (${res.status})`);
      }

      this.setCurrentUser(data.user);
      return { success: true, user: data.user, message: data.message };
    } catch (err: any) {
      console.error('[API Error: /api/auth]', err);
      return {
        success: false,
        message: err.message || '인증 서버와의 연결에 실패했습니다. 네트워크 상태를 확인해주세요.'
      };
    }
  },

  // 3. /api/videos 영상 목록 불러오기 (GET)
  async getVideos(): Promise<{ success: boolean; videos: D1Video[]; message?: string }> {
    try {
      const res = await fetch('/api/videos', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || `영상 목록 조회 실패 (${res.status})`);
      }

      return { success: true, videos: data.videos || [] };
    } catch (err: any) {
      console.error('[API Error: /api/videos GET]', err);
      return {
        success: false,
        videos: [],
        message: err.message || '영상 목록을 불러오는 중 통신 오류가 발생했습니다.'
      };
    }
  },

  // 4. /api/videos 관리자 영상 업로드 (POST)
  async uploadVideo(videoData: Partial<D1Video>, userRole: 'Admin' | 'User' = 'Admin'): Promise<{ success: boolean; video?: D1Video; message?: string }> {
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...videoData,
          userRole
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || `영상 등록 실패 (${res.status})`);
      }

      return { success: true, video: data.video, message: data.message };
    } catch (err: any) {
      console.error('[API Error: /api/videos POST]', err);
      return {
        success: false,
        message: err.message || '영상 업로드 중 네트워크 오류가 발생했습니다.'
      };
    }
  },

  // 5. /api/videos 영상 삭제 (DELETE)
  async deleteVideo(videoId: string, userRole: 'Admin' | 'User' = 'Admin'): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch(`/api/videos?id=${encodeURIComponent(videoId)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: videoId, userRole })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || `영상 삭제 실패 (${res.status})`);
      }

      return { success: true, message: data.message };
    } catch (err: any) {
      console.error('[API Error: /api/videos DELETE]', err);
      return {
        success: false,
        message: err.message || '영상 삭제 처리 중 오류가 발생했습니다.'
      };
    }
  },

  // 6. /api/activity 사용자 활동 로그 저장 (POST)
  async recordActivity(payload: ActivityPayload): Promise<{ success: boolean; logId?: string; message?: string }> {
    try {
      const currentUser = this.getCurrentUser();
      const userId = payload.userId || (currentUser ? currentUser.id : 'anonymous_guest');

      const res = await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          userId,
          loginTime: currentUser?.lastLoginAt || new Date().toISOString()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || `활동 로그 저장 실패 (${res.status})`);
      }

      return { success: true, logId: data.logId, message: data.message };
    } catch (err: any) {
      console.warn('[API Log Warning: /api/activity POST]', err.message);
      // 활동 로깅 실패는 UX를 중단시키지 않도록 조용히 반환
      return {
        success: false,
        message: err.message || '활동 로그 전송 실패'
      };
    }
  },

  // 7. /api/notices 게시글 목록 불러오기 (GET)
  async getNotices(): Promise<{ success: boolean; notices: any[]; message?: string }> {
    try {
      const res = await fetch('/api/notices', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !data.success) {
        throw new Error((data && data.message) || `게시글 목록 불러오기 실패 (${res.status})`);
      }

      return { success: true, notices: data.notices || [] };
    } catch (err: any) {
      console.error('[API Error: /api/notices GET]', err);
      return {
        success: false,
        notices: [],
        message: err.message || '게시글 목록을 불러오는 중 통신 오류가 발생했습니다.'
      };
    }
  },

  // 8. /api/notices 새 질문 또는 글 작성 (POST)
  async createNotice(postData: {
    category: string;
    title: string;
    author: string;
    content: string;
    password?: string;
    isSecret?: boolean;
  }): Promise<{ success: boolean; notice?: any; message?: string }> {
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !data.success) {
        throw new Error((data && data.message) || `게시글 등록 실패 (${res.status})`);
      }

      return { success: true, notice: data.notice, message: data.message };
    } catch (err: any) {
      console.error('[API Error: /api/notices POST]', err);
      return {
        success: false,
        message: err.message || '게시글 등록 중 통신 오류가 발생했습니다.'
      };
    }
  },

  // 9. /api/notices/:id/verify 비밀번호 확인 (POST)
  async verifyNoticePassword(noticeId: string, password?: string, isAdmin: boolean = false): Promise<{ success: boolean; notice?: any; message?: string }> {
    try {
      const res = await fetch(`/api/notices/${encodeURIComponent(noticeId)}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, isAdmin })
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !data.success) {
        throw new Error((data && data.message) || `비밀번호 확인 실패 (${res.status})`);
      }

      return { success: true, notice: data.notice };
    } catch (err: any) {
      console.error('[API Error: /api/notices/:id/verify POST]', err);
      return {
        success: false,
        message: err.message || '비밀번호 확인 중 오류가 발생했습니다.'
      };
    }
  },

  // 10. /api/notices/:id 게시글 삭제 (DELETE)
  async deleteNotice(noticeId: string, password?: string, isAdmin: boolean = false): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch(`/api/notices/${encodeURIComponent(noticeId)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, isAdmin })
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !data.success) {
        throw new Error((data && data.message) || `게시글 삭제 실패 (${res.status})`);
      }

      return { success: true, message: data.message };
    } catch (err: any) {
      console.error('[API Error: /api/notices/:id DELETE]', err);
      return {
        success: false,
        message: err.message || '게시글 삭제 처리 중 오류가 발생했습니다.'
      };
    }
  },

  // 11. /api/notices/:id/answer 답변 등록 (POST)
  async saveNoticeAnswer(noticeId: string, answer: string, isAdmin: boolean = true): Promise<{ success: boolean; notice?: any; message?: string }> {
    try {
      const res = await fetch(`/api/notices/${encodeURIComponent(noticeId)}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer, isAdmin })
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !data.success) {
        throw new Error((data && data.message) || `답변 등록 실패 (${res.status})`);
      }

      return { success: true, notice: data.notice, message: data.message };
    } catch (err: any) {
      console.error('[API Error: /api/notices/:id/answer POST]', err);
      return {
        success: false,
        message: err.message || '답변 등록 중 오류가 발생했습니다.'
      };
    }
  }
};
