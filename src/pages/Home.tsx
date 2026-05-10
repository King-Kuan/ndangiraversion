import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { BusinessListing, PalaceAd } from '../types';
import { CITIES, CATEGORIES } from '../constants';
import MapComponent from '../components/MapComponent';
import { AdCard } from '../components/AdComponents';
import { Search, Map as MapIcon, Grid, Filter, MapPin, Star, Navigation, ExternalLink, CheckCircle, TrendingUp, Megaphone, Heart, ArrowUpDown, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useBookmarks } from '../hooks/useBookmarks';

export default function Home() {
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [ads, setAds] = useState<PalaceAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'rating' | 'popular' | 'newest'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { bookmarkedIds, toggleBookmark } = useBookmarks();
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
      setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PalaceAd)));
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
      
      // Filter by Price if selected
      let processedResults = results;
      if (selectedPrice) {
        processedResults = processedResults.filter(b => {
          const price = b.priceRange || '1';
          return price === selectedPrice;
        });
      }

      // Sort logic - Global Hierarchy: 1. Verified, 2. Featured, 3. Standard/Free
      processedResults = processedResults.sort((a, b) => {
        // High-level hierarchy
        if (a.verified !== b.verified) return a.verified ? -1 : 1;
        
        const planOrder = { featured: 0, standard: 1, free: 2 };
        if (a.plan !== b.plan) return planOrder[a.plan] - planOrder[b.plan];

        // Secondary sorting based on user preference
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'popular') return (b.views || 0) - (a.views || 0);
        if (sortBy === 'newest') return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        
        return 0;
      });

      setBusinesses(processedResults);
      
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
  }, [selectedCity, selectedCategory, selectedPrice, sortBy]);

  const filteredBusinesses = businesses.filter(b => {
    const s = searchQuery.toLowerCase().trim();
    if (!s) return true;
    
    const name = b.name.toLowerCase();
    const desc = b.description.toLowerCase();
    const cat = b.category.toLowerCase();
    const city = b.city.toLowerCase();

    // Exact matches or inclusions
    if (name.includes(s) || desc.includes(s) || cat.includes(s) || city.includes(s)) return true;

    // Fuzzy matching for typos/shortened words (if query is at least 3 chars)
    if (s.length >= 3) {
      const parts = s.split(/\s+/);
      return parts.every(part => 
        name.includes(part) || 
        cat.includes(part) || 
        city.includes(part) ||
        // Check if first 3-4 chars match
        (part.length >= 3 && name.startsWith(part.substring(0, 3)))
      );
    }

    return false;
  });

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
      <Helmet>
        <title>Ndangira - Discover Verified Businesses in Rwanda</title>
        <meta name="description" content="Kigali, Rubavu, Musanze - Browse verified businesses, leave reviews, and find exactly what you need across all 30 districts of Rwanda." />
        <meta name="keywords" content="Rwanda business directory, Kigali shops, Rubavu hotels, Rwanda services, Ndangira verified, trusted business Rwanda, Musanze restaurants" />
        <meta property="og:title" content="Ndangira - Rwanda's Trusted Business Directory" />
        <meta property="og:image" content="/og-image.png" />
      </Helmet>

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
            <div className="flex-grow flex items-center px-6 gap-3 py-2 md:py-0">
              <Search className="text-emerald-300 shrink-0" size={20} />
              <input 
                type="text" 
                placeholder="What are you looking for?" 
                className="bg-transparent border-none focus:ring-0 text-white placeholder:text-emerald-200/50 w-full text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-xl md:rounded-full font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 text-xs">
              Search Now
            </button>
          </div>

          {/* Quick Filter Labels */}
          <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300/60 w-full mb-2">Try:</span>
            {CATEGORIES.slice(0, 5).map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold text-white transition-all active:scale-95"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Mobile Filter Button */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]">
        <button 
          onClick={() => setShowMobileFilters(true)}
          className="bg-emerald-600 text-white flex items-center gap-3 px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs shadow-[0_10px_30px_rgba(5,150,105,0.4)] border-2 border-emerald-400 active:scale-90 transition-all"
        >
          <Filter size={16} />
          <span>Refine Search</span>
          {(selectedCity || selectedCategory || selectedPrice) && (
            <span className="w-5 h-5 bg-white text-emerald-600 rounded-full flex items-center justify-center text-[10px]">!</span>
          )}
        </button>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[70] lg:hidden"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[3rem] p-8 z-[80] lg:hidden max-h-[85vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-stone-200 rounded-full mx-auto mb-8" />
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-stone-900 uppercase italic">Filter Results</h3>
                <button 
                  onClick={() => {
                    setSelectedCity('');
                    setSelectedCategory(null);
                    setSelectedPrice(null);
                  }}
                  className="text-[10px] font-black text-emerald-600 uppercase tracking-widest"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4 block">District</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CITIES.slice(0, 8).map(city => (
                      <button 
                        key={city.name}
                        onClick={() => setSelectedCity(selectedCity === city.name ? '' : city.name)}
                        className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border ${selectedCity === city.name ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-stone-50 text-stone-600 border-stone-100'}`}
                      >
                        {city.name}
                      </button>
                    ))}
                    <select 
                      className="col-span-full w-full bg-stone-50 border-stone-100 rounded-xl text-xs font-bold px-4 py-3"
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                    >
                      <option value="">More Districts...</option>
                      {CITIES.slice(8).map(city => (
                        <option key={city.name} value={city.name}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedCategory === cat ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-stone-50 text-stone-600 border-stone-100'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pb-12">
                  <button 
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full bg-stone-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                  >
                    Show {filteredBusinesses.length} Results
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Filters & Results Container */}
      <section className="max-w-7xl mx-auto w-full px-4 -mt-16 pb-20 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters (Hidden on Mobile) */}
          <aside className="hidden lg:flex lg:w-72 flex-col gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-stone-100 sticky top-24">
              <div className="flex items-center gap-2 font-bold text-stone-900 mb-6">
                <Filter size={18} className="text-emerald-600" />
                <span>Filters</span>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs uppercase font-bold text-stone-400 tracking-widest">Select District</label>
                    {selectedCity && (
                      <button onClick={() => setSelectedCity('')} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Clear</button>
                    )}
                  </div>
                  <select 
                    className="w-full bg-stone-50 border-stone-200 rounded-xl text-sm font-bold focus:ring-emerald-500 focus:border-emerald-500 px-4 py-3"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  >
                    <option value="">All Rwanda Districts</option>
                    {CITIES.map(city => (
                      <option key={city.name} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs uppercase font-bold text-stone-400 tracking-widest">Categories</label>
                    {selectedCategory && (
                      <button onClick={() => setSelectedCategory(null)} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Clear</button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${selectedCategory === cat ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-stone-100 text-stone-600 border-stone-100 hover:bg-stone-200'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase font-bold text-stone-400 tracking-widest block mb-3">Price Range</label>
                  <div className="flex gap-2">
                    {['1', '2', '3'].map(p => (
                      <button 
                        key={p}
                        onClick={() => setSelectedPrice(selectedPrice === p ? null : p)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${selectedPrice === p ? 'bg-emerald-600 text-white shadow-lg' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                      >
                        {Array(parseInt(p)).fill('$').join('')}
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
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-emerald-600/5 group-hover:bg-emerald-600/10 transition-colors" />
              <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-[0_0_20px_rgba(5,150,105,0.4)] relative z-10">
                <CheckCircle size={28} />
              </div>
              <div className="relative z-10">
                <h4 className="font-black text-white text-sm uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                  The Trust Barrier
                  <span className="h-1 w-8 bg-emerald-500 rounded-full" />
                </h4>
                <p className="text-xs text-stone-400 leading-relaxed font-medium max-w-xl">
                  Ndangira <span className="text-emerald-400 font-bold">Verified</span> badges are the ultimate local pillars of trust. Businesses must maintain a strict record of <span className="text-white">6+ months</span> on platform, <span className="text-white">2,000+ views</span>, and <span className="text-white">350+ authentic reviews</span> to be eligible.
                </p>
              </div>
              <Link to="/register" className="relative z-10 whitespace-nowrap bg-white text-stone-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-100 transition-all active:scale-95 shadow-lg ml-auto">
                Start My Journey
              </Link>
            </div>

            {/* View Switcher & Sorting */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-white p-2 md:p-3 rounded-[1.5rem] md:rounded-[2rem] shadow-lg border border-stone-100 gap-4">
              <div className="flex items-center gap-1 w-full md:w-auto">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`flex-grow md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'grid' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-50'}`}
                >
                  <Grid size={16} />
                  <span>Grid</span>
                </button>
                <button 
                  onClick={() => setViewMode('map')}
                  className={`flex-grow md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'map' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-50'}`}
                >
                  <MapIcon size={16} />
                  <span>Map</span>
                </button>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <div className="flex items-center gap-2 bg-stone-50 px-4 py-2 rounded-xl border border-stone-100">
                  <ArrowUpDown size={14} className="text-stone-400" />
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent border-none text-xs font-bold text-stone-600 focus:ring-0 cursor-pointer uppercase tracking-wider"
                  >
                    <option value="featured">Featured First</option>
                    <option value="rating">Top Rated</option>
                    <option value="popular">Most Popular</option>
                    <option value="newest">Recently Added</option>
                  </select>
                </div>
                <div className="hidden xl:block px-4 text-[10px] font-black uppercase tracking-widest text-stone-400">
                  {filteredBusinesses.length} results
                </div>
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
                          key={`biz-${item.data.id}-${idx}`}
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
                            {item.data.verified ? (
                              <div className="absolute top-4 right-4 bg-emerald-600 text-white px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(5,150,105,0.5)] border-2 border-white/20 flex items-center gap-1.5">
                                <CheckCircle size={12} />
                                <span className="text-[10px] font-black uppercase tracking-wider">Verified Trust</span>
                              </div>
                            ) : item.data.plan !== 'free' && (
                              <div className="absolute top-4 right-4 bg-stone-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full shadow-lg border border-white/10 flex items-center gap-1">
                                <Star size={10} fill="currentColor" className="text-yellow-400" />
                                <span className="text-[9px] font-black uppercase tracking-tighter">Growth Partner</span>
                              </div>
                            )}
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleBookmark(item.data.id);
                              }}
                              className={`absolute bottom-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all shadow-lg border ${
                                bookmarkedIds.includes(item.data.id) 
                                  ? 'bg-rose-500 text-white border-rose-400 scale-110' 
                                  : 'bg-white/80 text-stone-400 border-white/50 hover:text-rose-500 hover:bg-white'
                              }`}
                            >
                              <Heart size={16} fill={bookmarkedIds.includes(item.data.id) ? "currentColor" : "none"} />
                            </button>
                          </div>
                          
                          <div className="p-6 flex flex-col flex-grow">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-bold text-lg text-stone-900 group-hover:text-emerald-700 transition-colors line-clamp-1">{item.data.name}</h3>
                              <div className="flex items-center gap-1 text-yellow-500">
                                <Star size={14} fill="currentColor" />
                                <span className="text-xs font-bold">{item.data.rating || 'New'}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mb-2">
                              {(item.data.verified || item.data.plan !== 'free') && (
                                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                                  <CheckCircle size={10} /> Certified Trusted
                                </p>
                              )}
                              {item.data.priceRange && (
                                <span className="text-[10px] font-bold text-stone-400 tracking-widest">
                                  {Array(parseInt(item.data.priceRange)).fill('$').join('')}
                                </span>
                              )}
                            </div>
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
                        <AdCard key={`ad-${item.data.id}-${idx}`} ad={item.data as PalaceAd} />
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
