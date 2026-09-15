import React, { useState } from 'react';
import { WORKSHOP_CLASSES } from '../data/mockData';
import { WorkshopClass } from '../types';
import { BookOpen, CheckCircle, Clock, Award, Users, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

interface WorkshopClassesProps {
  onInquireClass: (className: string) => void;
}

export const WorkshopClasses: React.FC<WorkshopClassesProps> = ({ onInquireClass }) => {
  const [expandedId, setExpandedId] = useState<string>('w1');

  const toggleCurriculum = (id: string) => {
    setExpandedId(expandedId === id ? '' : id);
  };

  return (
    <section id="workshops" className="py-20 bg-white border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-bold text-gray-400 tracking-[0.3em] uppercase block">
              ACADEMY & WORKSHOPS
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
              영상 & 영화 제작 실무 강의 문의
            </h2>
            <p className="text-base text-gray-500 leading-relaxed">
              현직 영화 연출가와 시네마토그래퍼가 1:1 및 소수정예로 지도하는 실전 프로젝트 워크숍입니다.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 font-mono">
            <span>TOTAL COURSES: 03</span>
          </div>
        </div>

        {/* Workshop Class Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {WORKSHOP_CLASSES.map((cls) => {
            const isExpanded = expandedId === cls.id;
            return (
              <div
                key={cls.id}
                className={`bg-white p-8 rounded-xl border flex flex-col justify-between transition-colors ${
                  isExpanded
                    ? 'border-[#1A1A1A] shadow-md'
                    : 'border-[#E5E5E5] hover:border-[#1A1A1A]'
                }`}
              >
                <div>
                  {/* Badge */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-[#1A1A1A] text-white px-2.5 py-1">
                      {cls.badge}
                    </span>
                    <span className="text-xs font-mono font-bold text-gray-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {cls.duration}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#1A1A1A] mb-2 tracking-tight">
                    {cls.title}
                  </h3>
                  <p className="text-xs text-[#1A1A1A] font-semibold mb-4 leading-relaxed">
                    {cls.subtitle}
                  </p>

                  <p className="text-xs text-gray-500 bg-[#F5F5F5] p-3 rounded-md mb-6 leading-relaxed border border-[#E5E5E5]">
                    {cls.description}
                  </p>

                  {/* Highlights List */}
                  <div className="space-y-2 mb-6 pt-4 border-t border-[#E5E5E5]">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">주요 수강 혜택</p>
                    {cls.highlights.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                        <CheckCircle className="w-3.5 h-3.5 text-[#1A1A1A] mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Curriculum Toggle Button */}
                  <button
                    onClick={() => toggleCurriculum(cls.id)}
                    className="w-full py-2.5 px-3 bg-[#F5F5F5] hover:bg-gray-200 text-[#1A1A1A] text-xs font-bold uppercase tracking-widest flex items-center justify-between transition-colors mb-4 cursor-pointer border border-[#E5E5E5]"
                  >
                    <span>커리큘럼 4단계 상세 확인</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {/* Curriculum Accordion */}
                  {isExpanded && (
                    <div className="space-y-3 mb-6 p-4 bg-[#1A1A1A] text-white rounded-lg animate-in fade-in duration-200">
                      <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-2">
                        CURRICULUM STEPS
                      </p>
                      {cls.curriculum.map((curr, idx) => (
                        <div key={idx} className="border-b border-gray-800 pb-2.5 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between text-xs font-bold text-gray-200 mb-0.5">
                            <span>{curr.step}</span>
                            <span>{curr.title}</span>
                          </div>
                          <p className="text-[11px] text-gray-400 leading-snug">
                            {curr.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

                {/* Class Inquiry Action */}
                <div className="pt-4 border-t border-[#E5E5E5] space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-[#1A1A1A]">
                    <span className="text-gray-400 font-normal">수강료 / 강의 견적</span>
                    <span>{cls.price}</span>
                  </div>

                  <button
                    onClick={() => onInquireClass(cls.title)}
                    className="w-full py-3.5 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>이 강의 수강/출강 문의하기</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
