import React, { useState, useEffect } from 'react';
import { PORTFOLIO_DATA } from '../data/mockData';
import { PortfolioItem } from '../types';
import { 
  Play, 
  Search, 
  Plus, 
  ExternalLink, 
  Film, 
  Youtube, 
  Eye, 
  LayoutGrid, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  Check, 
  Trash2, 
  ShieldCheck, 
  Upload, 
  X, 
  Edit3, 
  Lock,
  Sparkles,
  Tag,
  Calendar,
  Building,
  Clock
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  subscribePortfolios, 
  addPortfolioVideo, 
  deletePortfolioVideo, 
  updatePortfolioVideo, 
  extractYoutubeId 
} from '../lib/firestoreService';
import { apiClient, D1Video } from '../lib/apiClient';

interface PortfolioProps {
  onPlayVideo: (item: PortfolioItem) => void;
  onNavigateEstimateWithRef?: (url: string) => void;
  currentUser?: User | null;
  onOpenAdminAuth?: () => void;
}

export const Portfolio: React.FC<PortfolioProps> = ({ 
  onPlayVideo, 
  onNavigateEstimateWithRef,
  currentUser,
  onOpenAdminAuth
}) => {
  const [items, setItems] = useState<PortfolioItem[]>(PORTFOLIO_DATA);
  const [activeCategory, setActiveCategory] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid');
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add Video Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customClient, setCustomClient] = useState<string>('Mdia Lab');
  const [customCategory, setCustomCategory] = useState<string>('광고/홍보영상');
  const [customDesc, setCustomDesc] = useState<string>('');
  const [customYear, setCustomYear] = useState<string>(new Date().getFullYear().toString());
  const [customRuntime, setCustomRuntime] = useState<string>('01:15');
  const [customTags, setCustomTags] = useState<string>('광고영상, 홍보영상, MdiaLab');
  const [customFeatured, setCustomFeatured] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Edit Video Modal State
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editUrl, setEditUrl] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('광고/홍보영상');
  const [editClient, setEditClient] = useState<string>('');
  const [editYear, setEditYear] = useState<string>('');
  const [editDesc, setEditDesc] = useState<string>('');
  const [editRuntime, setEditRuntime] = useState<string>('');
  const [editTags, setEditTags] = useState<string>('');
  const [editFeatured, setEditFeatured] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const categories = ['전체', '광고/홍보영상', '영상 공모전 수상작'];
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  // Subscribe to Firestore Portfolio Data & sync with Cloudflare D1 /api/videos
  useEffect(() => {
    const unsubscribe = subscribePortfolios((fetchedItems) => {
      setItems(fetchedItems);
    });

    // Cloudflare D1 API /api/videos 통신 확인
    const syncWithD1 = async () => {
      try {
        const res = await apiClient.getVideos();
        if (!res.success && res.message) {
          console.warn('[D1 Sync Notice]:', res.message);
        }
      } catch (err) {
        console.error('[D1 Sync Error]:', err);
      }
    };
    syncWithD1();

    return () => unsubscribe();
  }, []);

  // Track category click activity to Cloudflare Pages Functions
  const handleCategorySelect = async (cat: string) => {
    setActiveCategory(cat);
    setCarouselIndex(0);

    // D1 활동 로그 비동기 전송
    try {
      await apiClient.recordActivity({
        actionType: 'CATEGORY_CLICK',
        categoryClicked: cat,
        metadata: { timestamp: new Date().toISOString() }
      });
    } catch (e) {
      console.warn('Failed to record category click to D1:', e);
    }
  };

  const handleOpenAdd = () => {
    if (!currentUser) {
      if (onOpenAdminAuth) {
        onOpenAdminAuth();
      } else {
        alert("영상 등록은 관리자 로그인이 필요합니다.");
      }
      return;
    }
    setShowAddModal(true);
  };

  const handleAddVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("영상 등록은 관리자 로그인이 필요합니다.");
      if (onOpenAdminAuth) onOpenAdminAuth();
      return;
    }
    if (!customUrl) return;
    setIsSubmitting(true);

    try {
      const ytId = extractYoutubeId(customUrl);
      const tagArray = customTags
        .split(',')
        .map(t => t.trim().replace(/^#/, ''))
        .filter(t => t.length > 0);

      const newVideoData: Omit<PortfolioItem, 'id'> = {
        title: customTitle || '신규 동영상 포트폴리오',
        category: customCategory,
        client: customClient || 'Mdia Lab',
        year: customYear || new Date().getFullYear().toString(),
        youtubeUrl: customUrl,
        youtubeId: ytId,
        thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        description: customDesc || 'Mdia Lab 관리자가 등록한 최신 영상 포트폴리오입니다.',
        tags: tagArray.length > 0 ? tagArray : ['동영상포트폴리오', customCategory, '유튜브'],
        isFeatured: customFeatured,
        runtime: customRuntime || '02:00'
      };

      // 1. Firebase Firestore 실시간 저장
      await addPortfolioVideo(newVideoData);

      // 2. Cloudflare D1 (/api/videos) 엔드포인트 연동 (비동기 병렬 저장)
      try {
        const d1Res = await apiClient.uploadVideo({
          title: newVideoData.title,
          videoUrl: newVideoData.youtubeUrl,
          youtubeId: ytId,
          category: newVideoData.category,
          client: newVideoData.client,
          year: newVideoData.year,
          description: newVideoData.description,
          runtime: newVideoData.runtime,
          isFeatured: newVideoData.isFeatured
        }, 'Admin');

        if (!d1Res.success && d1Res.message) {
          console.warn('[D1 Upload Note]:', d1Res.message);
        }
      } catch (d1Err) {
        console.warn('[D1 Upload Exception]:', d1Err);
      }

      setCustomUrl('');
      setCustomTitle('');
      setCustomDesc('');
      setCustomTags('영상제작, 홍보영상, MdiaLab');
      setCustomFeatured(false);
      setShowAddModal(false);
      setApiErrorMessage(null);
    } catch (err: any) {
      console.error("Error adding video:", err);
      setApiErrorMessage(err.message || "영상 등록 중 통신 오류가 발생했습니다.");
      alert("영상 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (item: PortfolioItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      if (onOpenAdminAuth) {
        onOpenAdminAuth();
      } else {
        alert("영상 내용 수정은 관리자 로그인이 필요합니다.");
      }
      return;
    }
    setEditingItem(item);
    setEditTitle(item.title);
    setEditUrl(item.youtubeUrl);
    setEditCategory(item.category);
    setEditClient(item.client);
    setEditYear(item.year);
    setEditDesc(item.description);
    setEditRuntime(item.runtime || '02:00');
    setEditTags(item.tags.join(', '));
    setEditFeatured(!!item.isFeatured);
  };

  const handleEditVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("영상 수정은 관리자 로그인이 필요합니다.");
      if (onOpenAdminAuth) onOpenAdminAuth();
      return;
    }
    if (!editingItem) return;
    setIsEditing(true);

    try {
      const ytId = extractYoutubeId(editUrl);
      const tagArray = editTags
        .split(',')
        .map(t => t.trim().replace(/^#/, ''))
        .filter(t => t.length > 0);

      const updatedFields: Partial<PortfolioItem> = {
        title: editTitle,
        youtubeUrl: editUrl,
        youtubeId: ytId,
        thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        category: editCategory,
        client: editClient,
        year: editYear,
        description: editDesc,
        runtime: editRuntime,
        tags: tagArray.length > 0 ? tagArray : ['동영상포트폴리오', editCategory],
        isFeatured: editFeatured
      };

      await updatePortfolioVideo(editingItem.id, updatedFields);
      setEditingItem(null);
    } catch (err) {
      console.error("Error updating video:", err);
      alert("동영상 수정 중 오류가 발생했습니다.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteVideo = async (item: PortfolioItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      if (onOpenAdminAuth) {
        onOpenAdminAuth();
      } else {
        alert("영상 삭제는 관리자 로그인이 필요합니다.");
      }
      return;
    }
    if (!window.confirm(`[${item.title}] 영상을 포트폴리오에서 삭제하시겠습니까?`)) return;

    try {
      // 1. Firebase Firestore 삭제
      await deletePortfolioVideo(item.id);

      // 2. Cloudflare D1 /api/videos DELETE 연동
      try {
        await apiClient.deleteVideo(item.id, 'Admin');
      } catch (d1Err) {
        console.warn('[D1 Delete Note]:', d1Err);
      }
      setApiErrorMessage(null);
    } catch (err: any) {
      console.error("Error deleting video:", err);
      setApiErrorMessage(err.message || "동영상 삭제 처리 중 오류가 발생했습니다.");
      alert("동영상 삭제 중 오류가 발생했습니다. (관리자 권한을 확인하세요)");
    }
  };

  const sanitizeItem = (it: PortfolioItem): PortfolioItem => {
    if (it.id === 'p1' || it.youtubeId === 'SeXdFQYOZvg' || it.title?.includes('Mdia Lab 광고') || it.title?.includes('DEMO')) {
      return {
        ...it,
        id: it.id || 'p1',
        title: "Mdia Lab 광고 홍보영상 포트폴리오",
        client: "Mdia Lab Official",
        year: "2026",
        category: "광고/홍보영상",
        description: "Mdia Lab의 감각적인 시네마틱 연출과 독창적인 영상 미학을 담은 공식 광고·홍보영상 포트폴리오입니다. 브랜드의 핵심 가치와 비전을 시각적으로 완성도 높게 전달합니다.",
        tags: ["Mdia Lab", "광고영상", "홍보영상", "시네마틱", "브랜드필름"],
        youtubeUrl: 'https://youtu.be/SeXdFQYOZvg',
        youtubeId: 'SeXdFQYOZvg',
        thumbnail: 'https://img.youtube.com/vi/SeXdFQYOZvg/maxresdefault.jpg',
      };
    }
    return it;
  };

  const handlePlay = (item: PortfolioItem) => {
    onPlayVideo(sanitizeItem(item));
  };

  const handleCopyLink = (item: PortfolioItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const safe = sanitizeItem(item);
    navigator.clipboard.writeText(safe.youtubeUrl);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter items
  const filteredItems = items
    .filter((item) => item.id !== 'p2' && !item.title.includes('Beyond Boundaries'))
    .map(sanitizeItem)
    .filter((item) => {
      const matchesCategory = activeCategory === '전체' || item.category === activeCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });

  const handlePrevCarousel = () => {
    setCarouselIndex((prev) => (prev === 0 ? filteredItems.length - 1 : prev - 1));
  };

  const handleNextCarousel = () => {
    setCarouselIndex((prev) => (prev === filteredItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="portfolio" className="py-20 bg-[#F5F5F5] border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-400 tracking-[0.3em] uppercase block">
              PORTFOLIO ARCHIVE
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
              Mdia Lab 포트폴리오
            </h2>
            <p className="text-base text-gray-500 max-w-2xl leading-relaxed break-keep">
              브랜드의 핵심 가치와 비전을 감각적인 시네마틱 영상 미학으로 완성도 높게 구현한
              <br />
              Mdia Lab의 공식 광고·홍보영상 포트폴리오입니다.
            </p>
          </div>

          {/* Admin Video Registration Action Button */}
          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#0300b0] border border-blue-200 text-xs font-bold rounded">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>관리자 인증됨</span>
                </span>
                <button
                  onClick={handleOpenAdd}
                  style={{ backgroundColor: '#0300b0' }}
                  className="inline-flex items-center gap-2 px-5 py-3 text-white text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-all cursor-pointer shadow-sm rounded-none"
                  title="관리자 전용: 신규 포트폴리오 동영상 등록"
                >
                  <Upload className="w-4 h-4" />
                  <span>신규 동영상 포트폴리오 등록</span>
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 px-4 py-3 bg-white text-gray-700 hover:text-[#0300b0] border border-gray-300 hover:border-[#0300b0] text-xs font-bold tracking-widest uppercase transition-all cursor-pointer shadow-2xs"
                title="관리자 로그인 후 동영상 등록이 가능합니다"
              >
                <Lock className="w-3.5 h-3.5 text-gray-400" />
                <span>동영상 등록 (관리자 전용)</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar & Controls */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center mb-8 bg-white p-4 border border-[#E5E5E5] rounded-xl shadow-2xs">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const count = cat === '전체' 
                ? items.length 
                : items.filter(i => i.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setCarouselIndex(0);
                  }}
                  className={`px-4 py-2 text-xs font-bold tracking-wider transition-all cursor-pointer rounded-lg flex items-center gap-1.5 ${
                    activeCategory === cat
                      ? 'bg-[#1A1A1A] text-white shadow-xs'
                      : 'bg-[#F5F5F5] text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{cat}</span>
                  {count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      activeCategory === cat ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-700'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-[#F5F5F5] border border-[#E5E5E5] p-1 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                    : 'text-gray-500 hover:text-[#1A1A1A]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setViewMode('carousel')}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'carousel'
                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                    : 'text-gray-500 hover:text-[#1A1A1A]'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Carousel</span>
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="제목, 클라이언트, 태그..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCarouselIndex(0);
                }}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#F5F5F5] border border-[#E5E5E5] rounded-md focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>
          </div>
        </div>

        {/* Empty Search State */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-[#E5E5E5]">
            <Film className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-700">검색 결과와 일치하는 작품이 없습니다.</p>
            <p className="text-xs text-gray-500 mt-1">다른 카테고리나 검색어를 선택해보세요.</p>
          </div>
        ) : viewMode === 'carousel' ? (
          /* Carousel Feature Mode */
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 sm:p-8 shadow-xs">
            {(() => {
              const current = filteredItems[carouselIndex] || filteredItems[0];
              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Video Thumbnail Large Container */}
                  <div className="lg:col-span-7 relative group aspect-video bg-black rounded-lg overflow-hidden border border-[#E5E5E5]">
                    <img
                      src={current.thumbnail}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = `https://img.youtube.com/vi/${current.youtubeId || 'SeXdFQYOZvg'}/hqdefault.jpg`;
                      }}
                      alt={current.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <button
                        onClick={() => handlePlay(current)}
                        className="w-16 h-16 rounded-full bg-white text-[#1A1A1A] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform cursor-pointer"
                        title="모달로 동영상 바로 재생"
                      >
                        <Play className="w-7 h-7 fill-[#1A1A1A] ml-1" />
                      </button>
                    </div>

                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="text-xs font-bold px-3 py-1 bg-[#1A1A1A] text-white tracking-widest uppercase">
                        {current.category}
                      </span>
                      {current.isFeatured && (
                        <span className="text-xs font-bold px-2.5 py-1 bg-amber-500 text-black font-mono flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          FEATURED
                        </span>
                      )}
                    </div>

                    {/* Admin Actions Overlay in Carousel (Edit / Delete) */}
                    {currentUser && (
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 z-20">
                        <button
                          onClick={(e) => handleOpenEdit(current, e)}
                          className="px-2.5 py-1.5 bg-neutral-900/90 hover:bg-[#0300b0] text-white rounded text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center gap-1"
                          title="포트폴리오 내용 수정"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>수정</span>
                        </button>
                        <button
                          onClick={(e) => handleDeleteVideo(current, e)}
                          className="p-1.5 bg-red-600/90 hover:bg-red-700 text-white rounded shadow-md transition-colors cursor-pointer"
                          title="동영상 포트폴리오 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {current.runtime && (
                      <span className="absolute bottom-4 right-4 text-xs font-mono font-bold px-2.5 py-1 bg-black/80 text-white">
                        {current.runtime}
                      </span>
                    )}
                  </div>

                  {/* Info Details & Actions */}
                  <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-neutral-400 border-b border-[#E5E5E5] pb-2">
                        <span>CLIENT: {current.client}</span>
                        <span>YEAR: {current.year}</span>
                      </div>

                      <h3 className="text-2xl font-bold text-[#1A1A1A] leading-tight tracking-tight">
                        {current.title}
                      </h3>

                      <p className="text-sm text-neutral-600 leading-relaxed pt-1 font-normal">
                        {current.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {current.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs font-mono text-gray-600 bg-[#F5F5F5] px-2.5 py-1 border border-[#E5E5E5]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="space-y-4 pt-4 border-t border-[#E5E5E5]">
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handlePlay(current)}
                          className="py-3 px-4 bg-[#1A1A1A] text-white text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          <span>모달에서 재생</span>
                        </button>

                        <a
                          href={current.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-3 px-4 bg-[#F5F5F5] hover:bg-gray-200 text-[#1A1A1A] border border-[#E5E5E5] text-xs font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Youtube className="w-4 h-4 text-red-600" />
                          <span>유튜브에서 보기</span>
                        </a>
                      </div>

                      <div className="flex items-center justify-between">
                        <button
                          onClick={(e) => handleCopyLink(current, e)}
                          className="text-xs font-bold text-gray-500 hover:text-[#1A1A1A] flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedId === current.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">링크 복사 완료</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3.5 h-3.5" />
                              <span>유튜브 링크 복사</span>
                            </>
                          )}
                        </button>

                        {onNavigateEstimateWithRef && (
                          <button
                            onClick={() => onNavigateEstimateWithRef(current.youtubeUrl)}
                            className="text-xs font-bold text-[#1A1A1A] hover:underline flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                          >
                            <span>유사 스타일 견적 요청</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Admin Extra Actions Bar in Carousel */}
                      {currentUser && (
                        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#0300b0] flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            관리자 작업
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleOpenEdit(current, e)}
                              className="px-3 py-1.5 bg-[#0300b0] text-white text-xs font-bold rounded hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>내용 수정</span>
                            </button>
                            <button
                              onClick={(e) => handleDeleteVideo(current, e)}
                              className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>삭제</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Slider Navigation Controls */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-mono font-bold text-gray-400">
                          {carouselIndex + 1} / {filteredItems.length} ITEMS
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={handlePrevCarousel}
                            className="p-2 bg-[#F5F5F5] hover:bg-gray-200 text-[#1A1A1A] border border-[#E5E5E5] transition-colors cursor-pointer"
                            aria-label="Previous project"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleNextCarousel}
                            className="p-2 bg-[#F5F5F5] hover:bg-gray-200 text-[#1A1A1A] border border-[#E5E5E5] transition-colors cursor-pointer"
                            aria-label="Next project"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          /* Grid View Mode */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-xl overflow-hidden border border-[#E5E5E5] hover:border-[#1A1A1A] transition-all duration-300 flex flex-col justify-between relative shadow-2xs"
              >
                <div>
                  {/* Thumbnail Container with Play Overlay */}
                  <div
                    onClick={() => handlePlay(item)}
                    className="relative aspect-video bg-black overflow-hidden cursor-pointer"
                  >
                    <img
                      src={item.thumbnail}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = `https://img.youtube.com/vi/${item.youtubeId || 'SeXdFQYOZvg'}/hqdefault.jpg`;
                      }}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 text-[#1A1A1A] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-[#1A1A1A] ml-0.5" />
                      </div>
                    </div>

                    {/* Badge Overlay */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-[#1A1A1A] text-white tracking-widest uppercase">
                        {item.category}
                      </span>
                      {item.isFeatured && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500 text-black font-mono">
                          FEATURED
                        </span>
                      )}
                    </div>

                    {/* Admin Action Buttons (Edit & Delete) - Only visible when Admin is logged in */}
                    {currentUser && (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                        <button
                          onClick={(e) => handleOpenEdit(item, e)}
                          className="px-2 py-1 bg-neutral-900/90 hover:bg-[#0300b0] text-white text-[11px] font-bold rounded shadow-md transition-colors cursor-pointer flex items-center gap-1"
                          title="동영상 포트폴리오 내용 수정"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>수정</span>
                        </button>
                        <button
                          onClick={(e) => handleDeleteVideo(item, e)}
                          className="p-1.5 bg-red-600/90 hover:bg-red-700 text-white rounded shadow-md transition-colors cursor-pointer"
                          title="동영상 포트폴리오 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {item.runtime && (
                      <span className="absolute bottom-3 right-3 text-[10px] font-mono font-bold px-2 py-0.5 bg-black/80 text-white">
                        {item.runtime}
                      </span>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-2">
                    <div className="flex justify-between items-center text-[11px] text-gray-500 font-medium">
                      <span>{item.client}</span>
                      <span className="font-mono">{item.year}</span>
                    </div>

                    <h3 
                      onClick={() => handlePlay(item)}
                      className="text-base font-bold text-[#1A1A1A] group-hover:text-gray-600 transition-colors line-clamp-1 cursor-pointer"
                    >
                      {item.title}
                    </h3>

                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Footer Tags & Actions */}
                <div className="p-5 pt-0 space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono font-medium text-gray-600 bg-[#F5F5F5] px-2 py-0.5 rounded-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#E5E5E5] gap-2">
                    <button
                      onClick={() => handlePlay(item)}
                      className="text-xs font-bold text-[#1A1A1A] hover:underline flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>모달 시청</span>
                    </button>

                    <a
                      href={item.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-gray-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                    >
                      <Youtube className="w-3.5 h-3.5" />
                      <span>유튜브</span>
                    </a>

                    {currentUser && (
                      <button
                        onClick={(e) => handleOpenEdit(item, e)}
                        className="text-[11px] font-bold text-[#0300b0] hover:underline flex items-center gap-0.5 cursor-pointer"
                        title="동영상 내용 수정"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>수정</span>
                      </button>
                    )}

                    {onNavigateEstimateWithRef && !currentUser && (
                      <button
                        onClick={() => onNavigateEstimateWithRef(item.youtubeUrl)}
                        className="text-[11px] font-semibold text-gray-500 hover:text-[#1A1A1A] flex items-center gap-1 cursor-pointer"
                        title="이 영상 스타일로 견적 문의"
                      >
                        <span>견적 문의</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Modal for Adding New Portfolio Video (Admin Only) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0300b0] flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    신규 포트폴리오 영상 등록
                  </h3>
                  <p className="text-[11px] text-gray-500">Mdia Lab Firestore DB에 실시간 저장됩니다.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVideoSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  작품 타이틀 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 2026 Mdia Lab Brand Film"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0300b0]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  유튜브 영상 URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=ScMzIvxBSi4 또는 https://youtu.be/..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0300b0] font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    카테고리 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0300b0] bg-white"
                  >
                    <option value="광고/홍보영상">광고/홍보영상</option>
                    <option value="영상 공모전 수상작">영상 공모전 수상작</option>
                    <option value="영화/상업작품">영화/상업작품</option>
                    <option value="다큐멘터리">다큐멘터리</option>
                    <option value="뮤직비디오">뮤직비디오</option>
                    <option value="숏폼/브랜디드">숏폼/브랜디드</option>
                    <option value="제작 강의">제작 강의</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    클라이언트 / 브랜드명
                  </label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="예: Mdia Lab, 현대자동차"
                      value={customClient}
                      onChange={(e) => setCustomClient(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0300b0]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    제작 연도
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="2026"
                      value={customYear}
                      onChange={(e) => setCustomYear(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0300b0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    영상 러닝타임
                  </label>
                  <div className="relative">
                    <Clock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="02:30"
                      value={customRuntime}
                      onChange={(e) => setCustomRuntime(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0300b0]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  검색 태그 (쉼표로 구분)
                </label>
                <div className="relative">
                  <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="기업홍보, 시네마틱, 4K, MdiaLab"
                    value={customTags}
                    onChange={(e) => setCustomTags(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0300b0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  작품 설명 및 기획 의도
                </label>
                <textarea
                  rows={3}
                  placeholder="작품의 스토리라인, 카메라 연출 기법, 색보정 등 상세 설명을 작성하세요."
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0300b0]"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featuredToggle"
                  checked={customFeatured}
                  onChange={(e) => setCustomFeatured(e.target.checked)}
                  className="w-4 h-4 text-[#0300b0] rounded border-gray-300"
                />
                <label htmlFor="featuredToggle" className="text-xs text-neutral-800 font-bold cursor-pointer">
                  ⭐ 메인 추천(FEATURED) 작품으로 등록
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-neutral-100 text-neutral-700 text-xs font-bold rounded-lg hover:bg-neutral-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ backgroundColor: '#0300b0' }}
                  className="px-6 py-2.5 text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Firestore 등록 중..." : "동영상 등록 완료"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Editing Portfolio Video Content (Admin Only) */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0300b0] flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    포트폴리오 내용 수정
                  </h3>
                  <p className="text-[11px] text-gray-500">ID: {editingItem.id} | Firestore 실시간 업데이트</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingItem(null)} 
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditVideoSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  작품 타이틀 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0300b0]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  유튜브 영상 URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0300b0] font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    카테고리 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0300b0] bg-white"
                  >
                    <option value="광고/홍보영상">광고/홍보영상</option>
                    <option value="영상 공모전 수상작">영상 공모전 수상작</option>
                    <option value="영화/상업작품">영화/상업작품</option>
                    <option value="다큐멘터리">다큐멘터리</option>
                    <option value="뮤직비디오">뮤직비디오</option>
                    <option value="숏폼/브랜디드">숏폼/브랜디드</option>
                    <option value="제작 강의">제작 강의</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    클라이언트 / 브랜드명
                  </label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={editClient}
                      onChange={(e) => setEditClient(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0300b0]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    제작 연도
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={editYear}
                      onChange={(e) => setEditYear(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0300b0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    영상 러닝타임
                  </label>
                  <div className="relative">
                    <Clock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={editRuntime}
                      onChange={(e) => setEditRuntime(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0300b0]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  검색 태그 (쉼표로 구분)
                </label>
                <div className="relative">
                  <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0300b0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  작품 설명 및 기획 의도
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-[#0300b0]"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editFeaturedToggle"
                  checked={editFeatured}
                  onChange={(e) => setEditFeatured(e.target.checked)}
                  className="w-4 h-4 text-[#0300b0] rounded border-gray-300"
                />
                <label htmlFor="editFeaturedToggle" className="text-xs text-neutral-800 font-bold cursor-pointer">
                  ⭐ 메인 추천(FEATURED) 작품으로 설정
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 bg-neutral-100 text-neutral-700 text-xs font-bold rounded-lg hover:bg-neutral-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  style={{ backgroundColor: '#0300b0' }}
                  className="px-6 py-2.5 text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEditing ? "수정 저장 중..." : "수정 내용 저장"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
};

