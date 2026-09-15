import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { PortfolioItem, TestimonialItem } from '../types';
import { PORTFOLIO_DATA, TESTIMONIALS_DATA } from '../data/mockData';

const PORTFOLIOS_COLLECTION = 'portfolios';
const ESTIMATES_COLLECTION = 'estimates';
const TESTIMONIALS_COLLECTION = 'testimonials';

// Extract YouTube ID helper
export const extractYoutubeId = (url: string): string => {
  if (!url) return 'SeXdFQYOZvg';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : 'SeXdFQYOZvg';
};

const OLD_MOCK_PORTFOLIO_IDS = new Set(['p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']);

// Real-time listener for Portfolios
export const subscribePortfolios = (callback: (items: PortfolioItem[]) => void) => {
  const q = query(collection(db, PORTFOLIOS_COLLECTION));
  
  return onSnapshot(q, async (snapshot) => {
    if (snapshot.empty) {
      if (auth.currentUser) {
        console.log("Seeding initial portfolios into Firestore...");
        try {
          for (const item of PORTFOLIO_DATA) {
            await setDoc(doc(db, PORTFOLIOS_COLLECTION, item.id), {
              ...item,
              createdAt: new Date().toISOString()
            });
          }
        } catch (err) {
          console.warn("Could not seed initial data:", err);
        }
      }
      callback(PORTFOLIO_DATA);
    } else {
      // Filter out old deleted example videos
      const validDocs = snapshot.docs.filter(d => !OLD_MOCK_PORTFOLIO_IDS.has(d.id));

      // Asynchronously clean up old example documents if admin is logged in
      if (auth.currentUser) {
        snapshot.docs.forEach(async (d) => {
          if (OLD_MOCK_PORTFOLIO_IDS.has(d.id)) {
            try {
              await deleteDoc(doc(db, PORTFOLIOS_COLLECTION, d.id));
            } catch {
              // ignore
            }
          }
        });
      }

      if (validDocs.length === 0) {
        callback(PORTFOLIO_DATA);
        return;
      }

      const items: PortfolioItem[] = validDocs.map((d) => {
        const data = d.data();
        const isP1 = d.id === 'p1' || data.title?.includes('Mdia Lab 광고') || data.youtubeId === 'SeXdFQYOZvg';
        const youtubeUrl = isP1 ? 'https://youtu.be/SeXdFQYOZvg' : (data.youtubeUrl || 'https://youtu.be/SeXdFQYOZvg');
        const youtubeId = isP1 ? 'SeXdFQYOZvg' : (data.youtubeId || extractYoutubeId(youtubeUrl));
        const title = isP1
          ? "Mdia Lab 광고 홍보영상 포트폴리오"
          : (data.title || "포트폴리오 작품");
        const client = isP1
          ? "Mdia Lab Official"
          : (data.client || "Mdia Lab");
        const year = isP1
          ? "2026"
          : (data.year || "2026");
        const description = isP1
          ? "Mdia Lab의 감각적인 시네마틱 연출과 독창적인 영상 미학을 담은 공식 광고·홍보영상 포트폴리오입니다. 브랜드의 핵심 가치와 비전을 시각적으로 완성도 높게 전달합니다."
          : (data.description || "");
        const thumbnail = isP1
          ? 'https://img.youtube.com/vi/SeXdFQYOZvg/maxresdefault.jpg'
          : (data.thumbnail || `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`);

        return {
          id: d.id,
          title,
          category: isP1 ? '광고/홍보영상' : (data.category || '광고/홍보영상'),
          client,
          year,
          youtubeUrl,
          youtubeId,
          thumbnail,
          description,
          tags: Array.isArray(data.tags) && data.tags.length > 0 ? data.tags : PORTFOLIO_DATA[0].tags,
          isFeatured: data.isFeatured !== undefined ? !!data.isFeatured : true,
          runtime: data.runtime || '01:15'
        };
      });

      // Ensure p1 (Mdia Lab 광고 홍보영상 포트폴리오) is ALWAYS included at index 0
      const p1Index = items.findIndex(it => it.id === 'p1' || it.title === 'Mdia Lab 광고 홍보영상 포트폴리오' || it.youtubeId === 'SeXdFQYOZvg');
      if (p1Index === -1) {
        items.unshift(PORTFOLIO_DATA[0]);
      } else if (p1Index > 0) {
        const [p1Item] = items.splice(p1Index, 1);
        items.unshift(p1Item);
      }

      // Ensure award video (p_award_ulsan / bhohH-kYgys) is included
      const hasAward = items.some(it => it.id === 'p_award_ulsan' || it.youtubeId === 'bhohH-kYgys');
      if (!hasAward) {
        const awardItem = PORTFOLIO_DATA.find(p => p.id === 'p_award_ulsan');
        if (awardItem) {
          items.push(awardItem);
        }
      }

      callback(items);
    }
  }, (error) => {
    console.warn("Firestore subscription error, fallback to local data:", error);
    callback(PORTFOLIO_DATA);
  });
};

