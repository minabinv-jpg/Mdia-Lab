export interface PortfolioItem {
  id: string;
  title: string;
  category: "광고/홍보영상" | "영상 공모전 수상작" | "영화/상업작품" | "다큐멘터리" | "뮤직비디오" | "숏폼/브랜디드" | "제작 강의" | string;
  client: string;
  year: string;
  youtubeUrl: string;
  youtubeId: string;
  thumbnail: string;
  description: string;
  tags: string[];
  isFeatured?: boolean;
  runtime?: string;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  clientName: string;
  clientRole: string;
  company: string;
  avatar: string;
  rating: number; // 1 - 5
  projectName: string;
  projectCategory: string;
  date: string;
  isPublic?: boolean;
  createdAt?: string;
}

export interface BlogPostItem {
  id: string;
  title: string;
  category: "제작 비하인드" | "영상 팁 & 노하우" | "장비 & 기술 Review" | "스튜디오 소식";
  summary: string;
  content: string; // Full formatted markdown or multi-paragraph text
  featuredImage: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  tags: string[];
  keyTakeaways?: string[];
  isFeatured?: boolean;
}

export interface WorkshopClass {
  id: string;
  title: string;
  subtitle: string;
  target: string;
  duration: string;
  level: "초급" | "중급" | "전문가";
  price: string;
  description: string;
  highlights: string[];
  curriculum: Array<{ step: string; title: string; desc: string }>;
  badge: string;
}

export interface NoticeItem {
  id: string;
  category: "공지" | "강의안내" | "제작일기" | "질문답변";
  title: string;
  author: string;
  date: string;
  views: number;
  content: string;
  pinned?: boolean;
  isSecret?: boolean;
  hasPassword?: boolean;
  password?: string;
  answer?: string;
  answeredAt?: string;
}

export interface InquiryFormState {
  name: string;
  email: string;
  phone: string;
  category: string;
  budget: string;
  timeline: string;
  youtubeRef: string;
  message: string;
  files: Array<{ name: string; size: number; type: string; data?: string }>;
}

export interface FeatureCard {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  description: string;
  points: string[];
  actionText: string;
  actionSection: string;
}
