import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { CompanyIntro } from './components/CompanyIntro';
import { Portfolio } from './components/Portfolio';
import { Testimonials } from './components/Testimonials';
import { BlogNews } from './components/BlogNews';
import { WorkshopClasses } from './components/WorkshopClasses';
import { BoardNotice } from './components/BoardNotice';
import { EstimateForm } from './components/EstimateForm';
import { VideoModal } from './components/VideoModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { Footer } from './components/Footer';
import { AIChatBot } from './components/AIChatBot';
import { PortfolioItem } from './types';
import { PORTFOLIO_DATA } from './data/mockData';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  subscribeShowreelConfig, 
  updateShowreelConfig, 
  ShowreelConfig, 
  DEFAULT_SHOWREEL,
  extractYoutubeId,
  subscribeLogoConfig,
  updateLogoConfig
} from './lib/firestoreService';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [selectedVideo, setSelectedVideo] = useState<PortfolioItem | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState<boolean>(false);
  const [showreelConfig, setShowreelConfig] = useState<ShowreelConfig>(DEFAULT_SHOWREEL);
  const [customLogoUrl, setCustomLogoUrl] = useState<string>('');
  
  // Pre-fill states for estimate form
  const [estimateYoutubeRef, setEstimateYoutubeRef] = useState<string>('');
  const [estimateCategory, setEstimateCategory] = useState<string>('홍보영상 제작');

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Showreel Firestore subscription
  useEffect(() => {
    const unsubscribe = subscribeShowreelConfig((config) => {
      setShowreelConfig(config);
    });
    return () => unsubscribe();
  }, []);

  // Logo Firestore subscription
  useEffect(() => {
    const unsubscribe = subscribeLogoConfig((logoUrl) => {
      setCustomLogoUrl(logoUrl);
    });
    return () => unsubscribe();
  }, []);

  // Smooth scroll handler
  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Open Showreel video modal
  const handleOpenShowreel = () => {
    const finalUrl = showreelConfig.youtubeUrl || 'https://youtu.be/SeXdFQYOZvg';
    const ytId = extractYoutubeId(finalUrl);
    const showreelItem: PortfolioItem = {
      id: 'showreel-main',
      title: showreelConfig.title || 'Mdia Lab 대표 브랜드 광고·홍보영상',
      category: '광고/홍보영상',
      client: 'Mdia Lab Official',
      year: new Date().getFullYear().toString(),
      youtubeUrl: finalUrl,
      youtubeId: ytId,
      thumbnail: `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`,
      description: showreelConfig.description || 'Mdia Lab 공식 대표 브랜드 광고·홍보영상입니다.',
      tags: ['광고영상', '홍보영상', 'MDIA LAB', '시네마틱'],
      runtime: showreelConfig.runtime || '01:15'
    };
    setSelectedVideo(showreelItem);
  };

  // Navigate to Estimate form with Youtube URL pre-filled
  const handleNavigateEstimateWithRef = (url: string) => {
    setEstimateYoutubeRef(url);
    handleNavigate('estimate');
  };

  // Inquire specific workshop class
  const handleInquireClass = (className: string) => {
    setEstimateCategory('영상/영화제작 강의 문의');
    handleNavigate('estimate');
  };

  // Track active section on scroll
  useEffect(() => {
    const sections = ['hero', 'company-intro', 'features', 'portfolio', 'testimonials', 'blog-news', 'workshops', 'bulletin-board', 'estimate'];
    
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans antialiased selection:bg-neutral-900 selection:text-white">
      {/* Sticky Header Navigation */}
      <Header 
        onNavigate={handleNavigate} 
        activeSection={activeSection} 
        currentUser={currentUser}
        onOpenAdminAuth={() => setIsAdminAuthOpen(true)}
        customLogoUrl={customLogoUrl}
        onLogoUpload={updateLogoConfig}
      />

      {/* Main Single Page Sections */}
      <main id="hero">
        <Hero
          showreelConfig={showreelConfig}
          onOpenShowreel={handleOpenShowreel}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onUpdateShowreel={updateShowreelConfig}
        />

        <CompanyIntro />

        <Features onNavigate={handleNavigate} />

        <Portfolio
          onPlayVideo={(item) => setSelectedVideo(item)}
          onNavigateEstimateWithRef={handleNavigateEstimateWithRef}
          currentUser={currentUser}
          onOpenAdminAuth={() => setIsAdminAuthOpen(true)}
        />

        <Testimonials 
          currentUser={currentUser} 
          onOpenAdminAuth={() => setIsAdminAuthOpen(true)} 
        />

        <BlogNews />

        <WorkshopClasses onInquireClass={handleInquireClass} />

        <BoardNotice 
          currentUser={currentUser} 
          onOpenAdminAuth={() => setIsAdminAuthOpen(true)} 
        />

        <EstimateForm
          initialYoutubeRef={estimateYoutubeRef}
          initialCategory={estimateCategory}
        />
      </main>

      {/* Footer */}
      <Footer 
        onNavigate={handleNavigate} 
        customLogoUrl={customLogoUrl}
        onLogoUpload={updateLogoConfig}
        currentUser={currentUser}
        onOpenAdminAuth={() => setIsAdminAuthOpen(true)}
      />

      {/* Video Modal Player */}
      <VideoModal
        item={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />

      {/* Admin Auth Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        currentUser={currentUser}
        onNavigate={handleNavigate}
      />

      {/* 1:1 AI Automated Chatbot & Customer SMS Dispatch Floating Widget */}
      <AIChatBot currentUser={currentUser} />
    </div>
  );
}
