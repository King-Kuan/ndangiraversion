import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { PalaceAd } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Megaphone } from 'lucide-react';

export const GlobalRibbon = () => {
  const [ad, setAd] = useState<PalaceAd | null>(null);

  useEffect(() => {
    const fetchRibbon = async () => {
      try {
        const q = query(
          collection(db, 'palaceads'), 
          where('placement', '==', 'ribbon'),
          where('status', '==', 'active'),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          setAd({ id: doc.id, ...doc.data() } as PalaceAd);
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
          <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase underline decoration-2 underline-offset-4 hover:text-purple-200 transition-colors">
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
      // Small chance to show popup to not annoy users too much
      if (Math.random() > 0.4) return;
      
      try {
        const q = query(
          collection(db, 'palaceads'), 
          where('placement', '==', 'popup'),
          where('status', '==', 'active'),
          limit(5) // Get a random one from top 5
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const randomIndex = Math.floor(Math.random() * snapshot.docs.length);
          const doc = snapshot.docs[randomIndex];
          setAd({ id: doc.id, ...doc.data() } as PalaceAd);
          
          // Show after 5 seconds delay
          setTimeout(() => setIsOpen(true), 5000);
        }
      } catch (error) {
        console.error('Popup fetch failed', error);
      }
    };
    fetchPopup();
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
                onClick={() => setIsOpen(false)}
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
