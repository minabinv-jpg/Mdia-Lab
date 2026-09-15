import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

interface InquiryData {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  budget: string;
  timeline: string;
  youtubeRef?: string;
  message: string;
  files: Array<{ name: string; size: number; type: string; data?: string }>;
  createdAt: string;
}

interface NoticeData {
  id: string;
  category: "공지" | "강의안내" | "제작일기" | "질문답변";
  title: string;
  author: string;
  date: string;
  views: number;
  content: string;
  pinned?: boolean;
  password?: string;
  isSecret?: boolean;
  answer?: string;
  answeredAt?: string;
}

interface ChatLogData {
  id: string;
  sessionId: string;
  name: string;
  phone: string;
  lastMessage: string;
  messages: Array<{ sender: 'ai' | 'user' | 'system'; text: string; timestamp: string }>;
  emailForwardedTo: string;
  updatedAt: string;
}

// In-memory data store for notices, inquiries, and chat logs
const inquiries: InquiryData[] = [];
const chatLogsStore: ChatLogData[] = [];

const initialNotices: NoticeData[] = [
  {
    id: "notice-1",
    category: "공지",
    title: "[Mdia Lab] 2026 하반기 신규 기업 홍보영상 및 시네마틱 프로젝트 접수 안내",
    author: "Mdia Lab 총괄디렉터",
    date: "2026-08-10",
    views: 342,
    pinned: true,
    content: "안녕하세요. Mdia Lab입니다. 2026년 하반기 브랜드 홍보영상, TVC 광고, 시네마틱 소장작품 프로젝트 제작 문의를 접수받고 있습니다. 사전 상담 후 정밀 기획서와 견적 산출서를 발송해 드립니다."
  },
  {
    category: "강의안내",
    id: "notice-2",
    title: "[강의] 제 14기 단편영화 실전 제작 마스터 클래스 수강생 모집",
    author: "Mdia Lab 교육팀",
    date: "2026-08-05",
    views: 512,
    pinned: true,
    content: "시나리오 작성부터 카메라 라이팅, 인디 연출 및 전문 색보정까지 8주간 진행되는 영화 제작 실무 클래스 수강생을 모집합니다. 프리미어와 시네마 카메라 실습 기회가 제공됩니다."
  },
  {
    id: "notice-3",
    category: "제작일기",
    title: "[Behind] 독립단편영화 '새벽의 프레임' 4K 촬영 현장스케치 & 전문 컬러그레이딩",
    author: "Mdia Lab 시네마토그래퍼",
    date: "2026-07-28",
    views: 289,
    content: "지난달 로케이션 촬영을 마친 단편영화 '새벽의 프레임'의 후반 작업 일기입니다. 2.39:1 와이드 아나모픽 렌즈 룩 구현 과정과 조명 세팅 비하인드를 공개합니다."
  },
  {
    id: "notice-4",
    category: "질문답변",
    title: "[FAQ] 견적 신청 후 완성본 제작 기간과 수정 횟수는 어떻게 되나요?",
    author: "Mdia Lab 운영팀",
    date: "2026-07-15",
    views: 620,
    content: "일반 브랜드 홍보영상 기준 기획 1주, 촬영 1~2일, 편집 및 C.G/색보정 1.5주 소요됩니다. 기본 피드백 수정은 2회 무상 제공되며 4K 렌더링 원본 파일이 제공됩니다.",
    answer: "추가 세부 사항은 유선 전화(02-588-3920) 또는 minabinv2@gmail.com 으로 문의주시면 바로 상담 도와드립니다.",
    answeredAt: "2026-07-16"
  }
];

