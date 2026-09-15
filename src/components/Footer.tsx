import React, { useState } from 'react';
import { Logo } from './Logo';
import { Phone, Mail, MapPin, Instagram, Youtube, Film, ArrowUp, ShieldCheck, FileText, MessageCircle } from 'lucide-react';
import { PrivacyTermsModal } from './PrivacyTermsModal';

import { User } from 'firebase/auth';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  customLogoUrl?: string;
  onLogoUpload?: (url: string) => void;
  currentUser?: User | null;
  onOpenAdminAuth?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onNavigate,
  customLogoUrl,
  onLogoUpload,
  currentUser,
  onOpenAdminAuth
}) => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1A1A1A] text-gray-400 py-16 border-t border-gray-800 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-gray-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-5 space-y-4">
            <div className="brightness-200">
              <Logo 
                size="md" 
                customLogoUrl={customLogoUrl}
                onLogoUpload={onLogoUpload}
                currentUser={currentUser}
                onOpenAdminAuth={onOpenAdminAuth}
              />
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Mdia Lab은 진정성 있는 스토리와 시네마토그래피로 브랜드의 가치를 바꾸는 시네마 미디어 프로덕션입니다. 
              기업 홍보영상, TVC 광고 및 실전 영화/영상제작 교육을 진행합니다.
            </p>
            
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <a
                href="http://pf.kakao.com/_PMjiX"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-md transition-all flex items-center gap-1.5 shadow-sm border border-amber-300 active:scale-95"
                aria-label="KakaoTalk Channel"
                title="Mdia Lab 카카오톡 채널 1:1 상담"
              >
                <MessageCircle className="w-4 h-4 text-neutral-900 fill-neutral-900" />
                <span>카카오톡 채널</span>
              </a>
              <a
                href="https://www.youtube.com/@MdiaLab"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white rounded-md transition-colors border border-gray-800"
                aria-label="YouTube"
                title="Mdia Lab 공식 유튜브 채널 바로가기"
              >
                <Youtube className="w-4 h-4 text-red-500" />
              </a>
              <a
                href="https://www.instagram.com/mdia_lab"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white rounded-md transition-colors border border-gray-800"
                aria-label="Instagram"
                title="Mdia Lab 인스타그램"
              >
                <Instagram className="w-4 h-4 text-pink-500" />
              </a>
            </div>
          </div>

          {/* Quick Nav Col */}
          <div className="lg:col-span-3 space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-[0.2em]">
              Quick Navigation
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('company-intro')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Mdia Lab 소개
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('features')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  주요 서비스
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('portfolio')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  시네마 포트폴리오
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('testimonials')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  클라이언트 후기 및 평가
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('blog-news')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Mdia Lab 저널 & 아티클
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('workshops')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  영상 / 영화 제작 강의
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('bulletin-board')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  공지사항 및 질문게시판
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('estimate')}
                  className="hover:text-white font-bold text-white transition-colors cursor-pointer underline underline-offset-4"
                >
                  무료 견적 문의
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="lg:col-span-4 space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-[0.2em]">
              Studio Contact
            </p>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500 shrink-0" />
                <span>0502-5554-3919 (상담시간: 10:00 - 19:00)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                <span>minabinv2@gmail.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                <span>울산 북구 효정8길 13</span>
              </li>
            </ul>

            <div className="pt-2 text-[11px] text-gray-500 space-y-1 font-mono">
              <p>사업자등록번호: 274-06-03672 | 대표자: 이민아 (Mdia Lab)</p>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Legal Policies */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-mono">
          <div className="flex flex-wrap items-center gap-4">
            <p>© {new Date().getFullYear()} Mdia Lab. All Rights Reserved.</p>
            <span className="hidden sm:inline text-gray-700">|</span>
            <button
              onClick={() => setActiveModal('terms')}
              className="hover:text-gray-300 underline underline-offset-2 transition-colors cursor-pointer"
            >
              이용약관
            </button>
            <button
              onClick={() => setActiveModal('privacy')}
              className="text-gray-300 font-bold hover:text-white underline underline-offset-2 transition-colors cursor-pointer flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>개인정보처리방침</span>
            </button>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white text-xs font-bold uppercase border border-gray-800 transition-colors cursor-pointer"
          >
            <span>TOP</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Legal & Privacy Policy Modal */}
      {activeModal && (
        <PrivacyTermsModal
          isOpen={true}
          type={activeModal}
          onClose={() => setActiveModal(null)}
        />
      )}
    </footer>
  );
};
