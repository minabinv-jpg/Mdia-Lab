import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { Menu, X, FileText, Phone, MessageSquare, Layers, Shield, ShieldCheck } from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  onNavigate: (sectionId: string) => void;
  activeSection: string;
  currentUser: User | null;
  onOpenAdminAuth: () => void;
  customLogoUrl?: string;
  onLogoUpload?: (url: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onNavigate, 
  activeSection,
  currentUser,
  onOpenAdminAuth,
  customLogoUrl,
  onLogoUpload
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'company-intro', label: 'ABOUT', icon: Layers },
    { id: 'features', label: 'SERVICES', icon: FileText },
    { id: 'bulletin-board', label: 'BOARD', icon: MessageSquare },
    { id: 'estimate', label: 'ESTIMATE', icon: Phone }
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 h-[72px] flex items-center bg-white border-b border-[#E5E5E5] ${
        scrolled ? 'shadow-xs' : ''
      }`}
    >
      <div className="max-w-7xl w-full mx-auto px-6 lg:px-10 flex items-center justify-between">
        {/* Brand Logo Component */}
        <Logo 
          customLogoUrl={customLogoUrl} 
          onLogoUpload={onLogoUpload} 
          currentUser={currentUser}
          onOpenAdminAuth={onOpenAdminAuth}
          size="md"
        />

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-xs font-bold tracking-widest uppercase transition-colors cursor-pointer py-1 ${
                  isActive
                    ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]'
                    : 'text-gray-500 hover:text-[#1A1A1A]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* CTA Button & Admin Lock */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Admin Auth Toggle Button */}
          <button
            onClick={onOpenAdminAuth}
            className={`px-3 py-2 text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer border ${
              currentUser
                ? 'bg-blue-50 text-[#0300b0] border-blue-200 hover:bg-blue-100'
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
            }`}
            title={currentUser ? "관리자 인증됨 (로그아웃/관리)" : "관리자 로그인 (영상 삭제/등록)"}
          >
            {currentUser ? (
              <>
                <ShieldCheck className="w-4 h-4 text-[#0300b0]" />
                <span className="hidden xl:inline">ADMIN</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 text-gray-500" />
                <span className="hidden xl:inline">관리자</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleNavClick('estimate')}
            style={{ backgroundColor: '#0300b0', borderColor: '#0300b0' }}
            className="text-white px-5 py-2.5 text-xs font-bold tracking-widest hover:opacity-90 transition-opacity uppercase rounded-none cursor-pointer border"
          >
            FREE QUOTE
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={onOpenAdminAuth}
            className="p-1.5 text-gray-700 bg-gray-100 border border-gray-300 rounded"
          >
            <Shield className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleNavClick('estimate')}
            className="sm:hidden px-3 py-1.5 text-xs font-bold text-white bg-[#1A1A1A] tracking-wider uppercase"
          >
            FREE QUOTE
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#1A1A1A] hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-[72px] left-0 right-0 bg-white border-b border-[#E5E5E5] px-6 py-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-4 py-3 text-xs font-bold tracking-widest uppercase flex items-center gap-3 transition-colors ${
                    isActive
                      ? 'bg-[#1A1A1A] text-white'
                      : 'text-[#1A1A1A] hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#E5E5E5] flex flex-col gap-2">
            <button
              onClick={onOpenAdminAuth}
              className="w-full py-2.5 text-center text-xs font-bold text-gray-800 bg-gray-100 border border-gray-300 tracking-widest uppercase flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4 text-[#0300b0]" />
              <span>{currentUser ? "관리자 계정 상태" : "관리자 로그인"}</span>
            </button>

            <button
              onClick={() => handleNavClick('estimate')}
              className="w-full py-3 text-center text-xs font-bold text-white bg-[#1A1A1A] tracking-widest uppercase hover:bg-gray-800"
            >
              FREE QUOTE
            </button>
            <div className="text-center text-[10px] text-gray-500 tracking-wider pt-1 uppercase">
              MDIA LAB PRODUCTION | TEL: 0502-5554-3919 | minabinv2@gmail.com
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
