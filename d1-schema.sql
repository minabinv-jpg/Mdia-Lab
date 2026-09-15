-- ====================================================================
-- Cloudflare D1 Database Schema for Mdia Lab
-- SQLite 3 compatible D1 Migration Script
-- ====================================================================

-- 1. Users: 사용자 정보 테이블 (ID, 권한(Admin/User), 가입일, 이름/이메일 등)
CREATE TABLE IF NOT EXISTS Users (
  id TEXT PRIMARY KEY,                       -- 고유 사용자 식별자 (예: user_xxx 또는 이메일)
  email TEXT NOT NULL UNIQUE,                -- 이메일 주소
  name TEXT DEFAULT '사용자',                 -- 사용자 표시 이름
  role TEXT NOT NULL DEFAULT 'User' CHECK(role IN ('Admin', 'User')), -- 권한 (Admin / User)
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 가입일시
  lastLoginAt DATETIME                       -- 최근 로그인 시간
);

-- 기본 관리자 계정 초기 시드 (필요시 활성화)
INSERT OR IGNORE INTO Users (id, email, name, role, createdAt)
VALUES ('admin-root', 'admin@mdialab.com', 'Mdia Lab 총괄디렉터', 'Admin', CURRENT_TIMESTAMP);

-- 2. Videos: 관리자가 업로드/관리하는 영상 정보 테이블 (영상 ID, URL, 업로드일자, 메타데이터)
CREATE TABLE IF NOT EXISTS Videos (
  id TEXT PRIMARY KEY,                       -- 영상 고유 ID (예: vid_xxx 또는 p1, p2)
  title TEXT NOT NULL,                       -- 영상 제목
  videoUrl TEXT NOT NULL,                    -- 영상 URL (유튜브 또는 스트리밍 링크)
  youtubeId TEXT,                            -- 유튜브 고유 ID (썸네일/플레이어용)
  category TEXT DEFAULT '광고/홍보영상',     -- 영상 카테고리
  client TEXT DEFAULT 'Mdia Lab',            -- 클라이언트 명
  year TEXT,                                 -- 제작 연도
  description TEXT,                          -- 설명 문구
  runtime TEXT DEFAULT '02:00',              -- 영상 길이
  isFeatured INTEGER DEFAULT 0,              -- 추천 영상 여부 (1 or 0)
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 업로드 일자
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- 수정 일자
);

-- 3. ActivityLogs: 일반 사용자의 활동 데이터 테이블
CREATE TABLE IF NOT EXISTS ActivityLogs (
  id TEXT PRIMARY KEY,                       -- 로그 고유 식별자
  userId TEXT NOT NULL,                      -- 활동 사용자 ID (미로그인시 익명 식별자)
  loginTime DATETIME,                        -- 로그인 시간 또는 세션 시작 시간
  videoId TEXT,                              -- 시청 완료하거나 감상한 영상 ID (Videos.id 참조)
  categoryClicked TEXT,                      -- 사용자가 탐색하거나 클릭한 카테고리
  actionType TEXT NOT NULL,                  -- 액션 종류 ('LOGIN', 'VIDEO_COMPLETE', 'CATEGORY_CLICK', 'SEARCH')
  metadata TEXT,                             -- 추가 상세 데이터 (JSON 형식)
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

-- 성능 최적화를 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_email ON Users(email);
CREATE INDEX IF NOT EXISTS idx_videos_category ON Videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_created ON Videos(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_activity_user ON ActivityLogs(userId);
CREATE INDEX IF NOT EXISTS idx_activity_action ON ActivityLogs(actionType);
CREATE INDEX IF NOT EXISTS idx_activity_created ON ActivityLogs(createdAt DESC);