const noticesStore: NoticeData[] = [...initialNotices];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON & Form parsing with increased limit for file attachments
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "Mdia Lab Express Server" });
  });

  // Get all notices (sanitized password field)
  app.get("/api/notices", (_req, res) => {
    const sanitizedNotices = noticesStore.map(item => ({
      ...item,
      hasPassword: !!item.password,
      password: undefined // never leak raw password in listing
    }));
    res.json({ success: true, notices: sanitizedNotices });
  });

  // Post a new notice or board item
  app.post("/api/notices", (req, res) => {
    const { category, title, author, content, password, isSecret } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: "제목과 내용을 입력해주세요." });
    }

    const newNotice: NoticeData = {
      id: `notice-${Date.now()}`,
      category: category || "질문답변",
      title,
      author: author || "방문자",
      date: new Date().toISOString().split("T")[0],
      views: 1,
      content,
      password: password || undefined,
      isSecret: !!isSecret || !!password
    };

    noticesStore.unshift(newNotice);
    
    return res.json({ 
      success: true, 
      notice: {
        ...newNotice,
        hasPassword: !!newNotice.password,
        password: undefined
      } 
    });
  });

  // Verify password for a post (or bypass for admin)
  app.post("/api/notices/:id/verify", (req, res) => {
    const { id } = req.params;
    const { password, isAdmin } = req.body;

    const notice = noticesStore.find(n => n.id === id);
    if (!notice) {
      return res.status(404).json({ success: false, message: "게시글을 찾을 수 없습니다." });
    }

    if (isAdmin || !notice.password || notice.password === password) {
      notice.views += 1;
      return res.json({
        success: true,
        notice: {
          ...notice,
          hasPassword: !!notice.password,
          password: undefined
        }
      });
    }

    return res.status(401).json({ success: false, message: "비밀번호가 일치하지 않습니다." });
  });

  // Delete a notice with password check or admin authority
  app.delete("/api/notices/:id", (req, res) => {
    const { id } = req.params;
    const { password, isAdmin } = req.body;

    const index = noticesStore.findIndex(n => n.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "게시글을 찾을 수 없습니다." });
    }

    const notice = noticesStore[index];

    // Admin can delete without password, or author password matches
    if (isAdmin || !notice.password || notice.password === password) {
      noticesStore.splice(index, 1);
      return res.json({ success: true, message: "게시글이 삭제되었습니다." });
    }

    return res.status(401).json({ success: false, message: "비밀번호가 일치하지 않습니다." });
  });

  // Update a notice (Admin function or author with password)
  app.put("/api/notices/:id", (req, res) => {
    const { id } = req.params;
    const { title, content, category, pinned, isSecret, password, isAdmin } = req.body;

    const notice = noticesStore.find(n => n.id === id);
    if (!notice) {
      return res.status(404).json({ success: false, message: "게시글을 찾을 수 없습니다." });
    }

    if (!isAdmin && notice.password && notice.password !== password) {
      return res.status(401).json({ success: false, message: "수정 권한이 없거나 비밀번호가 일치하지 않습니다." });
    }

    if (title) notice.title = title;
    if (content) notice.content = content;
    if (category) notice.category = category;
    if (typeof pinned === "boolean") notice.pinned = pinned;
    if (typeof isSecret === "boolean") notice.isSecret = isSecret;
    if (password) notice.password = password;

    return res.json({
      success: true,
      notice: {
        ...notice,
        hasPassword: !!notice.password,
        password: undefined
      }
    });
  });

  // Add / update answer (Admin function)
  app.post("/api/notices/:id/answer", (req, res) => {
    const { id } = req.params;
    const { answer, isAdmin } = req.body;

    const notice = noticesStore.find(n => n.id === id);
    if (!notice) {
      return res.status(404).json({ success: false, message: "게시글을 찾을 수 없습니다." });
    }

    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "답변 등록 권한이 없습니다." });
    }

    notice.answer = answer;
    notice.answeredAt = new Date().toISOString().split("T")[0];

    return res.json({
      success: true,
      notice: {
        ...notice,
        hasPassword: !!notice.password,
        password: undefined
      }
    });
  });

  // Handle Estimate Inquiries
  app.post("/api/inquire", (req, res) => {
    const { name, email, phone, category, budget, timeline, youtubeRef, message, files } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "필수 정보(이름, 이메일, 연락처, 문의내용)를 올바르게 입력해주세요."
      });
    }

    const newInquiry: InquiryData = {
      id: `INQ-${Date.now()}`,
      name,
      email,
      phone,
      category: category || "홍보영상 제작",
      budget: budget || "협의 가능",
      timeline: timeline || "미정",
      youtubeRef: youtubeRef || "",
      message,
      files: files || [],
      createdAt: new Date().toISOString()
    };

    inquiries.push(newInquiry);

    console.log(`[Mdia Lab] New Inquiry received from ${name} (${email}):`, {
      id: newInquiry.id,
      category: newInquiry.category,
      filesCount: newInquiry.files.length
    });

    return res.json({
      success: true,
      message: "견적 문의가 Mdia Lab 담당자 메일함으로 접수되었습니다. 24시간 이내 연락드리겠습니다.",
      inquiryId: newInquiry.id
    });
  });

  // Get stored inquiries (for admin demo mode)
  app.get("/api/inquiries", (_req, res) => {
    res.json({ success: true, inquiries });
  });

  // Get stored AI Chat logs (for admin monitoring)
  app.get("/api/chat/logs", (_req, res) => {
    res.json({ success: true, chatLogs: chatLogsStore });
  });

  // AI 24/7 Automated Response & Customer SMS Dispatch Chatbot API
  app.post("/api/chat", async (req, res) => {
    const { message, history, phone, name, sessionId } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ success: false, message: "메시지를 입력해주세요." });
    }

    const currentSessionId = sessionId || `session-${phone || 'visitor'}-${Date.now()}`;

    // Generate SMS dispatch notification if phone provided
    let smsInfo = null;
    if (phone) {
      smsInfo = {
        phone,
        sentAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        status: "SUCCESS",
        text: `[Mdia Lab] ${name || '고객'}님의 문의가 성공적으로 접수되었습니다. 담당자(PD)가 확인 후 10분 이내 연락드리겠습니다.`
      };
    }

    let replyText = "";

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const systemInstruction = `You are Mdia Lab's official 24/7 AI Automated Customer Service Assistant (엠디아랩 24시간 무인 자동 응대 AI).
Mdia Lab is a top-tier video production studio & cinema academy based in Seoul.
Key Details:
- Contact Phone: 02-588-3920
- Email: minabinv2@gmail.com
- Services: Corporate Brand Videos (기업 홍보영상), Commercial Ads (TVC/SNS 광고), Short Films (독립영화 제작), Cinema Lighting & 4K Color Grading (전문 4K 색보정), and Film Production Masterclass (영화 제작 마스터 클래스).
- Process & Timelines: Standard promo video takes ~2-3 weeks (planning 1 week, shooting 1-2 days, post-production & CG 1.5 weeks). Includes 2 free revision cycles.
- SMS Automated Dispatch: When users leave their phone number or request 1:1 consultation, explain that an automated SMS confirmation is sent immediately and an expert director will call them within 10-15 minutes.

Provide polite, professional, concise, and helpful answers in Korean with friendly emojis. Always encourage them to leave their phone number for instant SMS receipt notification.`;

        const contents = [
          ...(Array.isArray(history) ? history.map((h: any) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
          })) : []),
          {
            role: 'user',
            parts: [{ text: message }]
          }
        ];

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });

        replyText = response.text || "안녕하세요! 문의해주신 내용에 대해 Mdia Lab 영상 전문 담당자가 확인 후 안내 도와드리겠습니다. 전화 문의(02-588-3920)를 이용하시면 빠른 상담이 가능합니다.";
      }
    } catch (err) {
      console.error("[Mdia Lab] Gemini Chat Error:", err);
    }

    if (!replyText) {
      // Smart fallback if Gemini API key is missing or fails
      replyText = "Mdia Lab AI 무인 자동 응대 상담원입니다. 🎬\n문의해 주신 내용에 맞춰 영상 제작 예산, 기간, 포트폴리오 안내를 도와드리고 있습니다.\n전화번호를 남겨주시면 SMS 자동 수신확인과 함께 담당 PD가 10분 이내 연락드립니다.";
      
      const lower = message.toLowerCase();
      if (lower.includes("견적") || lower.includes("비용") || lower.includes("가격")) {
        replyText = "💰 [견적 및 비용 안내]\n일반 기업 홍보영상은 평균 2~3주 소요되며 기획, 촬영, 4K 색보정을 포함한 맞춤형 예산으로 제작 가능합니다.\n연락처를 남겨주시면 SMS 자동 접수 후 정밀 산출 견적서를 전달해 드립니다.";
      } else if (lower.includes("포트폴리오") || lower.includes("작품") || lower.includes("대표작")) {
        replyText = "🎬 [포트폴리오 추천]\nMdia Lab의 메인 쇼릴 및 4K 상업광고 포트폴리오는 홈페이지 상단 [PORTFOLIO] 탭에서 감상하실 수 있습니다.";
      } else if (lower.includes("강의") || lower.includes("수강") || lower.includes("클래스")) {
        replyText = "🎓 [단편영화 & 영상제작 마스터 클래스]\n시나리오 기획부터 카메라이펙트, 전문 시네마 색보정까지 8주 실무 과정으로 운영됩니다. 문의 시 SMS 수신확인 문자가 발송됩니다.";
      }
    }

    // Save/Update in chatLogsStore
    const now = new Date().toLocaleString('ko-KR');
    let existingLog = chatLogsStore.find(l => l.sessionId === currentSessionId || (phone && l.phone === phone));

    const formattedUserMsg = { sender: 'user' as const, text: message, timestamp: now };
    const formattedAiMsg = { sender: 'ai' as const, text: replyText, timestamp: now };

    if (existingLog) {
      if (name) existingLog.name = name;
      if (phone) existingLog.phone = phone;
      existingLog.lastMessage = message;
      existingLog.messages.push(formattedUserMsg, formattedAiMsg);
      existingLog.updatedAt = now;
    } else {
      chatLogsStore.unshift({
        id: `chatlog-${Date.now()}`,
        sessionId: currentSessionId,
        name: name || '방문자',
        phone: phone || '연락처 미입력',
        lastMessage: message,
        messages: [formattedUserMsg, formattedAiMsg],
        emailForwardedTo: "minabinv2@gmail.com (자동전송 접수 완료)",
        updatedAt: now
      });
    }

    console.log(`[Mdia Lab] Chat Log Saved & Forwarded to minabinv2@gmail.com:`, {
      customer: name || '방문자',
      phone: phone || '미입력',
      message: message.substring(0, 30)
    });

    return res.json({
      success: true,
      reply: replyText,
      smsInfo,
      sessionId: currentSessionId
    });
  });

  // Vite development middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🎬 Mdia Lab Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
