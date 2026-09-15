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

-- 4. Notices: 공지사항 및 방문자 질문답변(Q&A) 게시판 테이블
CREATE TABLE IF NOT EXISTS Notices (
  id TEXT PRIMARY KEY,                       -- 게시글 ID (예: notice-xxx)
  category TEXT NOT NULL DEFAULT '질문답변',  -- 카테고리 ('공지', '강의안내', '제작일기', '질문답변')
  title TEXT NOT NULL,                       -- 제목
  author TEXT NOT NULL DEFAULT '방문자',     -- 작성자 (방문자 또는 관리자)
  date TEXT NOT NULL,                        -- 작성일 (YYYY-MM-DD)
  views INTEGER NOT NULL DEFAULT 1,          -- 조회수
  content TEXT NOT NULL,                     -- 본문 내용
  password TEXT,                             -- 비밀번호 (비공개 글 잠금용)
  isSecret INTEGER NOT NULL DEFAULT 0,       -- 비밀글 여부 (1 or 0)
  pinned INTEGER NOT NULL DEFAULT 0,         -- 상단 고정 여부 (1 or 0)
  answer TEXT,                               -- 관리자 답변 내용
  answeredAt TEXT,                           -- 관리자 답변 일시
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 초기 공지사항 데이터 시드
INSERT OR IGNORE INTO Notices (id, category, title, author, date, views, content, isSecret, pinned, createdAt)
VALUES 
('notice-1', '공지', '[공지] 2026 Mdia Lab 공식 웹사이트 리뉴얼 및 견적 문의 안내', 'Mdia Lab 총괄디렉터', '2026-03-01', 128, '안녕하세요, Mdia Lab입니다. 2026년을 맞이하여 저희 공식 쇼릴과 함께 포트폴리오 웹사이트를 새롭게 개편하였습니다. 상업 광고 영상, 제품 홍보 영상, 기업 브랜디드 필름 등 다양한 프로젝트 문의는 견적 문의 폼 또는 이메일을 통해 언제든 편하게 접수해주시기 바랍니다.', 0, 1, CURRENT_TIMESTAMP),
('notice-2', '강의안내', '[강의] 시네마틱 영상 연출 & 색보정(Color Grading) 원데이 클래스 모집', 'Mdia Lab 교육팀', '2026-03-10', 85, '현업 시네마 카메라 운용 기법과 DaVinci Resolve를 활용한 감각적인 컬러그레이딩 실전 워크숍 인원을 모집합니다. 상세 커리큘럼은 워크숍 섹션을 확인해 주세요.', 0, 0, CURRENT_TIMESTAMP);

-- 성능 최적화를 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_email ON Users(email);
CREATE INDEX IF NOT EXISTS idx_videos_category ON Videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_created ON Videos(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_activity_user ON ActivityLogs(userId);
CREATE INDEX IF NOT EXISTS idx_activity_action ON ActivityLogs(actionType);
CREATE INDEX IF NOT EXISTS idx_activity_created ON ActivityLogs(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_notices_pinned ON Notices(pinned DESC, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_notices_category ON Notices(category);
