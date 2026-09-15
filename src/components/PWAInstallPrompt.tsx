import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share, PlusSquare, CheckCircle2, Sparkles, ChevronRight, HelpCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);
  const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Check if already running in standalone mode (already installed & opened as PWA)
    const isStandaloneApp = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandaloneApp) {
      setIsStandalone(true);
      return;
    }

    // Check if user dismissed prompt for 24 hours
    const dismissedUntil = localStorage.getItem('mdia_pwa_dismissed');
    if (dismissedUntil && new Date().getTime() < parseInt(dismissedUntil, 10)) {
      return;
    }

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPhone|iPad|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt event (Android/Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Auto show banner after 2.5 seconds
      setTimeout(() => {
        setShowPrompt(true);
      }, 2500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // On iOS Safari, show prompt if not standalone
    if (isIOSDevice) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    } else if (!deferredPrompt) {
      // Show default PWA invitation banner after 4 seconds
      setTimeout(() => {
        setShowPrompt(true);
      }, 4000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstalledSuccess(true);
        setTimeout(() => setShowPrompt(false), 3000);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // General instructions for other browsers
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = (for24Hours = false) => {
    setShowPrompt(false);
    if (for24Hours) {
      const tomorrow = new Date().getTime() + 24 * 60 * 60 * 1000;
      localStorage.setItem('mdia_pwa_dismissed', tomorrow.toString());
    }
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <>
      {/* Floating Bottom App Installation Banner */}
      <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 animate-in slide-in-from-bottom-8 fade-in duration-300">
        <div className="bg-neutral-900 text-white rounded-2xl p-4 shadow-2xl border border-blue-500/30 flex flex-col gap-3 relative overflow-hidden backdrop-blur-md">
          {/* Top Accent Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-amber-400 to-emerald-400" />

          {/* Banner Header */}
          <div className="flex items-start justify-between gap-2 pt-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0300b0] flex items-center justify-center shrink-0 shadow-md border border-blue-400/40">
                <Smartphone className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Mdia Lab 모바일 앱 홈 화면 추가</span>
                  <span className="px-1.5 py-0.5 text-[9px] bg-amber-500 text-neutral-950 font-extrabold rounded-full">PWA</span>
                </h4>
                <p className="text-[11px] text-neutral-300">
                  앱스토어 설치 없이 홈 화면에서 원클릭으로 바로 접속하세요!
                </p>
              </div>
            </div>

            <button
              onClick={() => handleDismiss(false)}
              className="p-1 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons */}
          {installedSuccess ? (
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">Mdia Lab 앱이 홈 화면에 설치되었습니다!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleInstallClick}
                className="flex-1 py-2.5 px-3 bg-[#0300b0] hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-lg flex items-center justify-center gap-1.5 active:scale-98"
              >
                <Download className="w-4 h-4 text-amber-300 animate-bounce" />
                <span>홈 화면에 앱 추가하기</span>
              </button>

              <button
                onClick={() => handleDismiss(true)}
                className="py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[11px] rounded-xl transition-colors cursor-pointer shrink-0"
              >
                오늘 안보기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* iOS / Browser Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-neutral-200 text-neutral-800">
            
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                <Smartphone className="w-5 h-5 text-[#0300b0]" />
                <span>스마트폰 홈 화면에 앱 추가 안내</span>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <p className="text-neutral-600 font-medium">
                스마트폰 브라우저 메뉴를 통해 3초 만에 홈 화면 앱으로 추가하실 수 있습니다:
              </p>

              {/* Step 1 */}
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#0300b0] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div>
                  <p className="font-bold text-blue-950 flex items-center gap-1">
                    <span>브라우저 하단/상단 [공유] 또는 [메뉴] 버튼 클릭</span>
                    <Share className="w-3.5 h-3.5 text-[#0300b0]" />
                  </p>
                  <p className="text-[11px] text-blue-800">
                    사파리(Safari)는 하단 중앙 <strong>공유(↑)</strong> 버튼, 크롬/삼성이동은 <strong>메뉴(⋮)</strong> 버튼을 누릅니다.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div>
                  <p className="font-bold text-amber-950 flex items-center gap-1">
                    <span>['홈 화면에 추가'] 항목 선택</span>
                    <PlusSquare className="w-3.5 h-3.5 text-amber-600" />
                  </p>
                  <p className="text-[11px] text-amber-800">
                    메뉴 목록에서 <strong>'홈 화면에 추가'</strong>를 누른 후 [추가]를 완료하세요.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-2.5 bg-neutral-100 rounded-xl text-neutral-600 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>이제 홈 화면에 생성된 Mdia Lab 아이콘으로 빠르게 접속 가능합니다!</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-[#0300b0] hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              확인하였습니다
            </button>
          </div>
        </div>
      )}
    </>
  );
};
