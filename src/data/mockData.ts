import { PortfolioItem, WorkshopClass, FeatureCard, TestimonialItem, BlogPostItem } from "../types";

export const PORTFOLIO_DATA: PortfolioItem[] = [
  {
    id: "p1",
    title: "Mdia Lab 광고 홍보영상 포트폴리오",
    category: "광고/홍보영상",
    client: "Mdia Lab Official",
    year: "2026",
    youtubeUrl: "https://youtu.be/SeXdFQYOZvg",
    youtubeId: "SeXdFQYOZvg",
    thumbnail: "https://img.youtube.com/vi/SeXdFQYOZvg/maxresdefault.jpg",
    description: "Mdia Lab의 감각적인 시네마틱 연출과 독창적인 영상 미학을 담은 공식 광고·홍보영상 포트폴리오입니다. 브랜드의 핵심 가치와 비전을 시각적으로 완성도 높게 전달합니다.",
    tags: ["Mdia Lab", "광고영상", "홍보영상", "시네마틱", "브랜드필름"],
    isFeatured: true,
    runtime: "01:15"
  },
  {
    id: "p_award_ulsan",
    title: "｢2025 울산 북구 시그니처 홍보 영상 공모전 수상작｣ (은상) 우리의 계절 산책",
    category: "영상 공모전 수상작",
    client: "울산광역시 북구 공모전",
    year: "2025",
    youtubeUrl: "https://youtu.be/bhohH-kYgys?si=RW50GGrn6cSCOVgM",
    youtubeId: "bhohH-kYgys",
    thumbnail: "https://img.youtube.com/vi/bhohH-kYgys/hqdefault.jpg",
    description: "2025 울산 북구 시그니처 홍보 영상 공모전 수상작｣ (은상)우리의 계절 산책 - 울산 북구의 수려한 사계절 자연경관과 숨은 명소를 감각적인 시네마토그래피와 따뜻한 스토리텔링으로 완성도 높게 담아낸 공모전 은상 수상작입니다.",
    tags: ["영상공모전수상작", "은상", "울산북구", "우리의계절산책", "홍보영상"],
    isFeatured: true,
    runtime: "02:45"
  }
];

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: "t1",
    quote: "Mdia Lab과 함께 비전을 완성한 브랜드, 연출가, 기업 클라이언트들의 진솔한 평점과 소감을 보내주세요.",
    clientName: "Mdia Lab 스튜디오",
    clientRole: "공식 공지",
    company: "Mdia Lab 시네마 프로덕션",
    avatar: "/lee-mina-logo.svg",
    rating: 5,
    projectName: "클라이언트 평점 및 소감 접수",
    projectCategory: "공지사항",
    date: "2026.09.15",
    isPublic: true
  },
  {
    id: "t2",
    quote: "Mdia Lab과의 작업은 기존 외주 프로덕션과는 차원이 달랐습니다. 기획 초기 단계부터 저희 브랜드 가치를 정확히 이해하고, 영화 같은 비주얼 라이팅과 컷구성으로 임직원과 고객 모두 감탄한 홍보 필름을 만들어주셨습니다.",
    clientName: "김민석 팀장",
    clientRole: "브랜드 마케팅 총괄",
    company: "미래테크놀로지 코리아",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    rating: 5,
    projectName: "Beyond Boundaries 브랜디드 필름",
    projectCategory: "광고/홍보영상",
    date: "2026.05.14",
    isPublic: true
  },
  {
    id: "t3",
    quote: "단편영화 촬영 시 로케이션 조명과 아나모픽 렌즈 선택으로 고민이 많았는데, Mdia Lab 감독님이 기술적 제약 안에서 최상의 시네마틱 무드를 연출해주셨습니다. 덕분에 영화제 입선이라는 쾌거를 이뤘습니다.",
    clientName: "박서연 감독",
    clientRole: "독립영화 연출가",
    company: "시네마 크루 '새벽'",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    rating: 5,
    projectName: "단편영화 '새벽의 프레임'",
    projectCategory: "영화/상업작품",
    date: "2025.11.20",
    isPublic: true
  },
  {
    id: "t4",
    quote: "사내 인하우스 마케팅팀 4명이 출장 워크숍을 수강했습니다. 이전엔 촬영 하나에도 주저함이 컸는데, 4주 만에 자체적으로 쇼츠와 기업 SNS 영상을 고화질로 자유롭게 만듭니다. 수강료 그 이상의 가치였습니다.",
    clientName: "최현우 이사",
    clientRole: "CCO",
    company: "볼트모빌리티",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    rating: 5,
    projectName: "기업 인하우스 수강 출강",
    projectCategory: "제작 강의",
    date: "2026.02.08",
    isPublic: true
  }
];