// Add new video portfolio (Admin function)
export const addPortfolioVideo = async (item: Omit<PortfolioItem, 'id'>) => {
  const ytId = extractYoutubeId(item.youtubeUrl);
  const thumbnail = item.thumbnail || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  
  const docRef = await addDoc(collection(db, PORTFOLIOS_COLLECTION), {
    ...item,
    youtubeId: ytId,
    thumbnail,
    createdAt: new Date().toISOString()
  });

  return docRef.id;
};

// Delete video portfolio (Admin function)
export const deletePortfolioVideo = async (id: string) => {
  await deleteDoc(doc(db, PORTFOLIOS_COLLECTION, id));
};

// Update video portfolio (Admin function)
export const updatePortfolioVideo = async (id: string, updatedFields: Partial<PortfolioItem>) => {
  let extraFields: Partial<PortfolioItem> = {};
  if (updatedFields.youtubeUrl) {
    const ytId = extractYoutubeId(updatedFields.youtubeUrl);
    extraFields.youtubeId = ytId;
    if (!updatedFields.thumbnail) {
      extraFields.thumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }
  }
  
  await setDoc(doc(db, PORTFOLIOS_COLLECTION, id), {
    ...updatedFields,
    ...extraFields,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

// Submit estimate
export interface EstimateDoc {
  id?: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  budget: string;
  timeline: string;
  youtubeRef?: string;
  message: string;
  filesCount?: number;
  createdAt: string;
}

export const submitEstimateToFirestore = async (data: Omit<EstimateDoc, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, ESTIMATES_COLLECTION), {
    ...data,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
};

// Fetch estimates for admin
export const subscribeEstimates = (callback: (items: EstimateDoc[]) => void) => {
  const q = query(collection(db, ESTIMATES_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const items: EstimateDoc[] = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as EstimateDoc[];
    callback(items);
  }, (err) => {
    console.warn("Error fetching estimates:", err);
    callback([]);
  });
};

// Delete estimate (Admin function)
export const deleteEstimateFromFirestore = async (id: string) => {
  await deleteDoc(doc(db, ESTIMATES_COLLECTION, id));
};

// Showreel Configuration Realtime & Admin Management
export interface ShowreelConfig {
  youtubeUrl: string;
  youtubeId: string;
  title: string;
  runtime: string;
  description?: string;
}

export const DEFAULT_SHOWREEL: ShowreelConfig = {
  youtubeUrl: 'https://youtu.be/SeXdFQYOZvg',
  youtubeId: 'SeXdFQYOZvg',
  title: 'Mdia Lab 대표 브랜드 광고·홍보영상',
  runtime: '01:15',
  description: 'Mdia Lab의 감각적인 시네마틱 연출과 독창적인 영상 미학을 담은 공식 광고·홍보영상입니다.'
};

export const subscribeShowreelConfig = (callback: (config: ShowreelConfig) => void) => {
  const docRef = doc(db, 'settings', 'showreel');
  return onSnapshot(docRef, async (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      const rawUrl = data.youtubeUrl || DEFAULT_SHOWREEL.youtubeUrl;
      const isLegacy = rawUrl.includes('ScMzIvxBSi4');
      const finalUrl = isLegacy ? DEFAULT_SHOWREEL.youtubeUrl : rawUrl;
      const ytId = isLegacy ? 'SeXdFQYOZvg' : extractYoutubeId(finalUrl);
      const title = isLegacy || !data.title || data.title.includes('Showreel 2025')
        ? DEFAULT_SHOWREEL.title
        : data.title;
      const runtime = isLegacy || !data.runtime || data.runtime === '01:35'
        ? DEFAULT_SHOWREEL.runtime
        : data.runtime;
      const description = isLegacy || !data.description || data.description.includes('영화 제작부터')
        ? DEFAULT_SHOWREEL.description
        : data.description;

      if (isLegacy && auth.currentUser) {
        try {
          await setDoc(docRef, DEFAULT_SHOWREEL, { merge: true });
        } catch {
          // ignore
        }
      }

      callback({
        youtubeUrl: finalUrl,
        youtubeId: ytId,
        title,
        runtime,
        description
      });
    } else {
      callback(DEFAULT_SHOWREEL);
    }
  }, (err) => {
    console.warn("Error subscribing to showreel settings:", err);
    callback(DEFAULT_SHOWREEL);
  });
};

export const updateShowreelConfig = async (config: Partial<ShowreelConfig>) => {
  const docRef = doc(db, 'settings', 'showreel');
  const ytId = extractYoutubeId(config.youtubeUrl || DEFAULT_SHOWREEL.youtubeUrl);
  await setDoc(docRef, {
    youtubeUrl: config.youtubeUrl || DEFAULT_SHOWREEL.youtubeUrl,
    youtubeId: ytId,
    title: config.title || DEFAULT_SHOWREEL.title,
    runtime: config.runtime || DEFAULT_SHOWREEL.runtime,
    description: config.description || DEFAULT_SHOWREEL.description,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

// Logo & Branding Settings Realtime & Admin Management
export const subscribeLogoConfig = (callback: (logoUrl: string) => void) => {
  const docRef = doc(db, 'settings', 'branding');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback(data.logoUrl || '');
    } else {
      callback('');
    }
  }, (err) => {
    console.warn("Error subscribing to logo settings:", err);
    callback('');
  });
};

export const updateLogoConfig = async (logoUrl: string) => {
  const docRef = doc(db, 'settings', 'branding');
  await setDoc(docRef, {
    logoUrl,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

// ==================== TESTIMONIALS (후기 시스템) ====================

// Real-time subscriber for Testimonials
export const subscribeTestimonials = (callback: (items: TestimonialItem[]) => void) => {
  const q = query(collection(db, TESTIMONIALS_COLLECTION));

  return onSnapshot(q, async (snapshot) => {
    if (snapshot.empty) {
      // If empty in Firestore, check if we need to seed initial reviews
      let localItems: TestimonialItem[] = [];
      try {
        const saved = localStorage.getItem('mdialab_client_reviews');
        if (saved) {
          localItems = JSON.parse(saved);
        }
      } catch (e) {
        console.warn("Local storage parse error:", e);
      }

      const itemsToUse = localItems.length > 0 ? localItems : TESTIMONIALS_DATA;

      if (auth.currentUser) {
        try {
          for (const item of itemsToUse) {
            await setDoc(doc(db, TESTIMONIALS_COLLECTION, item.id), {
              ...item,
              createdAt: item.createdAt || new Date().toISOString(),
              isPublic: item.isPublic ?? true
            });
          }
        } catch (seedErr) {
          console.warn("Could not seed testimonials to Firestore:", seedErr);
        }
      }

      callback(itemsToUse);
      return;
    }

    const NOTICE_QUOTE = "Mdia Lab과 함께 비전을 완성한 브랜드, 연출가, 기업 클라이언트들의 진솔한 평점과 소감을 보내주세요.";

    const items: TestimonialItem[] = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      const isNoticeT1 = docSnap.id === 't1' && (data.quote?.includes('기존 외주 프로덕션') || !data.quote || data.clientRole === 'Studio Notice' || data.projectCategory === '공지사항');
      return {
        id: docSnap.id,
        quote: isNoticeT1 ? NOTICE_QUOTE : (data.quote || ''),
        clientName: isNoticeT1 ? 'Mdia Lab 스튜디오' : (data.clientName || ''),
        clientRole: isNoticeT1 ? '공식 공지' : (data.clientRole || ''),
        company: isNoticeT1 ? 'Mdia Lab 시네마 프로덕션' : (data.company || ''),
        avatar: isNoticeT1 ? '/lee-mina-logo.svg' : (data.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80`),
        rating: typeof data.rating === 'number' ? data.rating : 5,
        projectName: isNoticeT1 ? '클라이언트 평점 및 소감 접수' : (data.projectName || ''),
        projectCategory: isNoticeT1 ? '공지사항' : (data.projectCategory || '기타'),
        date: data.date || new Date().toISOString().split('T')[0].replace(/-/g, '.'),
        isPublic: data.isPublic !== undefined ? data.isPublic : true,
        createdAt: data.createdAt || ''
      };
    });

    // Ensure t1 (Notice) is strictly the 1st slide, followed by remaining testimonials
    items.sort((a, b) => {
      if (a.id === 't1') return -1;
      if (b.id === 't1') return 1;
      return 0;
    });

    // Save to local storage for fast cached display
    try {
      localStorage.setItem('mdialab_client_reviews', JSON.stringify(items));
    } catch (e) {}

    callback(items);
  }, (err) => {
    console.warn("Error listening to testimonials in Firestore, using cached/mock data:", err);
    try {
      const saved = localStorage.getItem('mdialab_client_reviews');
      if (saved) {
        callback(JSON.parse(saved));
        return;
      }
    } catch (e) {}
    callback(TESTIMONIALS_DATA);
  });
};

// Submit a new testimonial (defaults to isPublic: false for general users)
export const submitTestimonialToFirestore = async (
  item: Omit<TestimonialItem, 'id'>, 
  customId?: string
): Promise<string> => {
  const docId = customId || `t_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, TESTIMONIALS_COLLECTION, docId);
  
  const payload: TestimonialItem = {
    ...item,
    id: docId,
    isPublic: item.isPublic !== undefined ? item.isPublic : false, // Default is private until admin approves!
    createdAt: item.createdAt || new Date().toISOString()
  };

  try {
    await setDoc(docRef, payload);
  } catch (err) {
    console.warn("Firestore write error, falling back to local persistence:", err);
  }

  // Update local storage
  try {
    const saved = localStorage.getItem('mdialab_client_reviews');
    const existing: TestimonialItem[] = saved ? JSON.parse(saved) : [...TESTIMONIALS_DATA];
    const updated = [payload, ...existing.filter(x => x.id !== docId)];
    localStorage.setItem('mdialab_client_reviews', JSON.stringify(updated));
  } catch (e) {}

  return docId;
};

// Update existing testimonial (e.g. toggle isPublic, edit quote)
export const updateTestimonialInFirestore = async (
  id: string,
  updates: Partial<TestimonialItem>
) => {
  try {
    const docRef = doc(db, TESTIMONIALS_COLLECTION, id);
    await setDoc(docRef, updates, { merge: true });
  } catch (err) {
    console.warn("Firestore update error, updating local:", err);
  }

  try {
    const saved = localStorage.getItem('mdialab_client_reviews');
    if (saved) {
      const existing: TestimonialItem[] = JSON.parse(saved);
      const updated = existing.map(x => x.id === id ? { ...x, ...updates } : x);
      localStorage.setItem('mdialab_client_reviews', JSON.stringify(updated));
    }
  } catch (e) {}
};

// Delete testimonial
export const deleteTestimonialFromFirestore = async (id: string) => {
  try {
    const docRef = doc(db, TESTIMONIALS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn("Firestore delete error, updating local:", err);
  }

  try {
    const saved = localStorage.getItem('mdialab_client_reviews');
    if (saved) {
      const existing: TestimonialItem[] = JSON.parse(saved);
      const updated = existing.filter(x => x.id !== id);
      localStorage.setItem('mdialab_client_reviews', JSON.stringify(updated));
    }
  } catch (e) {}
};

