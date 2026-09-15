import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, Sparkles, X, Send, Bot, User, PhoneCall, CheckCircle2, 
  Smartphone, ChevronRight, RefreshCw, FileText, Clock, HelpCircle, ShieldAlert,
  Mail, Search, ShieldCheck, Database
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user' | 'system';
  text: string;
  timestamp: string;
  smsLog?: {
    phone: string;
    text: string;
    time: string;
  };
}

interface ChatLogSession {
  id: string;
  sessionId: string;
  name: string;
  phone: string;
  lastMessage: string;
  messages: Array<{ sender: 'ai' | 'user' | 'system'; text: string; timestamp: string }>;
  emailForwardedTo: string;
  updatedAt: string;
}

interface AIChatBotProps {
  currentUser?: FirebaseUser | null;
}

export const AIChatBot: React.FC<AIChatBotProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [sessionId] = useState<string>(() => `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: '안녕하세요! Mdia Lab 24시간 무인 자동 응대 AI 상담원입니다. 🎬\n\n영상 제작 견적, 포트폴리오 추천, 영화 클래스 수강 등 궁금하신 사항을 물어보세요!',
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [showPhonePrompt, setShowPhonePrompt] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastSmsSent, setLastSmsSent] = useState<string | null>(null);

  // Admin Logs State
  const [showAdminLogsModal, setShowAdminLogsModal] = useState<boolean>(false);
  const [adminLogs, setAdminLogs] = useState<ChatLogSession[]>([]);
  const [selectedAdminLog, setSelectedAdminLog] = useState<ChatLogSession | null>(null);
  const [loadingAdminLogs, setLoadingAdminLogs] = useState<boolean>(false);
  const [adminLogSearch, setAdminLogSearch] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchAdminChatLogs = async () => {
    setLoadingAdminLogs(true);
    try {
      const res = await fetch('/api/chat/logs');
      const data = await res.json();
      if (data.success) {
        setAdminLogs(data.chatLogs || []);
        if (data.chatLogs && data.chatLogs.length > 0 && !selectedAdminLog) {
          setSelectedAdminLog(data.chatLogs[0]);
        }
      }
    } catch (e) {
      console.error('Failed to fetch admin chat logs:', e);
    } finally {
      setLoadingAdminLogs(false);
    }
  };

  const handleOpenAdminLogs = () => {
    setShowAdminLogsModal(true);
    fetchAdminChatLogs();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.sender !== 'system')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: text.trim(),
          history,
          phone: phoneInput.trim() || undefined,
          name: userName.trim() || undefined
        })
      });

      const data = await res.json();

      if (data.success) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        };

        const newMessages: ChatMessage[] = [aiMsg];

        if (data.smsInfo) {
          setLastSmsSent(data.smsInfo.phone);
          newMessages.push({
            id: `sms-${Date.now()}`,
            sender: 'system',
            text: `📱 [SMS 자동 발송 완료]\n고객님의 휴대폰 번호(${data.smsInfo.phone})로 [Mdia Lab 문의접수 확인문자]가 성공적으로 전송되었습니다!\n전담 PD가 확인 후 10분 이내 연락드립니다.`,
            timestamp: data.smsInfo.sentAt,
            smsLog: {
              phone: data.smsInfo.phone,
              text: data.smsInfo.text,
              time: data.smsInfo.sentAt
            }
          });
        }

        setMessages((prev) => [...prev, ...newMessages]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-err-${Date.now()}`,
            sender: 'ai',
            text: '죄송합니다. 서버 일시 응답 지연이 발생했습니다. 0502-5554-3919으로 문의해 주시면 친절히 안내해 드리겠습니다.',
            timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (e) {
      console.error('Chat error:', e);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'Mdia Lab 상담 센터 연결 중 오류가 발생했습니다. 아래 1:1 견적 문의 폼을 이용해 주시거나 전화 문의(0502-5554-3919)를 이용해 주세요.',
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) {
      alert('SMS 수신 확인을 위한 전화번호를 입력해주세요.');
      return;
    }
    setShowPhonePrompt(false);
    handleSendMessage(`[SMS 자동 접수 요청] 연락처: ${phoneInput.trim()} (${userName || '고객'}) / 1:1 상담 및 견적 안내 요청합니다.`);
  };

  const quickQuestions = [
    { label: '💰 예상 견적 & 제작 기간', prompt: '기업 홍보영상 예상 제작 견적과 소요 기간은 어떻게 되나요?' },
    { label: '🎬 포트폴리오 추천', prompt: 'Mdia Lab의 대표 4K 홍보영상 및 상업 광고 포트폴리오를 추천해주세요.' },
    { label: '🎓 단편영화 클래스 문의', prompt: '실전 단편영화 제작 마스터 클래스 수강 일정과 교육 내용을 알려주세요.' },
    { label: '📱 SMS 1:1 담당자 상담', prompt: '담당 PD 연결 및 SMS 자동 접수를 신청하고 싶습니다.' }
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 pointer-events-auto">
        {currentUser && (
          <button
            onClick={handleOpenAdminLogs}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] px-3.5 py-2 rounded-full shadow-xl border border-amber-300 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
          >
            <Mail className="w-3.5 h-3.5 text-white" />
            <span>[관리자] 챗봇 상담기록 & 회사메일함</span>
          </button>
        )}

        {!isOpen && (
          <div className="bg-[#0300b0] text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg border border-blue-400/30 flex items-center gap-1.5 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>AI 무인상담 & SMS 자동발송</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{ backgroundColor: '#0300b0' }}
          className="group flex items-center gap-2.5 px-5 py-3.5 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-blue-400/40"
          aria-label="1:1 AI 무인 상담 챗봇 열기"
        >
          {isOpen ? (
            <>
              <X className="w-5 h-5 text-white" />
              <span className="text-xs font-bold tracking-wider uppercase">상담창 닫기</span>
            </>
          ) : (
            <>
              <div className="relative">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0300b0]" />
              </div>
              <span className="text-xs font-bold tracking-wider uppercase">1:1 AI 무인 상담</span>
            </>
          )}
        </button>
      </div>

      {/* Floating Chat Popup Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-8 w-[92vw] max-w-[390px] h-[580px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-neutral-200 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
          
          {/* Chat Header */}
          <div style={{ backgroundColor: '#0300b0' }} className="p-4 text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-wide flex items-center gap-1.5">
                  <span>Mdia Lab AI 무인 상담</span>
                  <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500 text-white font-mono rounded-full font-bold">LIVE</span>
                </h3>
                <p className="text-[11px] text-blue-100/90 flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-emerald-300" />
                  <span>24시간 AI 답장 + SMS 자동 발송</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {currentUser && (
                <button
                  onClick={handleOpenAdminLogs}
                  title="관리자 전용 대화기록 확인"
                  className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded-md cursor-pointer transition-colors flex items-center gap-1"
                >
                  <Mail className="w-3 h-3" />
                  <span>메일함</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick SMS Notification Banner */}
          <div className="bg-blue-50/90 border-b border-blue-100 px-3.5 py-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-[11px] text-[#0300b0] font-medium">
              <Smartphone className="w-3.5 h-3.5 text-[#0300b0] shrink-0" />
              <span>
                {lastSmsSent ? (
                  <strong className="text-emerald-700">📱 {lastSmsSent} 번호로 SMS 수신확인 발송 완료!</strong>
                ) : (
                  <span>전화번호 입력 시 <strong>SMS 접수증</strong>이 자동 발송됩니다</span>
                )}
              </span>
            </div>
            <button
              onClick={() => setShowPhonePrompt(!showPhonePrompt)}
              className="text-[10px] font-bold px-2 py-0.5 bg-[#0300b0] text-white rounded hover:opacity-90 shrink-0 cursor-pointer"
            >
              {showPhonePrompt ? '닫기' : 'SMS연락처 등록'}
            </button>
          </div>

          {/* SMS Registration Collapsible Panel */}
          {showPhonePrompt && (
            <form onSubmit={handleRegisterSms} className="bg-neutral-900 text-white p-3.5 border-b border-neutral-800 space-y-2 text-xs shrink-0 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between text-amber-300 font-bold text-[11px]">
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>SMS 자동 수신확인 서비스 설정</span>
                </span>
                <span className="text-[9px] text-neutral-400">무료 실시간 서비스</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="성함 / 회사명"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 text-white text-xs rounded focus:outline-none focus:border-blue-400"
                />
                <input
                  type="tel"
                  required
                  placeholder="휴대폰 번호 (010-0000-0000)"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 text-white text-xs rounded focus:outline-none focus:border-blue-400"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SMS 자동 전송 설정하고 1:1 문의 접수하기</span>
              </button>
            </form>
          )}

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-neutral-50/50">
            {messages.map((msg) => {
              if (msg.sender === 'system') {
                return (
                  <div key={msg.id} className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs space-y-1 my-2">
                    <div className="flex items-center justify-between font-bold text-emerald-800 text-[11px]">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>고객 SMS 발송 시스템</span>
                      </span>
                      <span className="font-mono text-[10px] text-emerald-600">{msg.timestamp}</span>
                    </div>
                    <p className="whitespace-pre-line text-emerald-800 leading-relaxed font-medium">
                      {msg.text}
                    </p>
                  </div>
                );
              }

              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-7 h-7 rounded-full bg-[#0300b0] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Bot className="w-4 h-4 text-amber-300" />
                    </div>
                  )}

                  <div className={`max-w-[80%] space-y-1 ${isAi ? 'items-start' : 'items-end flex flex-col'}`}>
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-2xs ${
                        isAi
                          ? 'bg-white text-neutral-800 border border-neutral-200 rounded-tl-xs'
                          : 'bg-[#0300b0] text-white rounded-tr-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-neutral-400 font-mono px-1">
                      {msg.timestamp}
                    </span>
                  </div>

                  {!isAi && (
                    <div className="w-7 h-7 rounded-full bg-neutral-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-neutral-500 p-2">
                <div className="w-6 h-6 rounded-full bg-[#0300b0] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                </div>
                <span className="animate-pulse">AI 답장 생성 및 SMS 상태 확인 중...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Choice Buttons */}
          <div className="p-2.5 bg-white border-t border-neutral-100 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q.prompt)}
                disabled={loading}
                className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-bold rounded-full whitespace-nowrap transition-colors shrink-0 cursor-pointer border border-neutral-200 flex items-center gap-1"
              >
                <span>{q.label}</span>
              </button>
            ))}
          </div>

          {/* Input Form Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="궁금하신 사항을 입력해 주세요..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
              className="flex-1 px-3 py-2 bg-neutral-100 text-neutral-900 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0300b0] border border-neutral-200"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              style={{ backgroundColor: '#0300b0' }}
              className="p-2.5 text-white rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer shrink-0 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

      {/* Admin Chat Logs & Company Email Forwarding History Modal */}
      {showAdminLogsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-neutral-200">
            {/* Modal Header */}
            <div className="bg-neutral-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                    <span>Mdia Lab AI 무인 상담 대화기록 및 메일 수신함</span>
                    <span className="text-[10px] bg-amber-500 text-neutral-900 font-extrabold px-2 py-0.5 rounded-full">관리자 전용</span>
                  </h2>
                  <p className="text-xs text-neutral-400">
                    방문자 대화 내역 및 SMS 접수 데이터가 대표 메일(minabinv2@gmail.com)과 시스템 DB에 자동 전송·기록됩니다.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchAdminChatLogs}
                  disabled={loadingAdminLogs}
                  className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingAdminLogs ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">새로고침</span>
                </button>
                <button
                  onClick={() => setShowAdminLogsModal(false)}
                  className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Email Auto Forwarding Status Banner */}
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between shrink-0 text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>메일 자동 수신 설정:</strong> 모든 1:1 상담 대화는 <strong>minabinv2@gmail.com</strong> 회사 메일로 실시간 전달됩니다.
                </span>
              </div>
              <span className="font-mono text-[11px] text-amber-700 hidden sm:inline">총 {adminLogs.length}건 수신</span>
            </div>

            {/* Modal Body: Master-Detail Split Layout */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-neutral-100">
              {/* Left Panel: Log Sessions List */}
              <div className="w-full md:w-80 border-r border-neutral-200 bg-white flex flex-col shrink-0">
                <div className="p-3 border-b border-neutral-100">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="고객명, 연락처, 대화검색..."
                      value={adminLogSearch}
                      onChange={(e) => setAdminLogSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
                  {loadingAdminLogs ? (
                    <div className="p-8 text-center text-xs text-neutral-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-neutral-300" />
                      상담 기록 불러오는 중...
                    </div>
                  ) : adminLogs.length === 0 ? (
                    <div className="p-8 text-center text-xs text-neutral-400">
                      아직 접수된 무인 상담 기록이 없습니다.
                    </div>
                  ) : (
                    adminLogs
                      .filter((log) => {
                        if (!adminLogSearch) return true;
                        const q = adminLogSearch.toLowerCase();
                        return (
                          log.name.toLowerCase().includes(q) ||
                          log.phone.toLowerCase().includes(q) ||
                          log.lastMessage.toLowerCase().includes(q)
                        );
                      })
                      .map((log) => {
                        const isSelected = selectedAdminLog?.id === log.id;
                        return (
                          <div
                            key={log.id}
                            onClick={() => setSelectedAdminLog(log)}
                            className={`p-3.5 cursor-pointer transition-colors text-xs space-y-1 ${
                              isSelected
                                ? 'bg-blue-50/80 border-l-4 border-[#0300b0]'
                                : 'hover:bg-neutral-50'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold text-neutral-800">
                              <span className="flex items-center gap-1.5 text-neutral-900">
                                <User className="w-3.5 h-3.5 text-[#0300b0]" />
                                <span>{log.name}</span>
                              </span>
                              <span className="text-[10px] text-neutral-400 font-mono">{log.updatedAt}</span>
                            </div>
                            <div className="text-[11px] text-emerald-700 font-mono font-medium flex items-center gap-1">
                              <Smartphone className="w-3 h-3 text-emerald-600" />
                              <span>{log.phone}</span>
                            </div>
                            <p className="text-neutral-500 text-[11px] truncate">
                              {log.lastMessage}
                            </p>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

              {/* Right Panel: Full Dialogue Transcript */}
              <div className="flex-1 flex flex-col bg-white overflow-hidden">
                {selectedAdminLog ? (
                  <>
                    <div className="p-3.5 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                          <span>{selectedAdminLog.name} 고객님 상담 내역</span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                            {selectedAdminLog.phone}
                          </span>
                        </h4>
                        <p className="text-[11px] text-neutral-500 font-mono">
                          {selectedAdminLog.emailForwardedTo}
                        </p>
                      </div>
                      <a
                        href={`tel:${selectedAdminLog.phone}`}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1 text-xs"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>전화 연결</span>
                      </a>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-50/50">
                      {selectedAdminLog.messages.map((m, idx) => {
                        const isAi = m.sender === 'ai';
                        return (
                          <div
                            key={idx}
                            className={`flex items-start gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
                          >
                            {isAi && (
                              <div className="w-7 h-7 rounded-full bg-[#0300b0] text-white flex items-center justify-center shrink-0 mt-0.5 text-xs">
                                AI
                              </div>
                            )}

                            <div className={`max-w-[80%] space-y-1 ${isAi ? 'items-start' : 'items-end flex flex-col'}`}>
                              <div
                                className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-2xs ${
                                  isAi
                                    ? 'bg-white text-neutral-800 border border-neutral-200 rounded-tl-xs'
                                    : 'bg-[#0300b0] text-white rounded-tr-xs'
                                }`}
                              >
                                {m.text}
                              </div>
                              <span className="text-[9px] text-neutral-400 font-mono px-1">
                                {m.timestamp}
                              </span>
                            </div>

                            {!isAi && (
                              <div className="w-7 h-7 rounded-full bg-neutral-800 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs">
                                고객
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 text-xs p-6">
                    <MessageSquare className="w-10 h-10 mb-2 text-neutral-300" />
                    <span>좌측 상담 내역 목록에서 확인을 원하시는 고객을 선택해주세요.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
