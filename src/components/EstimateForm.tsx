import React, { useState, useRef } from 'react';
import { InquiryFormState } from '../types';
import { Upload, X, Send, AlertCircle, Youtube, Mail, FileText, CheckCircle2, Database, ShieldCheck } from 'lucide-react';
import { submitEstimateToFirestore } from '../lib/firestoreService';
import { PrivacyTermsModal } from './PrivacyTermsModal';

interface EstimateFormProps {
  initialYoutubeRef?: string;
  initialCategory?: string;
}

export const EstimateForm: React.FC<EstimateFormProps> = ({
  initialYoutubeRef = '',
  initialCategory = '견적문의'
}) => {
  const [formData, setFormData] = useState<InquiryFormState>({
    name: '',
    email: '',
    phone: '',
    category: initialCategory,
    budget: '500만원 ~ 1,000만원',
    timeline: '1개월 이내',
    youtubeRef: initialYoutubeRef,
    message: '',
    files: []
  });

  const [privacyAgreed, setPrivacyAgreed] = useState<boolean>(true);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedInquiryId, setSubmittedInquiryId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    const newFilesList: Array<{ name: string; size: number; type: string; data?: string }> = [];

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newFilesList.push({
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          data: e.target?.result as string
        });

        if (newFilesList.length === files.length) {
          setFormData((prev) => ({
            ...prev,
            files: [...prev.files, ...newFilesList]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privacyAgreed) {
      setErrorMessage('개인정보 수집 및 이용에 동의해야 견적 문의가 가능합니다.');
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      // 1. Submit to Firestore DB
      const firestoreId = await submitEstimateToFirestore({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        category: formData.category,
        budget: formData.budget,
        timeline: formData.timeline,
        youtubeRef: formData.youtubeRef,
        message: formData.message,
        filesCount: formData.files.length
      });

      // 2. Also notify backend API server
      try {
        await fetch('/api/inquire', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } catch (e) {
        console.warn('API route call error:', e);
      }

      setSubmittedInquiryId(firestoreId || `INQ-${Date.now()}`);
    } catch (err: any) {
      console.error('Inquiry submission error:', err);
      setErrorMessage(err.message || '견적 제출 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="estimate" className="py-20 bg-white border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold text-gray-400 tracking-[0.3em] uppercase block">
            GET A FREE ESTIMATE
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
            무료 견적 문의하기 & 기획서 첨부
          </h2>
          <p className="text-base text-gray-500 leading-relaxed break-keep">
            원하시는 영상 제작 유형, 예산 및 기획안/콘티 파일을 업로드하시면<br />
            24시간 이내 맞춤형 견적서와 포트폴리오를 메일로 답변드립니다.
          </p>
        </div>

        {/* Form Main Container */}
        <div className="max-w-4xl mx-auto bg-[#F5F5F5] rounded-xl p-8 sm:p-10 border border-[#E5E5E5]">
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Row 1: Name & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                  이름 / 기업명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 홍길동 (또는 주식회사 OO)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white text-xs text-[#1A1A1A] border border-[#E5E5E5] rounded-md focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                  이메일 주소 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="contact@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white text-xs text-[#1A1A1A] border border-[#E5E5E5] rounded-md focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                  전화번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="010-0000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white text-xs text-[#1A1A1A] border border-[#E5E5E5] rounded-md focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>
            </div>

            {/* Row 2: Category & Budget & Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">문의 구분 <span className="text-red-500">*</span></label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white text-xs text-[#1A1A1A] border border-[#E5E5E5] rounded-md focus:outline-none focus:border-[#1A1A1A] font-bold"
                >
                  <option value="견적문의">견적문의 (기업/광고/영화 제작)</option>
                  <option value="수강문의">수강문의 (아카데미/워크숍 수강)</option>
                  <option value="출강문의">출강문의 (기업/기관/학교 맞춤 출강)</option>
                  <option value="기타 문의">기타 문의 (숏폼/유튜브/기타)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">예산 범위</label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white text-xs text-[#1A1A1A] border border-[#E5E5E5] rounded-md focus:outline-none focus:border-[#1A1A1A]"
                >
                  <option value="300만 원 이하">300만 원 이하</option>
                  <option value="300만원 ~ 500만원">300만 원 ~ 500만 원</option>
                  <option value="500만원 ~ 1,000만원">500만 원 ~ 1,000만 원</option>
                  <option value="1,000만원 ~ 3,000만원">1,000만 원 ~ 3,000만 원</option>
                  <option value="3,000만원 이상">3,000만 원 이상</option>
                  <option value="협의 가능">상담 후 협의</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">희망 납품 기한</label>
                <select
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white text-xs text-[#1A1A1A] border border-[#E5E5E5] rounded-md focus:outline-none focus:border-[#1A1A1A]"
                >
                  <option value="2주 이내 (긴급)">2주 이내 (긴급 프로젝트)</option>
                  <option value="1개월 이내">1개월 이내</option>
                  <option value="2개월 이내">2개월 이내</option>
                  <option value="일정 협의">일정 협의 가능</option>
                </select>
              </div>
            </div>

            {/* Reference Youtube Link */}
            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                참고 희망 레퍼런스 (유튜브 URL)
              </label>
              <div className="relative">
                <Youtube className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... (원하시는 영상 스타일)"
                  value={formData.youtubeRef}
                  onChange={(e) => setFormData({ ...formData, youtubeRef: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white text-xs text-[#1A1A1A] border border-[#E5E5E5] rounded-md focus:outline-none focus:border-[#1A1A1A] font-mono"
                />
              </div>
            </div>

            {/* Detailed Requirements Message */}
            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                세부 문의 및 전달사항 <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="제작하시고자 하는 영상의 목적, 타겟, 톤앤매너, 주요 씬 또는 강의 수강 인원 등을 자유롭게 적어주세요."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white text-xs text-[#1A1A1A] border border-[#E5E5E5] rounded-md focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>

            {/* Drag & Drop File Upload Section */}
            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                기획서, 콘티, 시놉시스 파일 첨부 (드래그 & 드롭)
              </label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                  dragActive
                    ? 'border-[#1A1A1A] bg-gray-100'
                    : 'border-[#E5E5E5] bg-white hover:border-[#1A1A1A]'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-[#1A1A1A]">
                  파일을 이곳에 끌어다 놓거나 클릭하여 선택하세요
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  PDF, DOCX, HWP, PPTX, ZIP, PNG, JPG (파일당 최대 50MB)
                </p>
              </div>

              {/* Attached File List */}
              {formData.files.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-bold text-[#1A1A1A]">첨부된 파일 ({formData.files.length}개):</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {formData.files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 bg-white rounded-md border border-[#E5E5E5] text-xs"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="truncate font-medium text-[#1A1A1A]">{file.name}</span>
                          <span className="text-[10px] text-gray-400 shrink-0 font-mono">
                            ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(idx);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Privacy Agreement Checkbox */}
            <div className="pt-2 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-neutral-800">
                <input
                  type="checkbox"
                  checked={privacyAgreed}
                  onChange={(e) => setPrivacyAgreed(e.target.checked)}
                  className="w-4 h-4 accent-[#0300b0] rounded cursor-pointer"
                />
                <span>
                  <strong>개인정보 수집 및 이용</strong>에 동의합니다. <span className="text-red-500 font-bold">(필수)</span>
                </span>
              </label>

              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="text-[11px] text-gray-500 hover:text-[#0300b0] underline underline-offset-2 flex items-center gap-1 cursor-pointer font-mono"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#0300b0]" />
                <span>[개인정보처리방침 전문보기]</span>
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ backgroundColor: '#0300b0' }}
                className="w-full py-4 text-white text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Mdia Lab 메일함으로 제출 중...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>무료 견적 문의 제출하기</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>

      {/* Submission Success Modal */}
      {submittedInquiryId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-extrabold text-neutral-900 mb-2">
              견적 문의가 정상 접수되었습니다!
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed mb-4">
              Mdia Lab 담당자 메일함으로 기획서 및 요청사항이 안전하게 전달되었습니다. 24시간 이내 입력해주신 연락처 및 이메일로 답변드리겠습니다.
            </p>

            <div className="bg-neutral-100 p-3.5 rounded-xl text-xs font-mono font-bold text-neutral-800 mb-4 flex items-center justify-between">
              <span>접수 ID: {submittedInquiryId}</span>
              <span className="text-[10px] bg-blue-100 text-[#0300b0] px-2 py-0.5 rounded font-sans">Firestore DB 저장 완료</span>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed mb-6 bg-blue-50/70 p-3 rounded-lg border border-blue-100 text-left">
              💡 <strong>DB 접수 완료:</strong> 본 문의건은 Firestore DB에 실시간 보관되며 관리자 로그인 후 조회 가능합니다.<br/>
              ✉️ <strong>minabinv2@gmail.com 메일 직접 전송:</strong> 아래 버튼을 클릭하면 메일 앱에서 지정 메일 주소로 사본을 직접 전송할 수 있습니다.
            </p>

            <div className="space-y-2">
              <a
                href={`mailto:minabinv2@gmail.com?subject=[MdiaLab 견적문의] ${formData.name}님 문의건 (${submittedInquiryId})&body=성함/기업명: ${formData.name}%0D%0A연락처: ${formData.phone}%0D%0A이메일: ${formData.email}%0D%0A카테고리: ${formData.category}%0D%0A예산: ${formData.budget}%0D%0A일정: ${formData.timeline}%0D%0A참고링크: ${formData.youtubeRef}%0D%0A%0D%0A문의내용:%0D%0A${formData.message}`}
                className="w-full py-3.5 bg-[#0300b0] text-white text-xs font-bold rounded-xl hover:opacity-90 flex items-center justify-center gap-2 transition-opacity shadow-sm"
              >
                <Mail className="w-4 h-4 inline-block" />
                <span>minabinv2@gmail.com 메일로 사본 전송하기</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setSubmittedInquiryId(null);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    category: '홍보영상 제작',
                    budget: '500만원 ~ 1,000만원',
                    timeline: '1개월 이내',
                    youtubeRef: '',
                    message: '',
                    files: []
                  });
                }}
                className="w-full py-3 bg-neutral-900 text-white text-xs font-bold rounded-lg hover:bg-neutral-800"
              >
                확인 및 닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      <PrivacyTermsModal
        isOpen={showPrivacyModal}
        type="privacy"
        onClose={() => setShowPrivacyModal(false)}
      />

    </section>
  );
};
