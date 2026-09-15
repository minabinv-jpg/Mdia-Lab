import React from 'react';
import { FEATURE_CARDS } from '../data/mockData';
import { Film, Clapperboard, Calculator, ArrowRight, Check } from 'lucide-react';

interface FeaturesProps {
  onNavigate: (sectionId: string) => void;
}

export const Features: React.FC<FeaturesProps> = ({ onNavigate }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Film':
        return <Film className="w-6 h-6 text-[#1A1A1A]" />;
      case 'Clapperboard':
        return <Clapperboard className="w-6 h-6 text-[#1A1A1A]" />;
      case 'Calculator':
        return <Calculator className="w-6 h-6 text-[#1A1A1A]" />;
      default:
        return <Film className="w-6 h-6 text-[#1A1A1A]" />;
    }
  };

  return (
    <section id="features" className="py-20 bg-[#F5F5F5] border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-gray-400 tracking-[0.3em] uppercase block">
            CORE SERVICES
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
            Mdia Lab의 3가지 핵심 제작 영역
          </h2>
          <p className="text-base text-gray-500 leading-relaxed max-w-xl mx-auto">
            시네마 미학 및 체계화된 시스템으로 브랜드 가치를 극대화합니다.
          </p>
        </div>

        {/* 3 Core Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURE_CARDS.map((card, index) => (
            <div
              key={card.id}
              className="bg-white p-8 border border-[#E5E5E5] rounded-xl flex flex-col justify-between group hover:border-[#1A1A1A] transition-colors relative"
            >
              <div>
                {/* Index & Subtitle */}
                <div className="flex justify-between items-center mb-4">
                  <div className="w-12 h-12 bg-[#F5F5F5] rounded-sm flex items-center justify-center border border-[#E5E5E5] group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
                    <div className="group-hover:text-white group-hover:brightness-200">
                      {getIcon(card.iconName)}
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-gray-400">
                    0{index + 1}
                  </span>
                </div>

                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  {card.subtitle}
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] mb-3 tracking-tight">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  {card.description}
                </p>

                {/* Point List */}
                <ul className="space-y-2.5 mb-8 pt-4 border-t border-[#E5E5E5]">
                  {card.points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                      <div className="w-4 h-4 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Link Button */}
              <button
                onClick={() => onNavigate(card.actionSection)}
                className="w-full py-3.5 px-4 bg-[#1A1A1A] text-white text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 cursor-pointer mt-auto"
              >
                <span>{card.actionText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
