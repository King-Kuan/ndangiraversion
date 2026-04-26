import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('ndangira_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('ndangira_cookie_consent', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-[70]"
        >
          <div className="bg-stone-900 text-white p-6 rounded-[2rem] shadow-2xl border border-white/10 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Shield size={24} className="text-emerald-500" />
              </div>
              <div className="flex-grow">
                <h4 className="text-sm font-black uppercase tracking-widest mb-2 italic">Institutional Data Consent</h4>
                <p className="text-stone-400 text-xs leading-relaxed mb-4">
                  Ndangira utilizes essential session cryptograms (cookies) to facilitate system integrity, authenticate sessions, and optimize the enterprise discovery interface. By persisting on this platform, you acknowledge our professional use of these data assets.
                </p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleAccept}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
                  >
                    Accept Protocols
                  </button>
                  <Link 
                    to="/privacy" 
                    className="text-stone-500 hover:text-white text-[10px] uppercase font-bold tracking-widest transition-colors"
                  >
                    Review Governance
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
