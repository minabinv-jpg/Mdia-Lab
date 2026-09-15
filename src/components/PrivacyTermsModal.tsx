import React from 'react';
import { X, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface PrivacyTermsModalProps {
  isOpen: boolean;
  type: 'privacy' | 'terms';
  onClose: () => void;
}

export const PrivacyTermsModal: React.FC<PrivacyTermsModalProps> = ({ isOpen, type, onClose }) => {
  if (!isOpen) return null;

  const isPrivacy = type === 'privacy';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-neutral-200">
        
        {/* Modal Header */}
        <div className="bg-[#1A1A1A] text-white p-5 flex items-center justify-between shrink-0 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 text-[#0300b0] rounded-lg border border-blue-500/30">
              {isPrivacy ? <ShieldCheck className="w-5 h-5 text-amber-400" /> : <FileText className="w-5 h-5 text-blue-400" />}
            </div>
            <div>
              <h3 className="text-base font-bold">
                {isPrivacy ? 'Mdia Lab 개인정보처리방침' : 'Mdia Lab 웹사이트 이용약관'}
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                최종 개정일: 2026년 8월 12일
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 text-xs text-neutral-700 leading-relaxed font-sans">
          {isPrivacy ? (
            <>
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs font-medium leading-relaxed">
                <p className="flex items-center gap-1.5 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4 text-[#0300b0]" />
                  <span>개인정보 수집 및 이용 목적 요약</span>
                </p>
                Mdia Lab은 개인정보보호법 제15조 및 제22조에 따라 고객님의 견적 문의 상담 및 서비스 제공을 위해 최소한의 개인정보만을 수집 및 이용합니다.
              </div>

              <section className="space-y-2">
                <h4 className="font-bold text-neutral-900 text-sm border-b border-neutral-200 pb-1">
                  1. 수집하는 개인정보 항목
                </h4>
                <p>Mdia Lab은 무료 견적 문의, 1:1 무인 상담, 수강 신청 시 아래와 같은 개인정보를 수집하고 있습니다.</p>
                <ul className="list-disc pl-5 space-y-1 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                  <li><strong>필수 수집항목:</strong> 성함/기업명, 이메일 주소, 연락처(전화번호)</li>
                  <li><strong>선택 수집항목:</strong> 희망 예산, 프로젝트 일정, 기획안 파일, 참고 유튜브 레퍼런스 URL</li>
                  <li><strong>자동 수집항목:</strong> IP 주소, 대화 내역(1:1 AI 상담 이용 시)</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-neutral-900 text-sm border-b border-neutral-200 pb-1">
                  2. 개인정보의 수집 및 이용 목적
                </h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>영상 제작 무료 견적 산출 및 맞춤형 포트폴리오 상담 답변 제공</li>
                  <li>실전 영화/영상 제작 마스터 클래스 수강 상담 및 안내</li>
                  <li>문의 접수 내역 관리, 1:1 무인 챗봇 SMS 수신 확인 문자 발송</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-neutral-900 text-sm border-b border-neutral-200 pb-1">
                  3. 개인정보의 보유 및 이용 기간
                </h4>
                <p>
                  수집된 개인정보는 <strong>원칙적으로 상담 완료 후 3년간 보관</strong>하며, 관련 법령(전자상거래 등에서의 소비자보호에 관한 법률 등)의 규정에 의하여 보존할 필요가 있는 경우 해당 기간 동안 보관 후 지체 없이 파기합니다.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-neutral-900 text-sm border-b border-neutral-200 pb-1">
                  4. 동의 거부 권리 및 불이익 안내
                </h4>
                <p>
                  귀하는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. 단, 필수 수집 항목에 대한 동의를 거부하실 경우 <strong>무료 견적 산출 및 1:1 온라인 상담 서비스 이용이 제한</strong>될 수 있습니다.
                </p>
              </section>

              <section className="space-y-1 text-neutral-500 font-mono text-[11px] bg-neutral-100 p-3 rounded-lg">
                <p>개인정보 보호책임자: 대표 이민아 (minabinv2@gmail.com / 0502-5554-3919)</p>
              </section>
            </>
          ) : (
            <>
              <section className="space-y-2">
                <h4 className="font-bold text-neutral-900 text-sm border-b border-neutral-200 pb-1">
                  제 1 조 (목적)
                </h4>
                <p>
                  본 약관은 Mdia Lab(이하 "회사")이 제공하는 원페이지 웹사이트 서비스, 온라인 견적 시스템, 1:1 무인 상담 서비스, 및 영화 제작 강의 신청 서비스(이하 "서비스")의 이용조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-neutral-900 text-sm border-b border-neutral-200 pb-1">
                  제 2 조 (견적 산출 및 계약)
                </h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>본 웹사이트에서 제공되는 온라인 견적은 제공된 정보를 바탕으로 산출된 예상 견적이며, 정식 계약 체결 시 세부 콘티 및 촬영 일정에 따라 변동될 수 있습니다.</li>
                  <li>모든 제작물 계약은 서면 계약서 또는 전자인증 동의를 통해 정식 효력을 발휘합니다.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-neutral-900 text-sm border-b border-neutral-200 pb-1">
                  제 3 조 (지식재산권 및 저작권)
                </h4>
                <p>
                  회사가 제공하는 본 웹사이트의 모든 콘텐츠, 포트폴리오 영상, 클래스 커리큘럼 문서의 저작권은 Mdia Lab에 소유권이 있으며, 무단 복제 및 상업적 도용을 금합니다.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-neutral-900 text-sm border-b border-neutral-200 pb-1">
                  제 4 조 (면책 조항)
                </h4>
                <p>
                  회사는 천재지변, 인터넷 통신 장애 등 불가항력적인 사유로 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
                </p>
              </section>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-100 border-t border-neutral-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1A1A1A] hover:bg-neutral-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            확인 및 닫기
          </button>
        </div>

      </div>
    </div>
  );
};
