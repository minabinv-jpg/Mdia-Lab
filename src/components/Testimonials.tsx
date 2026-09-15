import React, { useState, useEffect } from 'react';
import { TestimonialItem } from '../types';
import { 
  Quote, Star, ChevronLeft, ChevronRight, MessageSquarePlus, Building2,
  CheckCircle2, Lock, Eye, EyeOff, Edit, Trash2, ShieldCheck,
  Clock, Sparkles
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  subscribeTestimonials,
  submitTestimonialToFirestore,
  updateTestimonialInFirestore,
  deleteTestimonialFromFirestore
} from '../lib/firestoreService';

interface TestimonialsProps {
  currentUser?: FirebaseUser | null;
  onOpenAdminAuth?: () => void;
}

export const Testimonials: React.FC<TestimonialsProps> = ({ currentUser }) => {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialItem | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [adminTabFilter, setAdminTabFilter] = useState<'all' | 'pending' | 'public'>('all');

  // New Testimonial Form State
  const [formData, setFormData] = useState({
    clientName: '',
    clientRole: '',
    company: '',
    projectName: '',
    projectCategory: '광고/홍보영상',
    rating: 5,
    quote: '',
    isPublic: false
  });

  // Subscribe to real-time testimonials (Firestore + LocalStorage fallback)
  useEffect(() => {
    const unsubscribe = subscribeTestimonials((items) => {
      setTestimonials(items);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Filter ONLY public testimonials for the slide showcase
  const publicTestimonials = testimonials.filter((item) => item.isPublic === true);

  // Safety check for currentIndex
  useEffect(() => {
    if (currentIndex >= publicTestimonials.length && publicTestimonials.length > 0) {
      setCurrentIndex(0);
    }
  }, [publicTestimonials.length, currentIndex]);

  const handlePrevSlide = () => {
    if (publicTestimonials.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? publicTestimonials.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    if (publicTestimonials.length === 0) return;
    setCurrentIndex((prev) => (prev === publicTestimonials.length - 1 ? 0 : prev + 1));
  };

  // Open creation modal
  const handleOpenCreateModal = () => {
    setEditingTestimonial(null);
    setFormData({
      clientName: '',
      clientRole: '',
      company: '',
      projectName: '',
      projectCategory: '광고/홍보영상',
      rating: 5,
      quote: '',
      isPublic: !!currentUser // Admin can set public immediately, normal users default to false
    });
    setShowAddModal(true);
  };

  // Open edit modal (Admin only)
  const handleOpenEditModal = (item: TestimonialItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTestimonial(item);
    setFormData({
      clientName: item.clientName,
      clientRole: item.clientRole,
      company: item.company,
      projectName: item.projectName,
      projectCategory: item.projectCategory,
      rating: item.rating,
      quote: item.quote,
      isPublic: item.isPublic ?? false
    });
    setShowAddModal(true);
  };

  // Toggle public / private status (Admin only)
  const handleTogglePublic = async (item: TestimonialItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser) return;

    const newStatus = !item.isPublic;
    await updateTestimonialInFirestore(item.id, { isPublic: newStatus });
  };

  // Delete testimonial (Admin only)
  const handleDeleteTestimonial = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser) return;

    if (window.confirm("선택하신 후기를 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.")) {
      await deleteTestimonialFromFirestore(id);
    }
  };

  // Submit testimonial
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.quote) return;

    if (editingTestimonial) {
      // Update
      await updateTestimonialInFirestore(editingTestimonial.id, {
        quote: formData.quote,
        clientName: formData.clientName,
        clientRole: formData.clientRole || '고객사 담당자',
        company: formData.company || 'Mdia Lab 클라이언트',
        rating: Number(formData.rating),
        projectName: formData.projectName || '의뢰 영상 프로젝트',
        projectCategory: formData.projectCategory,
        isPublic: formData.isPublic
      });
      setSuccessMessage('후기 정보가 성공적으로 수정되었습니다.');
    } else {
      // Create: Normal user is always private (false), admin can choose
      const willBePublic = currentUser ? formData.isPublic : false;
      await submitTestimonialToFirestore({
        quote: formData.quote,
        clientName: formData.clientName,
        clientRole: formData.clientRole || '고객사 담당자',
        company: formData.company || 'Mdia Lab 클라이언트',
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80`,
        rating: Number(formData.rating),
        projectName: formData.projectName || '의뢰 영상 프로젝트',
        projectCategory: formData.projectCategory,
        date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
        isPublic: willBePublic,
        createdAt: new Date().toISOString()
      });

      if (willBePublic) {
        setSuccessMessage('후기가 등록되어 사이트에 공개되었습니다.');
      } else {
        setSuccessMessage('소중한 후기가 안전하게 접수되었습니다! 스튜디오 관리자 검토 및 승인 후 사이트에 공개됩니다.');
      }
    }

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowAddModal(false);
      setEditingTestimonial(null);
    }, 1800);
  };

  // Filtered reviews for Admin management table/cards
  const adminFilteredTestimonials = testimonials.filter(item => {
    if (adminTabFilter === 'pending') return !item.isPublic;
    if (adminTabFilter === 'public') return item.isPublic;
    return true;
  });

  const pendingCount = testimonials.filter(t => !t.isPublic).length;

  return (
    <section id="testimonials" className="py-20 bg-white border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 tracking-[0.3em] uppercase block">
                CLIENT TESTIMONIALS & REVIEWS
              </span>
              {currentUser && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#0300b0]/10 text-[#0300b0] border border-[#0300b0]/20 font-mono">
                  <ShieldCheck className="w-3 h-3" />
                  ADMIN MODE
                </span>
              )}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
              클라이언트 후기 & 평가
            </h2>
            <p className="text-base text-gray-500 whitespace-nowrap">
              Mdia Lab과 함께 비전을 완성한 브랜드, 연출가, 기업 클라이언트들의 진솔한 평점과 소감을 보내주세요!
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 text-xs font-bold tracking-widest uppercase bg-[#1A1A1A] hover:bg-black text-white rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0 active:scale-95"
          >
            <MessageSquarePlus className="w-4 h-4 text-amber-400" />
            <span>후기 작성</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* 1. PUBLIC TESTIMONIALS SLIDER SHOWCASE (관리자가 공개한 후기만 노출) */}
        {/* ======================================================== */}
        {publicTestimonials.length > 0 ? (
          <div className="relative bg-[#F9F9F9] border border-[#E5E5E5] rounded-3xl p-8 sm:p-14 mb-16 shadow-xs overflow-hidden">
            {/* Top Accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#1A1A1A]" />

            {(() => {
              const current = publicTestimonials[currentIndex] || publicTestimonials[0];
              return (
                <div className="max-w-4xl mx-auto space-y-8">
                  {/* Rating Stars, Badge & Admin Quick Actions */}
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < current.rating
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-mono font-bold text-[#1A1A1A] ml-2">
                        {current.rating}.0 / 5.0
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-3 py-1 bg-[#1A1A1A] text-white tracking-widest uppercase rounded-md">
                        {current.projectCategory}
                      </span>

                      {/* Admin Quick Control inside Slide */}
                      {currentUser && (
                        <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-1 shadow-2xs">
                          <button
                            type="button"
                            onClick={(e) => handleTogglePublic(current, e)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded cursor-pointer transition-colors"
                            title="비공개로 전환 (슬라이드에서 숨김)"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>비공개 전환</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditModal(current, e)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100"
                            title="후기 수정"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteTestimonial(current.id, e)}
                            className="p-1.5 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100"
                            title="후기 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Main Quote Text */}
                  <div className="relative pt-2">
                    <Quote className="w-12 h-12 text-gray-300 absolute -top-5 -left-4 -z-0 opacity-40" />
                    <p className={`text-lg sm:text-2xl font-medium text-[#1A1A1A] leading-relaxed relative z-10 break-keep ${
                      current.id === 't1' ? 'font-semibold not-italic text-neutral-900' : 'italic'
                    }`}>
                      "{current.quote}"
                    </p>

                    {/* Direct CTA button for the first Notice slide */}
                    {current.id === 't1' && (
                      <div className="pt-4 relative z-10">
                        <button
                          type="button"
                          onClick={handleOpenCreateModal}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                          <MessageSquarePlus className="w-4 h-4 text-amber-400" />
                          <span>지금 진솔한 평점 & 소감 보내기</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Client Info Bar */}
                  <div className="pt-6 border-t border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={current.id === 't1' ? '/lee-mina-logo.svg' : current.avatar}
                        alt={current.clientName}
                        className="w-13 h-13 rounded-full object-cover border-2 border-white shadow-xs shrink-0 bg-neutral-950"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-[#1A1A1A]">
                          {current.clientName} <span className="text-xs font-normal text-gray-500">({current.clientRole})</span>
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-medium">{current.company}</span>
                          <span className="text-gray-300">•</span>
                          <span className="font-mono text-gray-500">{current.projectName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{current.date}</span>
                    </div>
                  </div>

                  {/* Slider Controls: Dots & Navigation */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    {/* Indicators */}
                    <div className="flex items-center gap-2">
                      {publicTestimonials.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentIndex(idx)}
                          className={`h-2 transition-all cursor-pointer rounded-full ${
                            currentIndex === idx ? 'w-8 bg-[#1A1A1A]' : 'w-2 bg-gray-300 hover:bg-gray-400'
                          }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                      <span className="text-xs font-mono text-gray-400 ml-2">
                        {currentIndex + 1} / {publicTestimonials.length}
                      </span>
                    </div>

                    {/* Prev / Next Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePrevSlide}
                        className="p-3 bg-white hover:bg-gray-100 text-[#1A1A1A] border border-[#E5E5E5] rounded-full transition-colors cursor-pointer shadow-xs active:scale-95"
                        aria-label="이전 후기"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextSlide}
                        className="p-3 bg-white hover:bg-gray-100 text-[#1A1A1A] border border-[#E5E5E5] rounded-full transition-colors cursor-pointer shadow-xs active:scale-95"
                        aria-label="다음 후기"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })()}
          </div>
        ) : (
          /* No Public Reviews: Friendly Invitation Box */
          <div className="relative bg-[#F9F9F9] border border-[#E5E5E5] rounded-3xl p-10 sm:p-16 mb-16 text-center shadow-xs">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-[#E5E5E5] shadow-xs text-amber-500 mx-auto">
                <Sparkles className="w-7 h-7 text-amber-500" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] leading-relaxed tracking-tight">
                Mdia Lab과 함께 비전을 완성한 브랜드, 연출가, 기업 클라이언트들의 진솔한 평점과 소감을 보내주세요!
              </h3>

              <p className="text-sm text-gray-500 leading-relaxed max-w-lg mx-auto">
                현재 등록된 공개 후기를 준비 중입니다. 프로젝트 제작 경험이나 촬영, 연출 협업, 마스터클래스 수강에 대한 첫 번째 리뷰를 남겨주세요!
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#1A1A1A] hover:bg-black text-white text-sm font-bold tracking-wider uppercase rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                >
                  <MessageSquarePlus className="w-5 h-5 text-amber-400" />
                  <span>첫 번째 후기 남기기</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. ADMIN MANAGEMENT PANEL (관리자 로그인 시 노출: 공개/비공개 토글 및 삭제) */}
        {/* ======================================================== */}
        {currentUser && (
          <div className="mt-12 bg-neutral-900 text-white rounded-3xl p-6 sm:p-10 border border-neutral-800 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-800 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    후기 승인 및 공개/비공개 관리 (관리자 전용)
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  일반 사용자가 등록한 후기는 기본 비공개 상태로 접수됩니다. 검토 후 [공개 승인]을 누르면 메인 슬라이드에 즉시 노출됩니다.
                </p>
              </div>

              {/* Statistics Chips */}
              <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                <span className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700">
                  전체: <strong className="text-white">{testimonials.length}</strong>건
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                  공개 중: <strong className="text-emerald-300">{publicTestimonials.length}</strong>건
                </span>
                <span className={`px-3 py-1.5 rounded-lg border ${
                  pendingCount > 0 
                    ? 'bg-amber-950/80 text-amber-300 border-amber-700 font-bold animate-pulse' 
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}>
                  승인 대기(비공개): <strong>{pendingCount}</strong>건
                </span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between pt-6 pb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAdminTabFilter('all')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    adminTabFilter === 'all' 
                      ? 'bg-white text-black' 
                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                  }`}
                >
                  전체 목록 ({testimonials.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTabFilter('pending')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    adminTabFilter === 'pending' 
                      ? 'bg-amber-400 text-black' 
                      : 'bg-neutral-800 text-amber-400 hover:bg-neutral-700'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>비공개 / 승인 대기 ({pendingCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTabFilter('public')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    adminTabFilter === 'public' 
                      ? 'bg-emerald-500 text-black' 
                      : 'bg-neutral-800 text-emerald-400 hover:bg-neutral-700'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>공개 중 ({publicTestimonials.length})</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold border border-neutral-700 cursor-pointer"
              >
                <MessageSquarePlus className="w-3.5 h-3.5 text-amber-400" />
                <span>새 후기 직접 등록</span>
              </button>
            </div>

            {/* Testimonials Management List */}
            {adminFilteredTestimonials.length === 0 ? (
              <div className="py-12 text-center text-neutral-500 text-xs">
                해당 필터에 등록된 후기 내역이 없습니다.
              </div>
            ) : (
              <div className="space-y-3 mt-2">
                {adminFilteredTestimonials.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-neutral-700 transition-colors"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Status Badge */}
                        {item.isPublic ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Eye className="w-3 h-3" />
                            공개 중 (슬라이드 노출)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <Lock className="w-3 h-3" />
                            비공개 (승인 대기)
                          </span>
                        )}

                        <span className="text-[11px] font-bold px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded font-mono">
                          {item.projectCategory}
                        </span>

                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < item.rating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-neutral-700'
                              }`}
                            />
                          ))}
                          <span className="text-[11px] font-mono text-neutral-400 ml-1">
                            {item.rating}.0
                          </span>
                        </div>

                        <span className="text-[11px] text-neutral-500 font-mono">
                          {item.date}
                        </span>
                      </div>

                      <p className="text-sm text-neutral-200 leading-relaxed italic line-clamp-2">
                        "{item.quote}"
                      </p>

                      <div className="flex items-center gap-3 text-xs text-neutral-400">
                        <span className="font-bold text-white">{item.clientName}</span>
                        <span>•</span>
                        <span>{item.clientRole}</span>
                        <span>•</span>
                        <span className="text-neutral-300">{item.company}</span>
                        <span>•</span>
                        <span className="text-neutral-500">{item.projectName}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-800">
                      {item.isPublic ? (
                        <button
                          type="button"
                          onClick={() => handleTogglePublic(item)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer border border-neutral-700"
                        >
                          <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                          <span>비공개 전환</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleTogglePublic(item)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          <span>공개 승인</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="p-2 text-neutral-400 hover:text-white rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
                        title="수정"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTestimonial(item.id)}
                        className="p-2 text-neutral-400 hover:text-red-400 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* 3. WRITE / EDIT TESTIMONIAL MODAL (일반 사용자 & 관리자 공용) */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E5E5E5] text-left animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <h3 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>{editingTestimonial ? '후기 수정' : '소감 및 후기 작성'}</span>
              </h3>
            </div>
            
            <p className="text-xs text-gray-500 mb-6">
              Mdia Lab과 함께 비전을 완성한 브랜드, 연출가, 기업 클라이언트들의 진솔한 평점과 소감을 남겨주세요.
            </p>

            {/* Notice for normal users about private submission */}
            {!currentUser && !editingTestimonial && (
              <div className="mb-5 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-start gap-2.5 text-xs text-neutral-600">
                <Lock className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  작성하신 후기는 스튜디오 검토 후 사이트에 <strong>공개 승인</strong>됩니다. 진솔한 의견을 부탁드립니다.
                </p>
              </div>
            )}

            {submitSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-[#1A1A1A]">
                  {successMessage || '후기가 성공적으로 처리되었습니다.'}
                </h4>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                      성함 / 닉네임 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="예: 김민우"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#F5F5F5] border border-[#E5E5E5] rounded-md focus:outline-none focus:border-[#1A1A1A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                      직함 / 역할
                    </label>
                    <input
                      type="text"
                      placeholder="예: 마케팅 팀장 / 연출가"
                      value={formData.clientRole}
                      onChange={(e) => setFormData({ ...formData, clientRole: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#F5F5F5] border border-[#E5E5E5] rounded-md focus:outline-none focus:border-[#1A1A1A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                      회사 / 소속
                    </label>
                    <input
                      type="text"
                      placeholder="예: 에이전시 / 독립 크루 / 개인"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#F5F5F5] border border-[#E5E5E5] rounded-md focus:outline-none focus:border-[#1A1A1A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                      프로젝트 구분
                    </label>
                    <select
                      value={formData.projectCategory}
                      onChange={(e) => setFormData({ ...formData, projectCategory: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#F5F5F5] border border-[#E5E5E5] rounded-md focus:outline-none focus:border-[#1A1A1A]"
                    >
                      <option value="광고/홍보영상">광고/홍보영상</option>
                      <option value="영화/상업작품">영화/상업작품</option>
                      <option value="다큐멘터리">다큐멘터리</option>
                      <option value="제작 강의">제작 강의</option>
                      <option value="기타">기타 영상 작업</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                    프로젝트명 / 강의명
                  </label>
                  <input
                    type="text"
                    placeholder="예: 브랜드 시네마틱 필름 제작 / 마스터클래스 1기"
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#F5F5F5] border border-[#E5E5E5] rounded-md focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                    만족도 평점
                  </label>
                  <div className="flex items-center gap-2 bg-[#F5F5F5] p-2 rounded-md border border-[#E5E5E5]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="p-1 cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= formData.rating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-mono font-bold text-[#1A1A1A] ml-2">
                      {formData.rating}.0 / 5.0
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                    후기 내용 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Mdia Lab과의 작업 소감 및 추천 이유를 자유롭게 남겨주세요."
                    value={formData.quote}
                    onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#F5F5F5] border border-[#E5E5E5] rounded-md focus:outline-none focus:border-[#1A1A1A] leading-relaxed"
                  />
                </div>

                {/* Admin Option: Direct Publish Toggle */}
                {currentUser && (
                  <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-800">
                      <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                        className="w-4 h-4 accent-[#0300b0] rounded"
                      />
                      <span>사이트에 즉시 공개 상태로 저장</span>
                    </label>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E5E5]">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-[#F5F5F5] text-gray-700 text-xs font-bold rounded-md hover:bg-gray-200 cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-md cursor-pointer transition-colors shadow-xs"
                  >
                    {editingTestimonial 
                      ? '수정 완료' 
                      : (currentUser && formData.isPublic ? '후기 등록 및 공개' : '후기 등록 (승인 대기)')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </section>
  );
};