export const BLOG_POSTS_DATA: BlogPostItem[] = [
  {
    id: "b1",
    title: "2026 시네마틱 영상 기획: 시선을 사로잡는 오프닝 3초와 조명 라이팅 법칙",
    category: "제작 비하인드",
    summary: "스쳐 지나가는 유튜브와 SNS 환경에서 시청자를 몰입시키는 시네마토그래피 3초 기법과 3점 라이팅의 현대적 재해석을 공개합니다.",
    content: `
시청자의 집중 시간이 점차 짧아지는 미디어 트렌드 속에서, 첫 3초의 오프닝 프레임은 전체 영상의 성패를 가릅니다. Mdia Lab이 지난 5년간 100여 편 이상의 상업 영상 및 브랜디드 시네마를 제작하며 정립한 '시네마틱 오프닝 3법칙'을 공유합니다.

### 1. 피사체와 배경의 광량 차이 (Key vs Background Contrast)
대부분의 입문 제작자가 범하는 실수는 인물과 배경의 조명 명암비가 평평한 것입니다. 시네마틱 무드의 핵심은 **주광(Key Light)**과 **배경(Background)** 사이의 미세한 스톱 차이에 있습니다. Key Light를 피사체 측면 45도에서 비추고, 배경에는 은은한 림라이트(Rim Light)를 세팅하면 2D 화면 안에서 압도적인 3차원 입체감이 만들어집니다.

### 2. 렌즈 선택과 피사체 동선 (Anamorphic vs Spherical)
시네마 카메라의 센서 크기와 렌즈 특성을 이해하는 것이 중요합니다. 아나모픽 렌즈는 특유의 수평 플레어(Horizontal Flare)와 타원형 보케(Oval Bokeh)를 제공하여 극장용 필름과 동일한 시각적 웅장함을 즉시 전달합니다.

### 3. 오디오 노이즈 레이어링 (Sound Scape)
영상미만큼 중요한 것은 오디오 디자인입니다. 오프닝 씬에 저음역대 초저주파 Sub-bass 인트로 사운드와 환경음(Foley)을 레이어링하면, 시청자는 이어폰이나 스피커를 통해 압도적인 침투감을 느끼게 됩니다.
`,
    featuredImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
    author: "김성훈 감독",
    authorRole: "Mdia Lab 대표 연출가",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    date: "2026.07.28",
    readTime: "5분 읽기",
    tags: ["시네마토그래피", "조명세팅", "연출노하우", "영상기획"],
    keyTakeaways: [
      "인물과 배경의 광량 차이로 3차원 입체감 형성",
      "아나모픽 렌즈 특성을 활용한 독창적인 보케 연출",
      "초저주파 사운드 레이어링으로 몰입도 극대화"
    ],
    isFeatured: true
  },
  {
    id: "b2",
    title: "실전 시네마 컬러그레이딩 & 색보정 파이프라인 가이드",
    category: "영상 팁 & 노하우",
    summary: "Rec.709 표준 공간부터 ACES 및 시네마 컬러 매니지드(Color Managed) 워크플로우까지, 영화 색감 노드 트리를 다루는 방법.",
    content: `
컬러그레이딩은 단순히 필터나 LUT를 얹는 작업이 아닙니다. 촬영된 센서의 RAW/Log 데이터를 정교하게 해석하고 브랜드 고유의 '컬러 정체성(Color Identity)'을 부여하는 고도의 기술입니다.

### 로그(Log) 이미지 노멀라이제이션
카메라별 Log(Sony S-Log3, RED Log3G10, Canon C-Log2) 프로필을 정확히 인식시키고, Primary Wheels에서 Pivot과 Contrast 값을 정밀하게 조절하여 샤도우 쇄도 현상을 방지해야 합니다.

### 피부톤(Skin Tone) 마스크와 HSL Qualification
인물의 피부톤은 Vectorscope 상의 Skin Tone Line 상에 완벽히 정렬되어야 가장 자연스럽고 건강하게 느껴집니다. Qualifier 툴을 사용해 피부 영역만 따낸 뒤, Midtone Detail을 살짝 감소시키면 잡티 없는 고급스러운 시네마 룩이 완성됩니다.
`,
    featuredImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80",
    author: "정유진 시네마토그래퍼",
    authorRole: "Mdia Lab 컬러리스트",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    date: "2026.06.15",
    readTime: "7분 읽기",
    tags: ["색보정", "컬러그레이딩", "Log촬영", "시네마컬러"],
    keyTakeaways: [
      "전문 컬러 매니지드(Color Managed) 워크플로우 적용",
      "Vectorscope 피부톤 라인 정렬로 자연스러운 피사체 보정",
      "노드 트리 구조화로 효율적인 클라이언트 피드백 반영"
    ],
    isFeatured: false
  },
  {
    id: "b3",
    title: "Adobe 전문 편집툴을 활용한 시네마틱 영상 편집 & 모션그래픽 파이프라인",
    category: "영상 팁 & 노하우",
    summary: "Premiere Pro와 After Effects Dynamic Link를 활용한 리드미컬 컷편집, 키네틱 타이포그래피 및 브랜드 모션그래픽 실무 테크닉.",
    content: `
상업 광고와 브랜드 필름의 완성도를 결정짓는 핵심 요소는 감각적인 컷 전환의 리듬감과 시각적 몰입도를 배가시키는 모션그래픽입니다. Mdia Lab에서는 Adobe Creative Cloud의 전문 툴체인(Premiere Pro, After Effects, Photoshop, Illustrator)을 유기적으로 결합한 하이엔드 포스트 프로덕션 파이프라인을 구축해 운용하고 있습니다.

### 1. Premiere Pro 기반의 리드미컬 컷편집 & 오디오 싱크
러프 컷에서 파이널 컷까지, 내러티브의 감정선에 맞춘 음악 비트 싱크와 L-Cut / J-Cut 오디오 전환 기법을 적극 활용합니다. ProRes 422 HQ 프록시 워크플로우를 통하여 4K/8K 고해상도 푸티지도 끊김 없이 신속하게 컷팅합니다.

### 2. After Effects Dynamic Link & 시네마틱 키네틱 타이포그래피
별도의 렌더링 출력 없이 타임라인을 실시간 동기화하는 Dynamic Link로 세련된 브랜드 로고 인트로, 3D 카메라 트래커를 활용한 공간 트래킹 텍스트, 감각적인 모션 자막을 유연하게 제작합니다.

### 3. 그래픽 에셋의 벡터화 및 사운드 싱크 FX
Illustrator 벡터 로고와 커스텀 그래픽 에셋을 모션 레이어로 세분화한 뒤, 텐션감 있는 이징(Easing Curve) 그래프 에디터 조절과 저음역대 임팩트 사운드 FX를 레이어링하여 압도적인 시각적 몰입감을 완성합니다.
`,
    featuredImage: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
    author: "Mdia Lab 모션 & 에디팅 팀",
    authorRole: "수석 비주얼 에디터",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    date: "2026.05.20",
    readTime: "6분 읽기",
    tags: ["Adobe", "영상편집", "모션그래픽", "PremierePro", "AfterEffects"],
    keyTakeaways: [
      "Premiere Pro & After Effects Dynamic Link 무손실 실시간 연동",
      "브랜드 아이덴티티를 극대화하는 키네틱 타이포 & 3D 트래킹",
      "감각적인 이징(Easing) 모션 커브와 사운드 FX 레이어링"
    ],
    isFeatured: false
  }
];

