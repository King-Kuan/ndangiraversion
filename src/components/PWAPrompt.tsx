import React, { useState, useEffect } from 'react';
import { Download, Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAPrompt() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Show prompt after 3 seconds if not already installed
      setTimeout(() => setShowPrompt(true), 3000);
    };

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isIOS && !isStandalone) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS) {
        alert('To install: tap the Share icon and then "Add to Home Screen"');
      }
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
  };

  const requestNotifications = async () => {
    if (typeof Notification === 'undefined') return;
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      alert('Notifications enabled! You will be notified when your saved businesses post new updates.');
    }
  };

  if (!showPrompt && notificationPermission !== 'default') return null;

  return (
    <AnimatePresence>
      {(showPrompt || notificationPermission === 'default') && (
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-50"
        >
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600 rounded-full blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2" />
            
            <button 
              onClick={() => setShowPrompt(false)}
              className="absolute top-4 right-4 text-stone-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="relative z-10">
              <h4 className="text-white font-black text-lg mb-2">Enhance your experience</h4>
              <p className="text-stone-400 text-xs leading-relaxed mb-6">
                Add Ndangira to your home screen for offline access and enable notifications to stay updated with your favorite local spots.
              </p>

              <div className="flex flex-col gap-3">
                {showPrompt && (
                  <button 
                    onClick={handleInstall}
                    className="w-full bg-emerald-600 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-lg active:scale-95"
                  >
                    <Download size={16} />
                    {installPrompt ? 'Install App' : 'How to Install'}
                  </button>
                )}
                {notificationPermission === 'default' && (
                  <button 
                    onClick={requestNotifications}
                    className="w-full bg-white text-stone-900 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-stone-100 transition-all shadow-lg active:scale-95"
                  >
                    <Bell size={16} />
                    Enable Notifications
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
