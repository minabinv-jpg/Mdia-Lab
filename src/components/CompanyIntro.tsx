import React, { useState } from 'react';
import { CheckCircle2, MapPin, Building2 } from 'lucide-react';

export const CompanyIntro: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'philosophy' | 'workflow'>('philosophy');

  const steps = [
    { num: '01', title: '기획 & 콘티 스크립트', desc: '고객의 목적과 메시지에 맞춘 시놉시스, 스토리보드 및 씬별 구도 기획' },
    { num: '02', title: '시네마 로케이션 & 촬영', desc: '4K, 8K 시네마 카메라와 렌즈 등 전문 촬영 감독의 고화질 현장 동선 촬영' },
    { num: '03', title: '리듬감 있는 컷편집', desc: '몰입감을 극대화하는 리드미컬 컷편집, 자막 디자인, 모션그래픽 적용' }
  ];

  return (
    <section id="company-intro" className="py-20 bg-white border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-bold text-gray-400 tracking-[0.3em] uppercase block">
              ABOUT MDIA LAB
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight leading-tight sm:leading-snug">
              <span className="block">엠디아랩</span>
              <span className="block mt-1 sm:mt-1.5">전문 영상 프로덕션 & 크리에이티브 연구소</span>
            </h2>
            <p className="text-base text-gray-500 leading-relaxed">
              Mdia Lab은 단순한 영상 제작을 넘어 브랜드의 고유한 메시지를 시네마틱 비주얼로 표현합니다.
            </p>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="inline-flex p-1 bg-[#F5F5F5] border border-[#E5E5E5]">
            <button
              onClick={() => setActiveTab('philosophy')}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === 'philosophy'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-gray-500 hover:text-[#1A1A1A]'
              }`}
            >
              제작 철학
            </button>
            <button
              onClick={() => setActiveTab('workflow')}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === 'workflow'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-gray-500 hover:text-[#1A1A1A]'
              }`}
            >
              제작 프로세스
            </button>
          </div>
        </div>

        {/* Tab 1: Philosophy & Company Story */}
        {activeTab === 'philosophy' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch animate-in fade-in duration-300">
            <div className="lg:col-span-7 space-y-6">
              <div className="p-8 bg-[#1A1A1A] text-white rounded-xl shadow-xl relative overflow-hidden border border-gray-800 h-full flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold tracking-[0.3em] text-gray-400 uppercase block mb-3">
                    CREATIVE VISION
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4 leading-snug">
                    "모든 프레임에는 이유가 있어야 합니다."
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed mb-6 font-normal">
                    Mdia Lab은 화려한 효과만 남는 영상이 아닌, 청중의 마음을 움직이는 깊이 있는 스토리텔링을 고집합니다. 
                    광고, 홍보영상 제작 전문 인력이 완성도 높은 시네마토그래피를 완성합니다.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-800 text-xs">
                  <div className="flex items-center gap-2 text-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>영화적 미학 & 시네마 라이팅</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>1:1 전담 디렉터 책임제</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>투명한 투입 원가 및 산출 시스템</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>영화, 광고, 홍보영상 제작 전문 인력</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between p-8 bg-neutral-50 rounded-xl border border-[#E5E5E5] shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold tracking-[0.25em] text-neutral-400 uppercase">
                    STUDIO & PRODUCTION
                  </span>
                  <span className="text-[11px] font-bold text-[#1A1A1A] bg-white px-2.5 py-1 rounded-sm border border-[#E5E5E5]">
                    방문상담 가능
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3 tracking-tight">
                  Mdia Lab 제작실
                </h3>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6 break-keep">
                  시네마 카메라 촬영 및 정밀 편집, 컬러 그레이딩 시스템을 완비한<br />
                  Mdia Lab의 전용 크리에이티브 제작 공간입니다.
                </p>

                <div className="space-y-4 pt-6 border-t border-[#E5E5E5]">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-sm bg-neutral-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-900">스튜디오 위치</p>
                      <p className="text-xs text-neutral-500 mt-0.5">울산 북구 효정8길 13</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-sm bg-neutral-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-900">제작 및 강의 문의</p>
                      <p className="text-xs text-neutral-500 mt-0.5">상업 영상 제작 상담 & 온/오프라인 아카데미 미팅</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E5E5E5] flex items-center justify-between text-xs text-neutral-500">
                <span>운영 시간: 10:00 ~ 19:00 (사전 예약제)</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Workflow */}
        {activeTab === 'workflow' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {steps.map((step) => (
              <div key={step.num} className="bg-white p-8 rounded-xl border border-[#E5E5E5] flex flex-col justify-between group hover:border-[#1A1A1A] transition-colors">
                <div>
                  <div className="text-xs font-bold text-gray-400 font-mono mb-2">{step.num}</div>
                  <h4 className="text-lg font-bold text-[#1A1A1A] mb-2">
                    {step.title}
                  </h4>
                  <p className="text-xs text-gray-500 leading-snug">
                    {step.desc}
                  </p>
                </div>
                <span className="text-xs font-black tracking-widest text-[#1A1A1A] group-hover:translate-x-2 transition-transform uppercase mt-6 block">
                  PROCESS →
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
