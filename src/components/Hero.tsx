import React, { useState } from 'react';
import { Play, ArrowRight, Film, Award, Users, CheckCircle2, Video, Edit3, Trash2, ShieldCheck, X, RefreshCw } from 'lucide-react';
import { User } from 'firebase/auth';
import { ShowreelConfig, DEFAULT_SHOWREEL } from '../lib/firestoreService';

interface HeroProps {
  showreelConfig: ShowreelConfig;
  onOpenShowreel: () => void;
  onNavigate: (sectionId: string) => void;
  currentUser: User | null;
  onUpdateShowreel: (config: Partial<ShowreelConfig>) => Promise<void>;
}

export const Hero: React.FC<HeroProps> = ({
  showreelConfig,
  onOpenShowreel,
  onNavigate,
  currentUser,
  onUpdateShowreel
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUrl, setEditUrl] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editRuntime, setEditRuntime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenEditModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditUrl(showreelConfig.youtubeUrl || 'https://youtu.be/SeXdFQYOZvg');
    setEditTitle(showreelConfig.title || 'Mdia Lab 대표 브랜드 광고·홍보영상');
    setEditRuntime(showreelConfig.runtime || '01:15');
    setIsEditModalOpen(true);
  };

  const handleSaveShowreel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUrl) return;
    setIsSubmitting(true);
    try {
      await onUpdateShowreel({
        youtubeUrl: editUrl,
        title: editTitle || 'Mdia Lab 대표 브랜드 광고·홍보영상',
        runtime: editRuntime || '01:15'
      });
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Failed to update showreel:", err);
      alert("영상 업데이트 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetShowreel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("동영상을 기본 설정으로 초기화하시겠습니까?")) return;
    try {
      await onUpdateShowreel(DEFAULT_SHOWREEL);
    } catch (err) {
      console.error("Failed to reset showreel:", err);
    }
  };

  const currentYtId = showreelConfig.youtubeId || 'SeXdFQYOZvg';
  const ytThumbnail = `https://img.youtube.com/vi/${currentYtId}/maxresdefault.jpg`;

  return (
    <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 bg-[#F5F5F5] text-[#1A1A1A] overflow-hidden border-b border-[#E5E5E5]">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a08_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a08_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Main Hero Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Main Headline with Uploaded Logo Image & Large 엠디아랩 */}
            <div className="mb-4">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter text-[#1A1A1A] flex flex-wrap items-center gap-3.5 sm:gap-5">
                <img
                  src="/lee-mina-logo.svg"
                  alt="엠디아랩 로고"
                  className="w-13 h-13 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-2xl shadow-md border-2 border-white object-cover shrink-0 bg-neutral-950 hover:scale-105 transition-transform"
                />
                <span className="text-[#1A1A1A]">엠디아랩</span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-500 max-w-lg leading-relaxed font-normal break-keep">
              Mdia Lab은 영상 제작 강의부터 영화, 광고, 홍보영상 제작까지 감각적인 연출과 촬영, 편집으로 최상의 결과물을 보장합니다.
            </p>

            {/* Action Buttons (SHOWREEL button removed as requested) */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('estimate')}
                style={{ backgroundColor: '#0300b0', borderColor: '#0300b0' }}
                className="text-white border px-7 py-3.5 text-xs font-bold tracking-widest flex items-center gap-2 hover:opacity-90 transition-all uppercase cursor-pointer"
              >
                <span>FREE QUOTE</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('company-intro')}
                className="bg-transparent text-[#1A1A1A] underline underline-offset-8 px-4 py-3.5 text-xs font-bold tracking-widest uppercase hover:text-gray-500 cursor-pointer"
              >
                OUR STORY
              </button>
            </div>

            {/* Quick Guarantees */}
            <div className="pt-6 border-t border-[#E5E5E5] grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-gray-500 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1A1A1A] shrink-0" />
                <span>24시간 이내 정밀 견적</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1A1A1A] shrink-0" />
                <span>기획서/콘티 파일 첨부</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1A1A1A] shrink-0" />
                <span>4K 시네마 LUT 마스터</span>
              </div>
            </div>

          </div>

          {/* Hero Featured Video Preview Box */}
          <div className="lg:col-span-5">
            <div 
              onClick={onOpenShowreel}
              className="relative group cursor-pointer overflow-hidden rounded-xl border-4 border-white shadow-2xl bg-black aspect-video flex flex-col justify-between"
            >
              {/* Thumbnail Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-70 group-hover:scale-105 transition-transform duration-700"
                style={{ backgroundImage: `url(${ytThumbnail})` }}
              ></div>
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                  <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                </div>
              </div>

              {/* Top Film Badge */}
              <div className="relative p-4 flex justify-between items-center z-10 text-white text-[10px] font-mono tracking-widest">
                <span className="bg-black/70 px-2.5 py-1 rounded border border-white/20">
                  REC [MDIA LAB]
                </span>

                {/* Admin Management Toolbar */}
                {currentUser ? (
                  <div className="flex items-center gap-1.5 bg-neutral-900/90 border border-blue-400/50 p-1 rounded-lg backdrop-blur-sm z-20">
                    <button
                      onClick={handleOpenEditModal}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded flex items-center gap-1 transition-colors"
                      title="동영상 교체/수정"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>교체/수정</span>
                    </button>
                    <button
                      onClick={handleResetShowreel}
                      className="p-1 bg-red-600/80 hover:bg-red-700 text-white rounded transition-colors"
                      title="기본 영상으로 초기화"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <span className="opacity-80">
                    MDIA LAB
                  </span>
                )}
              </div>

              {/* Bottom Video Meta Bar */}
              <div className="relative p-5 z-10 text-white bg-gradient-to-t from-black/95 via-black/60 to-transparent">
                <p className="text-[10px] font-bold tracking-[0.2em] text-gray-300 mb-1 uppercase">FEATURED VIDEO</p>
                <div className="flex justify-between items-end">
                  <p className="text-base font-bold truncate max-w-[240px]">{showreelConfig.title || 'Mdia Lab 대표 브랜드 광고·홍보영상'}</p>
                  <span className="text-xs font-mono opacity-80">{showreelConfig.runtime || '01:15'}</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Studio Stats Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white rounded-xl border border-[#E5E5E5] shadow-xs">
          <div className="p-4 border-r border-[#E5E5E5] last:border-r-0">
            <p className="text-xs font-bold text-gray-400 font-mono mb-1">01 / PROJECTS</p>
            <p className="text-3xl font-bold text-[#1A1A1A] tracking-tight">150+</p>
            <p className="text-xs text-gray-500 mt-0.5">누적 제작 프로젝트</p>
          </div>

          <div className="p-4 border-r border-[#E5E5E5] last:border-r-0">
            <p className="text-xs font-bold text-gray-400 font-mono mb-1">02 / AWARDS</p>
            <p className="text-3xl font-bold text-[#1A1A1A] tracking-tight">3+</p>
            <p className="text-xs text-gray-500 mt-0.5">공모전 출품 및 수상</p>
          </div>

          <div className="p-4 border-r border-[#E5E5E5] last:border-r-0">
            <p className="text-xs font-bold text-gray-400 font-mono mb-1">03 / STUDENTS</p>
            <p className="text-3xl font-bold text-[#1A1A1A] tracking-tight">3,200+</p>
            <p className="text-xs text-gray-500 mt-0.5">강의 수강생 배출</p>
          </div>

          <div className="p-4">
            <p className="text-xs font-bold text-gray-400 font-mono mb-1">04 / SATISFACTION</p>
            <p className="text-3xl font-bold text-[#1A1A1A] tracking-tight">98.5%</p>
            <p className="text-xs text-gray-500 mt-0.5">고객 만족도 평가</p>
          </div>
        </div>

      </div>

      {/* Admin Showreel Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#0300b0]" />
                <span>메인 쇼릴 영상 교체/수정</span>
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 mb-4">
              메인 화면 상단에 게재할 새로운 유튜브 쇼릴 영상 정보를 입력해 주세요.
            </p>

            <form onSubmit={handleSaveShowreel} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  쇼릴 타이틀
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="예: Mdia Lab Official Showreel 2026"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#0300b0]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  유튜브 영상 URL
                </label>
                <input
                  type="text"
                  required
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#0300b0] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  러닝타임 (선택)
                </label>
                <input
                  type="text"
                  value={editRuntime}
                  onChange={(e) => setEditRuntime(e.target.value)}
                  placeholder="01:35"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#0300b0]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ backgroundColor: '#0300b0' }}
                  className="px-5 py-2 text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                >
                  {isSubmitting ? "저장 중..." : "쇼릴 영상 업데이트"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