export const WORKSHOP_CLASSES: WorkshopClass[] = [
  {
    id: "w1",
    title: "단편영화 & 시네마틱 영상 제작 마스터클래스",
    subtitle: "기획, 시나리오, 카메라 조명 연출부터 편집/색보정까지 한 번에 완성",
    target: "영화 연출 희망자, 영상 크리에이터, 입문자 & 현직 커스텀 교육",
    duration: "8주 과정 (주 1회 3시간)",
    level: "초급",
    price: "1:1 맞춤 / 그룹 교육 문의",
    description: "시네마 카메라(RED, Sony FX line)와 전문 라이팅 장비를 직접 다루며 자신만의 단편 연출작을 완성하는 Mdia Lab의 대표 시그니처 강의입니다.",
    highlights: [
      "개인 및 기업 맞춤형 영상 커리큘럼",
      "실제 4K 시네마 카메라 & 조명 장비 전폭 지원",
      "연출-촬영-전문 시네마 색보정 전 과정 코칭",
      "수강생 작품 영상 공모전 출품 지원"
    ],
    curriculum: [
      { step: "1~2주차", title: "시나리오 & 콘티 기획", desc: "이야기 구조화, 로그라인 작성, 스토리보드 시각화" },
      { step: "3~4주차", title: "시네마 라이팅 & 카메라 워크", desc: "조명 3점 세팅, 렌즈 선택과 구도 연출 실습" },
      { step: "5~6주차", title: "현장 촬영 & 감독 연출", desc: "배우 연기 지도 및 씬별 컷 분할 동선 촬영" },
      { step: "7~8주차", title: "편집, 사운드 mixing & 색보정", desc: "시네마 룩 LUT 적용, 사운드 디자이닝, 최종 파이널 렌더링" }
    ],
    badge: "인기 No.1 워크숍"
  },
  {
    id: "w2",
    title: "기업 내부 인하우스 영상제작 팀 출장 강의",
    subtitle: "회사 홍보, 자사 제품 광고, SNS 숏폼을 내부 팀이 직조하는 실무 트레이닝",
    target: "마케팅팀, 마케팅 담당자, 인하우스 영상 전담팀",
    duration: "4주 집중 스피드 과정 / 2일 단기 워크숍",
    level: "중급",
    price: "기업/기관 맞춤 견적",
    description: "외부 대행사에 매번 비싼 비용을 들이지 않고, 내부 팀이 고품질 영상 및 트렌디한 숏폼을 지속적으로 제작할 수 있도록 트레이닝해 드립니다.",
    highlights: [
      "기업 보유 촬영/스마트폰 장비 활용 맞춤 세팅",
      "자사 제품/서비스에 특화된 영상 템플릿 제안",
      "AI 비디오 툴 & 프리미어 실무 단축키 팁 전달",
      "강의 수강 후 30일간 비대면 피드백 보장"
    ],
    curriculum: [
      { step: "1주차", title: "브랜드 영상 기획 & 스크립트 작성", desc: "시선을 사로잡는 3초 후킹 스크립트 설계" },
      { step: "2주차", title: "최소 장비 촬영 & 앵글 기법", desc: "조명과 마이크 세팅, 스마트폰/미러리스 가성비 세팅" },
      { step: "3주차", title: "빠르고 감각적인 컷편집", desc: "자막 템플릿, 배경음악 라이선스, 트랜지션 연출" },
      { step: "4주차", title: "SNS 채널별 최적화 렌더링", desc: "유튜브 쇼츠, 인스타 릴스, 웹 홍보용 포맷 출력" }
    ],
    badge: "기업 맞춤 출강"
  },
  {
    id: "w3",
    title: "1:1 퍼스널 영상 프리미엄 멘토링",
    subtitle: "나만의 영상 프로젝트 집중 코칭 및 기술적 한계 돌파 원데이 세션",
    target: "독립영화 감독 준비생, 포트폴리오 제작 수험생, 개인 유튜버",
    duration: "원데이 (4시간) 또는 1:1 맞춤 일정",
    level: "전문가",
    price: "시간당 1:1 상담 문의",
    description: "현재 제작 중인 영상의 기획안, 컷편집본, 색보정 프로젝트 파일(Project File)을 직접 들고 와 전문가의 1:1 밀착 클리닉을 받는 세션입니다.",
    highlights: [
      "현재 작업 중인 프로젝트 1:1 밀착 피드백",
      "컬러 프리셋 공유 및 로그 파이프라인 구축",
      "오디오 노이즈 제거 & 사운드 마스터링 가이드",
      "영상 포트폴리오 완성 지원"
    ],
    curriculum: [
      { step: "Session 1", title: "프로젝트 분석 & 문제점 진단", desc: "편집 템포, 컷 구성, 색감 밸런스 정밀 체크" },
      { step: "Session 2", title: "실전 커스텀 솔루션 적용", desc: "실시간 라이브 수정, 효과 및 오디오 마스터링" },
      { step: "Session 3", title: "최종 파이널 퀄리티 업그레이드", desc: "마스터 포맷 출력 및 향후 제작 로드맵 제시" }
    ],
    badge: "1:1 프라이빗"
  }
];

