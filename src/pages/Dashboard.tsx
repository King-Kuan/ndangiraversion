import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { BusinessListing, PalaceAd, AdPlacement, BusinessPlan } from '../types';
import { AD_PRICES, CITIES } from '../constants';
import { 
  Building2, 
  Settings, 
  BarChart3, 
  Megaphone, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  XCircle,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Users,
  Eye,
  Star as StarIcon,
  Navigation,
  MapPin,
  X,
  Image as ImageIcon,
  ExternalLink as LinkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const [user, loadingAuth] = useAuthState(auth);
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [activeBusinessIndex, setActiveBusinessIndex] = useState(0);
  const [ads, setAds] = useState<PalaceAd[]>([]);
  const [loading, setLoading] = useState(true);

  const business = businesses[activeBusinessIndex] || null;

  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [newAd, setNewAd] = useState({
    title: '',
    description: '',
    image: '',
    targetUrl: '',
    placement: 'ribbon' as AdPlacement
  });
  const [isUploading, setIsUploading] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const busQuery = query(collection(db, 'businesses'), where('ownerUid', '==', user.uid));
      const busSnapshot = await getDocs(busQuery);
      const fetchedBusinesses = busSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessListing));
      setBusinesses(fetchedBusinesses);

      const adsQuery = query(collection(db, 'palaceads'), where('ownerUid', '==', user.uid));
      const adsSnapshot = await getDocs(adsQuery);
      setAds(adsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PalaceAd)));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'dashboard/data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUploading(true);
    setAdError(null);
    try {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const adData = {
        ...newAd,
        ownerUid: user.uid,
        businessName: business?.name || 'Independent',
        businessPhone: business?.phone || '',
        city: business?.city || 'Kigali', // Fallback to Kigali if no business
        status: 'pending',
        expiryDate: thirtyDaysFromNow,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'palaceads'), adData);
      setAds(prev => [{ 
        id: docRef.id, 
        ...adData, 
        createdAt: { seconds: Date.now()/1000 } 
      } as unknown as PalaceAd, ...prev]);
      setIsAdModalOpen(false);
      setNewAd({ title: '', description: '', image: '', targetUrl: '', placement: 'ribbon' });
      alert("Campaign submitted for approval! Our team will review your request shortly.");
    } catch (error: any) {
      console.error(error);
      setAdError(error.message || "Failed to submit campaign. Please try again.");
      try { handleFirestoreError(error, OperationType.CREATE, 'palaceads'); } catch(e) {}
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpgrade = async (plan: BusinessPlan) => {
    if (!business) return;
    try {
      const docRef = doc(db, 'businesses', business.id);
      await updateDoc(docRef, { pendingPlanUpdate: plan });
      setBusinesses(prev => prev.map(b => b.id === business.id ? { ...b, pendingPlanUpdate: plan } : b));
      alert("Upgrade request submitted! An admin will review your payment and approve the upgrade shortly.");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `businesses/${business.id}`);
    }
  };

  useEffect(() => {
    if (!loadingAuth && !user) navigate('/login');
    fetchData();
  }, [user, loadingAuth, navigate]);

  if (loadingAuth || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusIcons = {
    pending: <Clock className="text-yellow-500" size={18} />,
    active: <CheckCircle className="text-emerald-500" size={18} />,
    rejected: <AlertCircle className="text-red-500" size={18} />,
    expired: <XCircle className="text-stone-500" size={18} />
  };

  const statusBg = {
    pending: 'bg-yellow-50 text-yellow-800',
    active: 'bg-emerald-50 text-emerald-800',
    rejected: 'bg-red-50 text-red-800',
    expired: 'bg-stone-50 text-stone-800'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-black text-stone-900 tracking-tight mb-2">Owner Dashboard</h1>
          <p className="text-stone-500 font-medium">Welcome back, {user?.displayName}. Here's how your business is doing.</p>
          
          {businesses.length > 1 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {businesses.map((b, idx) => (
                <button
                  key={b.id}
                  onClick={() => setActiveBusinessIndex(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeBusinessIndex === idx ? 'bg-stone-900 text-white' : 'bg-white border border-stone-100 text-stone-400'}`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-4">
          <Link to="/pricing" className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all">
            <ArrowUpRight size={18} />
            Upgrade Plan
          </Link>
          <Link to="/dashboard/settings" className="bg-white border border-stone-200 text-stone-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-stone-50 transition-all">
            <Settings size={18} />
            Manage Listing
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Views', value: business?.views || 0, icon: Eye, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Map Clicks', value: business?.mapClicks || 0, icon: Navigation, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Ratings', value: business?.rating || 0, icon: StarIcon, color: 'text-yellow-500', bg: 'bg-yellow-50' },
          { label: 'Total Ads', value: ads.length, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-1">{stat.label}</span>
            <span className="text-3xl font-black text-stone-900">{stat.value}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Listing View */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-100 overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <Building2 className="text-emerald-600" />
                  Your Listing
                </h2>
                {business && (
                  <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${statusBg[business.status]}`}>
                    {statusIcons[business.status]}
                    {business.status}
                  </div>
                )}
              </div>

              {business ? (
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-48 h-48 rounded-3xl bg-stone-100 overflow-hidden shrink-0 border border-stone-100">
                    {business.photos?.[0] ? (
                      <img src={business.photos[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <Building2 size={40} />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-stone-900 mb-1">{business.name}</h3>
                      <p className="text-stone-500 text-sm line-clamp-2 leading-relaxed">{business.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-stone-400">
                      <div className="flex items-center gap-1.5"><MapPin size={14} /> District: {business.city}</div>
                      <div className="flex items-center gap-1.5"><CreditCard size={14} /> Plan: {business.plan}</div>
                    </div>
                    <div className="pt-4 flex gap-4">
                      <Link to={`/business/${business.id}`} className="text-stone-900 border-b-2 border-stone-900 font-black text-xs uppercase tracking-widest hover:text-emerald-600 hover:border-emerald-600 transition-all">View Public Profile</Link>
                    </div>

                    {business.pendingPlanUpdate && (
                      <div className="mt-6 p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center gap-4">
                        <TrendingUp className="text-purple-600" size={20} />
                        <div>
                          <p className="text-xs font-bold text-purple-900">Upgrade to {business.pendingPlanUpdate} Pending</p>
                          <p className="text-[10px] text-purple-600 font-medium">Under admin review. Please complete payment to activate.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
                  <p className="text-stone-400 mb-6">You haven't added a business listing yet.</p>
                  <Link to="/register" className="bg-stone-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-black">Add Listing Now</Link>
                </div>
              )}
            </div>
            {business && business.status === 'pending' && (
              <div className="bg-yellow-50 border-t border-yellow-100 p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <Clock className="text-yellow-600 shrink-0" size={24} />
                <div className="flex-grow">
                  <h4 className="font-bold text-yellow-900 text-sm">Under Review</h4>
                  <p className="text-xs text-yellow-700 font-medium">An admin is verifying your details. This usually takes 24-48 hours.</p>
                </div>
              </div>
            )}
          </div>

          {/* PalaceAds Management */}
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-100 p-8 md:p-10">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Megaphone className="text-purple-600" />
                PalaceAds
              </h2>
              <button 
                onClick={() => setIsAdModalOpen(true)}
                className="bg-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-purple-700 shadow-md"
              >
                <Plus size={18} />
                New Campaign
              </button>
            </div>

            {ads.length > 0 ? (
              <div className="space-y-4">
                {ads.map((ad) => (
                  <div key={ad.id} className="flex items-center justify-between p-5 rounded-3xl bg-stone-50 border border-stone-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                        <Megaphone size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-bold text-stone-900 leading-none">{ad.title}</h4>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${statusBg[ad.status]}`}>
                            {ad.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest">{ad.placement}</p>
                          <span className="w-1 h-1 bg-stone-200 rounded-full" />
                          <p className="text-[10px] font-bold text-stone-500">
                            {ad.expiryDate?.seconds ? `Exp: ${new Date(ad.expiryDate.seconds * 1000).toLocaleDateString()}` : 'One month duration'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button className="text-stone-400 hover:text-stone-900 p-2 rounded-xl transition-colors">
                      <ArrowUpRight size={20} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-stone-400 italic text-sm">No active ad campaigns yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info/Tips */}
        <aside className="space-y-8">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
              <TrendingUp size={120} />
            </div>
            <h3 className="font-black text-2xl leading-tight mb-4">Scale your<br />business online</h3>
            <p className="text-xs font-medium text-emerald-100 opacity-80 leading-relaxed mb-8">
              Ndangira is built for growth. Upgrade to a standard plan to unlock up to 10 photos and higher visibility.
            </p>
            <div className="flex gap-4">
              {business.plan !== 'featured' && (
                <button 
                  onClick={() => handleUpgrade('featured')}
                  className="inline-block bg-white text-emerald-900 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg hover:scale-105 transition-transform"
                >
                  Upgrade to Featured
                </button>
              )}
              {business.plan === 'free' && (
                <button 
                  onClick={() => handleUpgrade('standard')}
                  className="inline-block bg-emerald-100 text-emerald-900 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg hover:scale-105 transition-transform"
                >
                  Go Standard
                </button>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100">
            <h4 className="font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="text-stone-400" size={18} />
              Tips for Growth
            </h4>
            <ul className="space-y-6">
              {[
                { title: 'Add high-quality photos', text: 'Visuals increase clicks by 40%.' },
                { title: 'Ask for reviews', text: 'Ratings improve your search rank.' },
                { title: 'Update your hours', text: 'Avoid customer frustration.' },
              ].map((tip, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 text-[10px] font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h5 className="font-bold text-stone-900 text-sm">{tip.title}</h5>
                    <p className="text-xs text-stone-500 leading-relaxed">{tip.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
      {/* Ad Creation Modal */}
      <AnimatePresence>
        {isAdModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-stone-100 flex items-center justify-between">
                <h3 className="text-2xl font-black text-stone-900">New Campaign</h3>
                <button onClick={() => setIsAdModalOpen(false)} className="text-stone-400 hover:text-stone-900 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAdCreate} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                {adError && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-3">
                    <AlertCircle size={16} />
                    <span>{adError}</span>
                  </div>
                )}
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Campaign Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'ribbon', label: 'Ribbon', desc: 'Words only' },
                      { id: 'popup', label: 'Pop-up', desc: 'Img + words' },
                      { id: 'redirect', label: 'Redirect', desc: 'Direct link' },
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setNewAd(prev => ({ ...prev, placement: t.id as AdPlacement }))}
                        className={`p-4 rounded-2xl border-2 transition-all text-left ${newAd.placement === t.id ? 'border-purple-600 bg-purple-50' : 'border-stone-100 hover:border-stone-200'}`}
                      >
                        <p className={`text-xs font-black uppercase tracking-wide ${newAd.placement === t.id ? 'text-purple-700' : 'text-stone-900'}`}>{t.label}</p>
                        <p className={`text-[10px] font-bold ${newAd.placement === t.id ? 'text-purple-600' : 'text-emerald-600'}`}>{AD_PRICES[t.id as keyof typeof AD_PRICES]}</p>
                        <p className="text-[10px] text-stone-400 font-medium">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Headline / Words</label>
                  <input 
                    type="text"
                    required
                    placeholder="Enter short engaging words..."
                    className="w-full bg-stone-50 border-stone-100 rounded-xl px-4 py-3 text-sm focus:ring-purple-500"
                    value={newAd.title}
                    onChange={(e) => setNewAd(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                {newAd.placement === 'popup' && (
                  <>
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Image URL</label>
                      <input 
                        type="url"
                        placeholder="https://..."
                        className="w-full bg-stone-50 border-stone-100 rounded-xl px-4 py-3 text-sm focus:ring-purple-500"
                        value={newAd.image}
                        onChange={(e) => setNewAd(prev => ({ ...prev, image: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Description</label>
                      <textarea 
                        className="w-full bg-stone-50 border-stone-100 rounded-xl px-4 py-3 text-sm focus:ring-purple-500"
                        placeholder="Additional details for the popup..."
                        value={newAd.description}
                        onChange={(e) => setNewAd(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </>
                )}

                {(newAd.placement === 'popup' || newAd.placement === 'redirect') && (
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Target URL / Link</label>
                    <input 
                      type="url"
                      required
                      placeholder="https://yourwebsite.com"
                      className="w-full bg-stone-50 border-stone-100 rounded-xl px-4 py-3 text-sm focus:ring-purple-500"
                      value={newAd.targetUrl}
                      onChange={(e) => setNewAd(prev => ({ ...prev, targetUrl: e.target.value }))}
                    />
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isUploading}
                  className="w-full bg-purple-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-purple-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {isUploading ? 'Submitting...' : 'Submit Campaign'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
