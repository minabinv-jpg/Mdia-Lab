import React, { useState, useEffect } from 'react';
import { Camera, Upload, X, Shield, Lock, ShieldCheck, RefreshCw } from 'lucide-react';
import { User } from 'firebase/auth';

interface LogoProps {
  customLogoUrl?: string;
  onLogoUpload?: (url: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  currentUser?: User | null;
  onOpenAdminAuth?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  customLogoUrl,
  onLogoUpload,
  className = '',
  size = 'md',
  currentUser,
  onOpenAdminAuth
}) => {
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(customLogoUrl || null);

  useEffect(() => {
    setPreviewUrl(customLogoUrl || null);
  }, [customLogoUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser) {
      alert("로고 이미지 업로드는 관리자 로그인이 필요합니다.");
      if (onOpenAdminAuth) onOpenAdminAuth();
      return;
    }

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const url = event.target.result as string;
          setPreviewUrl(url);
          if (onLogoUpload) {
            onLogoUpload(url);
          }
          setLogoModalOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoClick = () => {
    if (currentUser) {
      setLogoModalOpen(true);
    } else {
      // For general visitors, smoothly scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const dimensions = {
    sm: { width: 'w-24', height: 'h-8', text: 'text-xs', holes: 'w-1 h-1.5' },
    md: { width: 'w-32 sm:w-36', height: 'h-10 sm:h-11', text: 'text-sm font-extrabold', holes: 'w-1.5 h-2' },
    lg: { width: 'w-44 sm:w-52', height: 'h-14 sm:h-16', text: 'text-base sm:text-lg font-black', holes: 'w-2 h-2.5' }
  }[size];

  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`}>
      {/* If custom image logo is uploaded */}
      {previewUrl ? (
        <div 
          onClick={handleLogoClick}
          className="relative group cursor-pointer overflow-hidden rounded border border-neutral-300 dark:border-neutral-700 shadow-sm bg-neutral-900 flex items-center justify-center p-1"
          title={currentUser ? "로고 이미지 설정 (관리자)" : "Mdia Lab 홈으로 이동"}
        >
          <img 
            src={previewUrl} 
            alt="Mdia Lab Custom Logo" 
            className="h-9 w-auto max-w-[160px] object-contain rounded"
          />
          {currentUser && (
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-medium gap-1">
              <Camera className="w-3 h-3 text-blue-400" />
              <span>로고 변경</span>
            </div>
          )}
        </div>
      ) : (
        /* Cinematic Film Frame Sprocket Negative Logo */
        <div 
          onClick={handleLogoClick}
          className={`group cursor-pointer select-none relative bg-neutral-950 text-white rounded-md shadow-md border border-neutral-800 p-1.5 flex flex-col justify-between ${dimensions.width} ${dimensions.height} hover:border-neutral-500 transition-all duration-300 overflow-hidden`}
          title={currentUser ? "Mdia Lab 시네마 로고 (관리자 이미지 교체 가능)" : "Mdia Lab 홈으로 이동"}
        >
          {/* Top Sprocket Holes */}
          <div className="flex justify-between items-center px-1 opacity-70">
            {[...Array(6)].map((_, i) => (
              <div key={`top-${i}`} className={`bg-neutral-800 rounded-xs ${dimensions.holes}`} />
            ))}
          </div>

          {/* Center Brand Text */}
          <div className="flex items-center justify-between px-1 tracking-widest font-mono">
            <span className={`${dimensions.text} text-neutral-100 group-hover:text-amber-400 transition-colors uppercase`}>
              M D I A
            </span>
            <span className="text-[10px] sm:text-xs text-neutral-400 font-sans tracking-tight font-semibold bg-neutral-800 px-1.5 py-0.5 rounded">
              LAB
            </span>
          </div>

          {/* Bottom Sprocket Holes */}
          <div className="flex justify-between items-center px-1 opacity-70">
            {[...Array(6)].map((_, i) => (
              <div key={`bottom-${i}`} className={`bg-neutral-800 rounded-xs ${dimensions.holes}`} />
            ))}
          </div>

          {/* Hover Overlay Hint (Only for Admin) */}
          {currentUser && (
            <div className="absolute inset-0 bg-neutral-900/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-blue-300 font-sans font-bold gap-1">
              <Upload className="w-3 h-3" /> 로고 설정
            </div>
          )}
        </div>
      )}

      {/* Brand Text Beside Logo */}
      <div className="flex flex-col cursor-pointer" onClick={handleLogoClick}>
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-neutral-900 tracking-tight text-lg sm:text-xl font-mono">
            Mdia<span className="text-neutral-500 font-light ml-0.5">Lab</span>
          </span>
          <span className="text-[10px] font-semibold text-neutral-600 bg-neutral-100 border border-neutral-200 px-1.5 py-0.2 rounded uppercase">
            FILM & VIDEO
          </span>
        </div>
        <span className="text-[10px] text-neutral-600 tracking-wider font-medium">
          영화 영상 강의 크리에디티브 연구소
        </span>
      </div>

      {/* Admin Quick Logo Setting Gear Button if logged in */}
      {currentUser && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLogoModalOpen(true);
          }}
          className="p-1 text-gray-400 hover:text-[#0300b0] hover:bg-blue-50 rounded transition-colors"
          title="로고 이미지 설정 (관리자)"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Upload Custom Logo Modal */}
      {logoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in duration-200 text-left">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#0300b0]" />
                <h3 className="text-base font-bold text-neutral-900">Mdia Lab 로고 이미지 설정</h3>
              </div>
              <button 
                onClick={() => setLogoModalOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {currentUser ? (
              /* Admin Upload Authorized View */
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-[#0300b0] border border-blue-200 rounded-lg text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#0300b0] shrink-0" />
                  <span>관리자 인증됨: 로고 이미지를 선택하여 교체할 수 있습니다.</span>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  Mdia Lab의 대표 시네마 필름 로고를 상단 헤더에 사용하거나, 원하시는 자체 로고 이미지(PNG, JPG, SVG, WebP)를 직접 선택하여 업로드할 수 있습니다.
                </p>

                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-neutral-500 transition-colors bg-neutral-50">
                  <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-neutral-700 mb-1">로고 이미지 파일 선택</p>
                  <p className="text-xs text-neutral-500 mb-3">투명 배경 PNG 추천 (최대 5MB)</p>
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-[#0300b0] text-white text-xs font-bold rounded-md hover:opacity-90 transition-opacity shadow-sm">
                    컴퓨터에서 파일 찾기
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                </div>

                {previewUrl && (
                  <div className="flex items-center justify-between p-3 bg-neutral-100 rounded-md border border-neutral-200">
                    <div className="flex items-center gap-3">
                      <img src={previewUrl} alt="Preview" className="h-8 w-auto object-contain rounded border border-neutral-300 bg-neutral-900 p-0.5" />
                      <span className="text-xs text-neutral-700 font-bold">현재 적용된 로고</span>
                    </div>
                    <button 
                      onClick={() => {
                        setPreviewUrl(null);
                        if (onLogoUpload) onLogoUpload('');
                        setLogoModalOpen(false);
                      }}
                      className="text-xs text-red-600 hover:underline font-bold flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>기본 필름 로고로 복원</span>
                    </button>
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => setLogoModalOpen(false)}
                    className="px-4 py-2 bg-neutral-100 text-neutral-800 text-xs font-bold rounded-md hover:bg-neutral-200 transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </div>
            ) : (
              /* Non-Admin Auth Required View */
              <div className="space-y-4 py-2 text-center">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-neutral-900">관리자 로그인이 필요합니다</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed max-w-sm mx-auto">
                    Mdia Lab의 로고 이미지 설정 및 변경은 웹사이트 관리자만 가능합니다.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setLogoModalOpen(false)}
                    className="flex-1 py-2.5 bg-neutral-100 text-neutral-700 text-xs font-bold rounded-lg hover:bg-neutral-200"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      setLogoModalOpen(false);
                      if (onOpenAdminAuth) onOpenAdminAuth();
                    }}
                    style={{ backgroundColor: '#0300b0' }}
                    className="flex-1 py-2.5 text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Shield className="w-4 h-4" />
                    <span>관리자 로그인</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

