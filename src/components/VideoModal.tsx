import React from 'react';
import { PortfolioItem } from '../types';
import { X, ExternalLink, Film, Youtube } from 'lucide-react';

interface VideoModalProps {
  item: PortfolioItem | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const isAdCategory = item.category === '광고/홍보영상' || item.id === 'p1';
  const targetYoutubeId = isAdCategory ? 'SeXdFQYOZvg' : (item.youtubeId || 'SeXdFQYOZvg');
  const targetYoutubeUrl = isAdCategory ? 'https://youtu.be/SeXdFQYOZvg' : (item.youtubeUrl || `https://youtu.be/${targetYoutubeId}`);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-neutral-950 text-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-neutral-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-mono font-bold bg-neutral-800 text-amber-400 px-2.5 py-1 rounded shrink-0">
              {item.category}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white truncate">
              {item.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={targetYoutubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-lg text-xs font-semibold border border-neutral-700 transition-colors"
              title="새 창에서 유튜브 링크 열기"
            >
              <Youtube className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden sm:inline">유튜브 열기</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="relative aspect-video bg-black w-full overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${targetYoutubeId}?autoplay=1&rel=0&enablejsapi=1`}
            title={item.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>

        {/* Video Meta Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto bg-neutral-950 text-xs">
          <div className="flex flex-wrap justify-between items-center gap-2 text-neutral-400 font-mono border-b border-neutral-800 pb-3">
            <div>
              <span>클라이언트: </span>
              <strong className="text-white font-sans">{item.client}</strong>
            </div>
            <div>
              <span>제작연도: </span>
              <strong className="text-white font-sans">{item.year}</strong>
            </div>
            {item.runtime && (
              <div>
                <span>러닝타임: </span>
                <strong className="text-white font-sans">{item.runtime}</strong>
              </div>
            )}
          </div>

          <p className="text-neutral-300 leading-relaxed font-sans text-sm">
            {item.description}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-400 px-2 py-0.5 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <a
              href={targetYoutubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 rounded-lg text-xs font-semibold border border-neutral-800 transition-colors"
            >
              <Youtube className="w-4 h-4 text-red-500" />
              <span>유튜브에서 크게보기 ({targetYoutubeUrl})</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