export const FEATURE_CARDS: FeatureCard[] = [
  {
    id: "f1",
    title: "회사 소개 (Mdia Lab)",
    subtitle: "시네마틱 미디어 프로덕션",
    iconName: "Film",
    description: "Mdia Lab은 진정성 있는 스토리텔링과 높은 완성도의 시네마틱 비주얼을 제작하는 전문 영상 프로덕션 & 크리에이티브 랩입니다.",
    points: [
      "영화, 광고, 홍보영상 제작 전문 인력",
      "4K/8K 시네마 장비 & 최신 라이팅 시스템",
      "기획부터 편집, 색보정, 사운드까지 All-in-One",
      "유연하고 합리적인 제작 예산 가이드"
    ],
    actionText: "스튜디오 소개 보기",
    actionSection: "company-intro"
  },
  {
    id: "f2",
    title: "포트폴리오 (Portfolio)",
    subtitle: "시선을 사로잡는 영상 작품집",
    iconName: "Clapperboard",
    description: "기업 브랜드 홍보필름, TVC 광고, 독립 단편영화, 유튜브 브랜디드 컨텐츠 등 Mdia Lab이 완성한 다양한 시네마틱 작업물을 확인해보세요.",
    points: [
      "실제 유튜브 연동으로 고화질 즉시 재생",
      "카테고리별 편리한 필터링 및 검색",
      "각 작품별 기획의도 및 제작 비하인드 수록",
      "새로운 참고 영상 URL 등록 및 테스트 가능"
    ],
    actionText: "포트폴리오 둘러보기",
    actionSection: "portfolio"
  },
  {
    id: "f3",
    title: "무료 견적 문의 & 출강 문의",
    subtitle: "빠르고 정밀한 맞춤 상담",
    iconName: "Calculator",
    description: "원하시는 제작 스타일, 참고 유튜브 링크, 예산 범위 및 기획서/콘티 파일 첨부로 24시간 이내 맞춤 견적서와 무료 상담을 받아보세요.",
    points: [
      "기획서/시놉시스 드래그&드롭 간편 파일 첨부",
      "견적문의, 수강문의, 출강문의 1:1 맞춤 상담",
      "기업 인하우스 팀 출강 및 아카데미 안내",
      "24시간 내 이메일 & 전화 상담 답변"
    ],
    actionText: "무료 견적 받아보기",
    actionSection: "estimate"
  }
];
