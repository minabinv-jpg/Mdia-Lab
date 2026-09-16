import React, { useState } from 'react';
import { BLOG_POSTS_DATA } from '../data/mockData';
import { BlogPostItem } from '../types';
import { Search, Calendar, Clock, User, ArrowRight, X, Plus, Share2, Check, BookOpen, Tag, CheckCircle2 } from 'lucide-react';

export const BlogNews: React.FC = () => {
  const [posts, setPosts] = useState<BlogPostItem[]>(BLOG_POSTS_DATA);
  const [activeCategory, setActiveCategory] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<BlogPostItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // New Post Form State
  const [newPost, setNewPost] = useState({
    title: '',
    category: '제작 비하인드' as BlogPostItem['category'],
    summary: '',
    content: '',
    featuredImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
    author: 'Mdia Lab 스튜디오',
    authorRole: '에디터',
    tags: '시네마, 영상기획, 노하우'
  });

  const categories = ['전체', '제작 비하인드', '영상 팁 & 노하우', '장비 & 기술 Review', '스튜디오 소식'];

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = activeCategory === '전체' || post.category === activeCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPost = posts.find((p) => p.isFeatured) || posts[0];

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;

    const created: BlogPostItem = {
      id: `b-${Date.now()}`,
      title: newPost.title,
      category: newPost.category,
      summary: newPost.summary || newPost.title,
      content: newPost.content,
      featuredImage: newPost.featuredImage,
      author: newPost.author,
      authorRole: newPost.authorRole,
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      readTime: '4분 읽기',
      tags: newPost.tags.split(',').map((t) => t.trim()).filter(Boolean),
      keyTakeaways: ['새롭게 게시된 Mdia Lab 아티클입니다.']
    };

    setPosts([created, ...posts]);
    setShowCreateModal(false);
    setSelectedPost(created);
    setNewPost({
      title: '',
      category: '제작 비하인드',
      summary: '',
      content: '',
      featuredImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
      author: 'Mdia Lab 스튜디오',
      authorRole: '에디터',
      tags: '시네마, 영상기획, 노하우'
    });
  };

  const handleCopyPostLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <section id="blog-news" className="py-20 bg-[#F5F5F5] border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-400 tracking-[0.3em] uppercase block">
              MEDIA JOURNAL & NEWS
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
              Mdia Lab 저널 & 아티클
            </h2>
            <p className="text-base text-gray-500 max-w-none md:whitespace-nowrap break-keep">
              시네마토그래피 제작 비하인드 스토리, 전문 색보정 팁, 스튜디오 장비 리뷰 및 실전 영상 연출 가이드를 공유합니다.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#1A1A1A] text-white text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>새 아티클 작성</span>
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center mb-10 bg-white p-4 border border-[#E5E5E5] rounded-xl shadow-2xs">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-2 text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#1A1A1A] text-white'
                    : 'bg-[#F5F5F5] text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="제목, 내용, 태그 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F5F5F5] border border-[#E5E5E5] rounded-md focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>
        </div>

        {/* Featured Top Article Hero Card (If no active filter search) */}
        {activeCategory === '전체' && !searchQuery && featuredPost && (
          <div 
            onClick={() => setSelectedPost(featuredPost)}
            className="group mb-12 bg-white rounded-2xl overflow-hidden border border-[#E5E5E5] hover:border-[#1A1A1A] transition-all duration-300 shadow-2xs cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-0"
          >
            <div className="lg:col-span-7 aspect-video lg:aspect-auto relative bg-black overflow-hidden">
              <img
                src={featuredPost.featuredImage}
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="text-xs font-bold px-3 py-1 bg-[#1A1A1A] text-white tracking-widest uppercase">
                  FEATURED ARTICLE
                </span>
                <span className="text-xs font-bold px-2.5 py-1 bg-amber-500 text-black font-mono uppercase">
                  {featuredPost.category}
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-xs text-gray-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    {featuredPost.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    {featuredPost.readTime}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] group-hover:text-gray-600 transition-colors leading-snug">
                  {featuredPost.title}
                </h3>

                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                  {featuredPost.summary}
                </p>
              </div>

              <div className="pt-6 border-t border-[#E5E5E5] flex items-center justify-end">
                <div className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1 uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                  <span>READ ARTICLE</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Articles Archive Listing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="group bg-white rounded-xl overflow-hidden border border-[#E5E5E5] hover:border-[#1A1A1A] transition-all duration-300 flex flex-col justify-between shadow-2xs cursor-pointer"
            >
              <div>
                <div className="relative aspect-video bg-black overflow-hidden">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-[#1A1A1A] text-white tracking-widest uppercase">
                      {post.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 text-[10px] font-mono font-bold px-2 py-0.5 bg-black/80 text-white">
                    {post.readTime}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{post.date}</span>
                  </div>

                  <h3 className="text-base font-bold text-[#1A1A1A] group-hover:text-gray-600 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {post.summary}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 space-y-4">
                <div className="flex flex-wrap gap-1">
                  {post.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono text-gray-600 bg-[#F5F5F5] px-2 py-0.5 rounded-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-end text-xs">
                  <span className="font-bold text-gray-500 group-hover:text-[#1A1A1A] flex items-center gap-1 transition-colors uppercase tracking-wider">
                    <span>자세히 보기</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Individual Article Reader View Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full my-8 shadow-2xl border border-[#E5E5E5] overflow-hidden relative max-h-[90vh] flex flex-col">
            
            {/* Top Modal Header Bar */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2.5 py-1 bg-[#1A1A1A] text-white tracking-widest uppercase">
                  {selectedPost.category}
                </span>
                <span className="text-xs font-mono text-gray-400">
                  {selectedPost.date} • {selectedPost.readTime}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPostLink}
                  className="p-2 text-gray-500 hover:text-[#1A1A1A] hover:bg-[#F5F5F5] rounded-md transition-colors cursor-pointer"
                  title="아티클 링크 복사"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-2 text-gray-500 hover:text-[#1A1A1A] hover:bg-[#F5F5F5] rounded-md transition-colors cursor-pointer"
                  aria-label="Close article"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 sm:p-10 overflow-y-auto space-y-8">
              {/* Title */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] leading-tight pb-4 border-b border-[#E5E5E5]">
                  {selectedPost.title}
                </h1>
              </div>

              {/* Featured Image */}
              <div className="aspect-video bg-black rounded-xl overflow-hidden border border-[#E5E5E5]">
                <img
                  src={selectedPost.featuredImage}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Key Takeaways Box if any */}
              {selectedPost.keyTakeaways && selectedPost.keyTakeaways.length > 0 && (
                <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl p-5 space-y-2">
                  <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Key Article Takeaways</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-700">
                    {selectedPost.keyTakeaways.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Article Content Text Body */}
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line font-sans space-y-4">
                {selectedPost.content}
              </div>

              {/* Tags Footer */}
              <div className="pt-6 border-t border-[#E5E5E5] flex flex-wrap items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-gray-400" />
                {selectedPost.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-mono text-gray-600 bg-[#F5F5F5] px-3 py-1 rounded-sm border border-[#E5E5E5]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Bottom Footer */}
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-[#E5E5E5] flex justify-between items-center shrink-0">
              <span className="text-xs text-gray-500 font-mono">
                © Mdia Lab Journal Publishing
              </span>
              <button
                onClick={() => setSelectedPost(null)}
                className="px-5 py-2 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-gray-800 cursor-pointer"
              >
                닫기
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Create New Blog Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#E5E5E5] max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-1">
              새 아티클 / 저널 작성
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              영상 기획, 촬영 노하우, 스튜디오 뉴스 등의 아티클을 게시합니다.
            </p>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                  아티클 제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 2026 시네마틱 4K 촬영 기법 가이드"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#F5F5F5] border border-[#E5E5E5] rounded-md focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                  카테고리
                </label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs bg-[#F5F5F5] border border-[#E5E5E5] rounded-md focus:outline-none focus:border-[#1A1A1A]"
                >
                  <option value="제작 비하인드">제작 비하인드</option>
                  <option value="영상 팁 & 노하우">영상 팁 & 노하우</option>
                  <option value="장비 & 기술 Review">장비 & 기술 Review</option>
                  <option value="스튜디오 소식">스튜디오 소식</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                  대표 이미지 URL
                </label>
                <input
                  type="url"
                  value={newPost.featuredImage}
                  onChange={(e) => setNewPost({ ...newPost, featuredImage: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#F5F5F5] border border-[#E5E5E5] rounded-md focus:outline-none focus:border-[#1A1A1A] font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                  요약문 (Summary)
                </label>
                <input
                  type="text"
                  placeholder="아티클 목록 카드에 표출될 간단한 요약 설명"
                  value={newPost.summary}
                  onChange={(e) => setNewPost({ ...newPost, summary: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#F5F5F5] border border-[#E5E5E5] rounded-md focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                  본문 내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="상세 아티클 내용을 작성하세요."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#F5F5F5] border border-[#E5E5E5] rounded-md focus:outline-none focus:border-[#1A1A1A] leading-relaxed font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                  태그 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  placeholder="예: 촬영팁, 컬러그레이딩, 색보정"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#F5F5F5] border border-[#E5E5E5] rounded-md focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-[#F5F5F5] text-gray-700 text-xs font-bold rounded-md hover:bg-gray-200 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-gray-800 cursor-pointer"
                >
                  아티클 게시하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
};
