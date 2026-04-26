import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { BusinessListing, PalaceAd } from '../types';
import { CITIES, CATEGORIES } from '../constants';
import MapComponent from '../components/MapComponent';
import { AdCard } from '../components/AdComponents';
import { Search, Map as MapIcon, Grid, Filter, MapPin, Star, Navigation, ExternalLink, CheckCircle, TrendingUp, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Home() {
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [ads, setAds] = useState<PalaceAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Gasabo');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [mapCenter, setMapCenter] = useState<[number, number]>([-1.9, 30.1]);
  const [mapZoom, setMapZoom] = useState(13);

  const fetchAds = async () => {
    try {
      const q = query(
        collection(db, 'palaceads'),
        where('placement', '==', 'card'),
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(q);
      setAds(snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as PalaceAd))
        .filter(ad => ad.isVerified === true)
      );
    } catch (err) {
      console.warn('Ads fetch failed', err);
    }
  };

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      let q = query(
        collection(db, 'businesses'),
        where('status', '==', 'active'),
        limit(50)
      );

      if (selectedCity) {
        q = query(q, where('city', '==', selectedCity));
        const cityObj = CITIES.find(c => c.name === selectedCity);
        if (cityObj) {
          setMapCenter([cityObj.lat, cityObj.lng]);
          setMapZoom(13);
        }
      }

      if (selectedCategory) {
        q = query(q, where('category', '==', selectedCategory));
      }

      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessListing));
      
      // Sort: Featured first, then Standard, then Free
      const sortedResults = results.sort((a, b) => {
        const planOrder = { featured: 0, standard: 1, free: 2 };
        return planOrder[a.plan] - planOrder[b.plan];
      });

      setBusinesses(sortedResults);
      
      // Trigger a popup when results are loaded (20% chance)
      if (Math.random() < 0.2) {
        window.dispatchEvent(new CustomEvent('palace-ad-trigger', { detail: { type: 'popup' } }));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'businesses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Rare redirect trigger when user spends time browsing
    const timer = setTimeout(() => {
      if (Math.random() < 0.1) {
        window.dispatchEvent(new CustomEvent('palace-ad-trigger', { detail: { type: 'redirect' } }));
      }
    }, 30000); // 30 seconds of browsing

    return () => clearTimeout(timer);
  }, [selectedCity, selectedCategory]);

  useEffect(() => {
    fetchBusinesses();
    fetchAds();
  }, [selectedCity, selectedCategory]);

  const filteredBusinesses = businesses.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

    const interspersedItems: any[] = [];
    if (viewMode === 'grid') {
      let adIdx = 0;
      
      if (filteredBusinesses.length > 0) {
        filteredBusinesses.forEach((b, i) => {
          interspersedItems.push({ type: 'business', data: b });
          
          // Ad after 1st business, then every 3
          const shouldShowAd = ads.length > 0 && (i === 0 || (i > 0 && (i + 1) % 3 === 0));
          if (shouldShowAd) {
            interspersedItems.push({ type: 'ad', data: ads[adIdx % ads.length] });
            adIdx++;
          }
        });
      } else if (!loading && ads.length > 0) {
        // Show only ads if no businesses found
        ads.forEach(ad => interspersedItems.push({ type: 'ad', data: ad }));
      }
    }

    return (
    <div className="flex flex-col">
      {/* Hero Search Section */}
      <section className="bg-emerald-900 text-white pt-16 pb-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-emerald-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-300 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight"
          >
            Find what you need in <span className="text-emerald-400">Rwanda.</span>
          </motion.h1>
          
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-2xl md:rounded-full border border-white/20 shadow-2xl">
            <div className="flex-grow flex items-center px-6 gap-3">
              <Search className="text-emerald-300" size={20} />
              <input 
                type="text" 
                placeholder="Search for restaurants, shops, services..." 
                className="bg-transparent border-none focus:ring-0 text-white placeholder:text-emerald-200/50 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl md:rounded-full font-bold shadow-lg transition-all active:scale-95">
              SEARCH
            </button>
          </div>
        </div>
      </section>

      {/* Filters & Results Container */}
      <section className="max-w-7xl mx-auto w-full px-4 -mt-16 pb-20 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-72 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-stone-100">
              <div className="flex items-center gap-2 font-bold text-stone-900 mb-6">
                <Filter size={18} className="text-emerald-600" />
                <span>Filters</span>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs uppercase font-bold text-stone-400 tracking-widest block mb-3">Select District</label>
                  <select 
                    className="w-full bg-stone-50 border-stone-200 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500 px-4 py-3"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  >
                    {CITIES.map(city => (
                      <option key={city.name} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs uppercase font-bold text-stone-400 tracking-widest block mb-3">Categories</label>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setSelectedCategory(null)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${!selectedCategory ? 'bg-emerald-600 text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                    >
                      All
                    </button>
                    {CATEGORIES.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedCategory === cat ? 'bg-emerald-600 text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Promo */}
            <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-xl">
              <h4 className="font-bold mb-2">Want more views?</h4>
              <p className="text-xs text-emerald-100 mb-4 opacity-80 leading-relaxed">Featured businesses get 10x more visibility. Starting at 15,000 RWF.</p>
              <Link to="/pricing" className="text-xs font-black uppercase tracking-widest hover:underline">Learn More ➔</Link>
            </div>
          </aside>

          {/* Results Main Area */}
          <div className="flex-grow flex flex-col gap-6">
            {/* Trust Banner */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg">
                <CheckCircle size={24} />
              </div>
              <div>
                <h4 className="font-black text-emerald-900 text-sm uppercase tracking-wider mb-1">Choose Trusted Partners</h4>
                <p className="text-xs text-emerald-700 leading-relaxed font-medium">Verified businesses on Ndangira are manually vetted for quality and reliability. We strongly recommend booking with Certified partners for the best experience.</p>
              </div>
              <Link to="/pricing" className="whitespace-nowrap bg-emerald-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-md">
                Get Certified
              </Link>
            </div>

            {/* View Switcher */}
            <div className="flex items-center justify-between bg-white p-2 rounded-2xl shadow-lg border border-stone-100">
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'grid' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-50'}`}
                >
                  <Grid size={16} />
                  <span>Grid</span>
                </button>
                <button 
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'map' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-50'}`}
                >
                  <MapIcon size={16} />
                  <span>Map</span>
                </button>
              </div>
              <div className="px-4 text-xs font-medium text-stone-400">
                Showing {filteredBusinesses.length} businesses in {selectedCity} District
              </div>
            </div>

            <div className="min-h-[600px]">
              <AnimatePresence mode="wait">
                {viewMode === 'grid' ? (
                  <motion.div 
                    key="grid"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  >
                    {loading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border border-stone-100 shadow-sm" />
                      ))
                    ) : interspersedItems.length > 0 ? (
                      interspersedItems.map((item, idx) => item.type === 'business' ? (
                        <Link 
                          to={`/business/${item.data.id}`} 
                          key={item.data.id}
                          onClick={() => {
                            // 5% chance to trigger a popup when viewing a business
                            if (Math.random() < 0.05) {
                              window.dispatchEvent(new CustomEvent('palace-ad-trigger', { detail: { type: 'popup' } }));
                            }
                          }}
                          className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-stone-100 transition-all group flex flex-col"
                        >
                          <div className="relative h-48 bg-stone-200">
                            {item.data.photos?.[0] ? (
                              <img 
                                src={item.data.photos[0]} 
                                alt={item.data.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-400">
                                <Search size={32} />
                              </div>
                            )}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                              <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-emerald-800 shadow-sm w-fit">
                                {item.data.category}
                              </div>
                              {item.data.plan === 'featured' && (
                                <div className="bg-yellow-400 text-stone-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 w-fit">
                                  <Star size={10} fill="currentColor" />
                                  <span>Featured</span>
                                </div>
                              )}
                            </div>
                            {(item.data.verified || item.data.plan !== 'free') && (
                              <div className="absolute top-4 right-4 bg-emerald-600 text-white px-3 py-1 rounded-full shadow-lg border-2 border-white/50 flex items-center gap-1">
                                <Navigation size={10} className="rotate-45" />
                                <span className="text-[9px] font-black uppercase tracking-tighter">Verified</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="p-6 flex flex-col flex-grow">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-bold text-lg text-stone-900 group-hover:text-emerald-700 transition-colors line-clamp-1">{item.data.name}</h3>
                              <div className="flex items-center gap-1 text-yellow-500">
                                <Star size={14} fill="currentColor" />
                                <span className="text-xs font-bold">{item.data.rating || 'New'}</span>
                              </div>
                            </div>
                            {(item.data.verified || item.data.plan !== 'free') && (
                              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                                <CheckCircle size={10} /> Certified Trusted Business
                              </p>
                            )}
                            <p className="text-xs text-stone-500 mb-4 line-clamp-2 leading-relaxed">{item.data.description}</p>
                            
                            <div className="mt-auto pt-4 border-t border-stone-50 flex items-center justify-between">
                              <div className="flex items-center gap-1 text-stone-400">
                                <MapPin size={12} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{item.data.city}</span>
                              </div>
                              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest group-hover:underline underline-offset-4">View Profile</span>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <AdCard key={item.data.id} ad={item.data as PalaceAd} />
                      ))
                    ) : (
                      <div className="col-span-full flex flex-col items-center justify-center bg-white rounded-3xl p-20 text-center border border-dashed border-stone-300">
                        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-300 mb-6">
                          <Search size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-stone-900 mb-2">No businesses found</h3>
                        <p className="text-stone-500 text-sm max-w-xs">We couldn't find any businesses matching your search criteria in {selectedCity}.</p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="map"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full h-[700px] rounded-3xl overflow-hidden shadow-2xl"
                  >
                    <MapComponent 
                      center={mapCenter} 
                      zoom={mapZoom} 
                      businesses={filteredBusinesses} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-stone-900 rounded-[3.5rem] p-8 md:p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600 rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-10 -translate-x-1/2 translate-y-1/2" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                  Join Rwanda's biggest <span className="text-emerald-500">Business Community.</span>
                </h2>
                <p className="text-stone-400 text-lg leading-relaxed">
                  Sign up to leave reviews, save your favorite local spots, and get direct access to exclusive platform features. Whether you're a customer or an entrepreneur, Ndangira is your home.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/signup" className="bg-white text-stone-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-center hover:bg-stone-100 transition-all shadow-xl">
                    Create User Account
                  </Link>
                  <Link to="/register" className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-center hover:bg-emerald-700 transition-all shadow-xl">
                    Register My Business
                  </Link>
                </div>
              </div>
              <div className="hidden lg:grid grid-cols-2 gap-4">
                {[
                  { label: 'Trusted Reviews', text: 'Share your experience with thousands of users.', icon: Star },
                  { label: 'GPS Discovery', text: 'Find exact building pins across all 30 districts.', icon: MapPin },
                  { label: 'Direct Contact', text: 'Connect with owners via WhatsApp or MoMo.', icon: ExternalLink },
                  { label: 'Business Growth', text: 'List your own services and start advertising.', icon: TrendingUp },
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-3xl">
                    <item.icon className="text-emerald-500 mb-4" size={24} />
                    <h4 className="text-white font-bold mb-1">{item.label}</h4>
                    <p className="text-stone-400 text-[10px] uppercase font-bold tracking-widest">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker Row */}
      <div className="bg-stone-900 py-6 border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-8 overflow-hidden whitespace-nowrap">
          <span className="text-stone-500 text-xs font-black uppercase tracking-widest">Trending Districts:</span>
          {CITIES.slice(0, 10).map(city => (
            <button key={city.name} onClick={() => setSelectedCity(city.name)} className="text-stone-300 text-sm font-medium hover:text-emerald-400 transition-colors">#{city.name}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
