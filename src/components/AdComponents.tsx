import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { PalaceAd } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Megaphone } from 'lucide-react';

const trackAdView = async (adId: string) => {
  try {
    await updateDoc(doc(db, 'palaceads', adId), {
      views: increment(1)
    });
  } catch (err) {
    // Silently fail to not interrupt UX
    console.warn('Ad tracking failed', err);
  }
};

export const trackAdClick = async (adId: string) => {
  try {
    await updateDoc(doc(db, 'palaceads', adId), {
      clicks: increment(1)
    });
  } catch (err) {
    console.warn('Click tracking failed', err);
  }
};

export const AdCard: React.FC<{ ad: PalaceAd }> = ({ ad }) => {
  useEffect(() => {
    trackAdView(ad.id);
  }, [ad.id]);

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border-2 border-purple-100 transition-all group flex flex-col relative h-full">
      <div className="absolute top-4 right-4 z-10">
        <span className="bg-purple-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg tracking-widest shadow-lg">Sponsored</span>
      </div>
      <div className="relative h-56 bg-stone-100">
        {ad.image ? (
          <img 
            src={ad.image} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            referrerPolicy="no-referrer"
            alt={ad.title}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <Megaphone size={48} />
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-2 text-purple-600">
          <Megaphone size={12} />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">Partner Spotlight</span>
        </div>
        <h3 className="text-xl font-black text-stone-900 mb-2 line-clamp-1 italic uppercase leading-tight">{ad.title}</h3>
        {ad.description && <p className="text-xs text-stone-500 line-clamp-2 mb-4 font-medium leading-relaxed">{ad.description}</p>}
        {ad.businessName && (
          <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-4 flex items-center gap-2">
            By <span className="text-stone-900">{ad.businessName}</span>
          </p>
        )}
        <div className="mt-auto">
          {ad.targetUrl ? (
            <a 
              href={ad.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackAdClick(ad.id)}
              className="w-full bg-stone-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg"
            >
              Learn More
              <ExternalLink size={12} />
            </a>
          ) : (
            <div className="w-full bg-stone-100 text-stone-400 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center">
              Special Offer
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const GlobalRibbon = () => {
  const [ad, setAd] = useState<PalaceAd | null>(null);

  useEffect(() => {
    const fetchRibbon = async () => {
      try {
        const q = query(
          collection(db, 'palaceads'), 
          where('placement', '==', 'ribbon'),
          where('status', '==', 'active'),
          limit(10)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const randomIndex = Math.floor(Math.random() * snapshot.docs.length);
          const docData = snapshot.docs[randomIndex];
          setAd({ id: docData.id, ...docData.data() } as PalaceAd);
          trackAdView(docData.id);
        }
      } catch (error) {
        console.error('Ribbon fetch failed', error);
      }
    };
    fetchRibbon();
  }, []);

  if (!ad) return null;

  return (
    <div className="bg-purple-600 text-white py-2 px-4 overflow-hidden relative">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
        <div className="flex items-center gap-2 animate-pulse">
          <Megaphone size={14} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Partner Hub</span>
        </div>
        <p className="text-xs font-bold tracking-wide truncate">{ad.title}</p>
        {ad.targetUrl && (
          <a 
            href={ad.targetUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={() => trackAdClick(ad.id)}
            className="text-[10px] font-black uppercase underline decoration-2 underline-offset-4 hover:text-purple-200 transition-colors"
          >
            View Details
          </a>
        )}
      </div>
    </div>
  );
};

export const PalacePopup = () => {
  const [ad, setAd] = useState<PalaceAd | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchPopup = async () => {
      // Small chance for random global popup (now 15%)
      if (Math.random() > 0.15) return;
      
      try {
        const q = query(
          collection(db, 'palaceads'), 
          where('placement', '==', 'popup'),
          where('status', '==', 'active'),
          limit(5)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const randomIndex = Math.floor(Math.random() * snapshot.docs.length);
          const docData = snapshot.docs[randomIndex];
          setAd({ id: docData.id, ...docData.data() } as PalaceAd);
          
          // Show after 8 seconds delay globally
          setTimeout(() => {
            setIsOpen(true);
            trackAdView(docData.id);
          }, 8000);
        }
      } catch (error) {
        console.error('Popup fetch failed', error);
      }
    };

    const triggerPopup = async () => {
      try {
        const q = query(
          collection(db, 'palaceads'), 
          where('placement', '==', 'popup'),
          where('status', '==', 'active'),
          limit(5)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const randomIndex = Math.floor(Math.random() * snapshot.docs.length);
          const docData = snapshot.docs[randomIndex];
          setAd({ id: docData.id, ...docData.data() } as PalaceAd);
          setIsOpen(true);
          trackAdView(docData.id);
        }
      } catch (error) {
        console.warn('Contextual popup failed', error);
      }
    };

    fetchPopup();

    // Listen for contextual business-related triggers
    const handleTrigger = (e: any) => {
      if (e.detail?.type === 'popup') {
        triggerPopup();
      }
    };
    window.addEventListener('palace-ad-trigger', handleTrigger as any);
    return () => window.removeEventListener('palace-ad-trigger', handleTrigger as any);
  }, []);

  if (!ad) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm pointer-events-auto"
            onClick={() => setIsOpen(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-stone-900 shadow-lg hover:bg-white transition-all"
            >
              <X size={20} />
            </button>
            
            {ad.image && (
              <div className="h-64 overflow-hidden bg-stone-100">
                <img src={ad.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={ad.title} />
              </div>
            )}
            
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-2 mb-4 text-purple-600">
                <Megaphone size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Promotion</span>
              </div>
              <h3 className="text-2xl font-black text-stone-900 mb-2 leading-tight">{ad.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed mb-8">{ad.description}</p>
              
              <a 
                href={ad.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackAdClick(ad.id);
                  setIsOpen(false);
                }}
                className="block w-full bg-stone-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs text-center shadow-lg hover:bg-black transition-all"
              >
                Learn More
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const RedirectInterstitial = () => {
  const [ad, setAd] = useState<PalaceAd | null>(null);
  const [show, setShow] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const fetchRedirect = async () => {
      // Chance for random redirect (now 5%)
      if (Math.random() > 0.05) return;

      try {
        const q = query(
          collection(db, 'palaceads'), 
          where('placement', '==', 'redirect'),
          where('status', '==', 'active'),
          limit(10)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const randomIndex = Math.floor(Math.random() * snapshot.docs.length);
          const docData = snapshot.docs[randomIndex];
          setAd({ id: docData.id, ...docData.data() } as PalaceAd);
          setShow(true);
          trackAdView(docData.id);
        }
      } catch (error) {
        console.error('Redirect fetch failed', error);
      }
    };

    const triggerRedirect = async () => {
      try {
        const q = query(
          collection(db, 'palaceads'), 
          where('placement', '==', 'redirect'),
          where('status', '==', 'active'),
          limit(10)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const randomIndex = Math.floor(Math.random() * snapshot.docs.length);
          const docData = snapshot.docs[randomIndex];
          setAd({ id: docData.id, ...docData.data() } as PalaceAd);
          setShow(true);
          trackAdView(docData.id);
        }
      } catch (error) {
        console.warn('Contextual redirect failed', error);
      }
    };

    fetchRedirect();

    const handleTrigger = (e: any) => {
      if (e.detail?.type === 'redirect') {
        triggerRedirect();
      }
    };
    window.addEventListener('palace-ad-trigger', handleTrigger as any);
    return () => window.removeEventListener('palace-ad-trigger', handleTrigger as any);
  }, []);

  useEffect(() => {
    if (show && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (show && countdown === 0 && ad?.targetUrl) {
      trackAdClick(ad.id);
      window.open(ad.targetUrl, '_blank');
      setShow(false);
    }
  }, [show, countdown, ad]);

  if (!show || !ad) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-stone-900 flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 bg-purple-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 animate-bounce">
          <ExternalLink size={40} />
        </div>
        {ad.image && (
          <div className="w-full h-48 rounded-3xl overflow-hidden mb-8 shadow-2xl border border-white/10">
            <img src={ad.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={ad.title} />
          </div>
        )}
        <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">Partner Spotlight</h2>
        <p className="text-stone-400 font-bold mb-8 italic">"{ad.title}"</p>
        <div className="text-5xl font-black text-emerald-400 mb-8">{countdown}</div>
        <p className="text-stone-500 text-xs font-bold uppercase tracking-widest">You are being redirected to our partner...</p>
        <button 
          onClick={() => setShow(false)}
          className="mt-12 text-stone-600 hover:text-white transition-colors text-xs font-black uppercase tracking-[0.2em]"
        >
          Cancel & Stay on Ndangira
        </button>
      </div>
    </div>
  );
};
