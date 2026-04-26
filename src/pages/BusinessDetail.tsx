import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, increment, limit } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { BusinessListing, Review, PalaceAd } from '../types';
import MapComponent from '../components/MapComponent';
import { AdCard } from '../components/AdComponents';
import { Star, MapPin, Phone, Mail, Globe, Navigation, CheckCircle, ChevronLeft, Image as ImageIcon, Send, MessageSquare, ExternalLink, TrendingUp, Eye, Share2, Check, Megaphone } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion, AnimatePresence } from 'framer-motion';

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<BusinessListing & { views?: number } | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<BusinessListing[]>([]);
  const [ads, setAds] = useState<PalaceAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);
  const [newReview, setNewReview] = useState({ content: '', rating: 5 });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  const fetchBusiness = async (isFirstLoad = false) => {
    if (!id) return;
    if (isFirstLoad) setLoading(true);
    try {
      const docRef = doc(db, 'businesses', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const businessData = { id: snap.id, ...snap.data() } as BusinessListing & { views?: number };
        setBusiness(businessData);
        
        // Increment views on first load
        if (isFirstLoad) {
          await updateDoc(docRef, {
            views: increment(1)
          }).catch(console.error);

          // Contextual ad trigger (Rare: 10% chance when viewing a business)
          if (Math.random() < 0.1) {
            const type = Math.random() < 0.8 ? 'popup' : 'redirect';
            window.dispatchEvent(new CustomEvent('palace-ad-trigger', { detail: { type } }));
          }
        }

        const reviewsSnapshot = await getDocs(query(collection(db, 'reviews'), where('businessId', '==', id)));
        setReviews(reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));

        // Fetch related businesses and ads using localized businessData
        const relatedQ = query(
          collection(db, 'businesses'),
          where('status', '==', 'active'),
          where('category', '==', businessData.category || 'Services'),
          limit(4)
        );
        const relatedSnap = await getDocs(relatedQ);
        setRelated(relatedSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as BusinessListing))
          .filter(b => b.id !== id)
        );

        const adsQ = query(
          collection(db, 'palaceads'),
          where('placement', '==', 'card'),
          where('status', '==', 'active'),
          where('isVerified', '==', true),
          limit(2)
        );
        const adsSnap = await getDocs(adsQ);
        setAds(adsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PalaceAd)));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `businesses/${id}`);
    } finally {
      if (isFirstLoad) setLoading(true); 
      // Note: we set loading false at end of useEffect if we desire, but here we can manage it
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusiness(true);
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !business) return;
    
    setSubmittingReview(true);
    try {
      const reviewData = {
        businessId: id,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Anonymous User',
        rating: newReview.rating,
        content: newReview.content,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'reviews'), reviewData);
      
      // Update business rating/count
      const docRef = doc(db, 'businesses', id);
      const newCount = (business.reviewCount || 0) + 1;
      const newRating = ((business.rating || 0) * (business.reviewCount || 0) + newReview.rating) / newCount;
      
      await updateDoc(docRef, {
        reviewCount: newCount,
        rating: Number(newRating.toFixed(1))
      });

      setNewReview({ content: '', rating: 5 });
      fetchBusiness(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reviews');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleGetDirections = async () => {
    if (!id) return;
    try {
      const docRef = doc(db, 'businesses', id);
      await updateDoc(docRef, {
        mapClicks: increment(1)
      });
    } catch (error) {
      console.error('Failed to increment map clicks', error);
    }
  };

  const handleShare = async () => {
    if (!business) return;
    
    const shareData = {
      title: business.name,
      text: `Check out ${business.name} on Ndangira!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  const visiblePhotos = business 
    ? (business.plan === 'free' ? business.photos.slice(0, 1) : business.photos.slice(0, 10))
    : [];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-stone-500 font-medium">Loading business details...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Business not found</h2>
        <Link to="/" className="text-emerald-600 font-bold hover:underline">Back to search</Link>
      </div>
    );
  }

  return (
    <>
    <div className="flex flex-col pb-20">
      {/* Background Header */}
      <div className="h-64 md:h-96 relative bg-stone-900">
        {visiblePhotos[0] ? (
          <img 
            src={visiblePhotos[0]} 
            alt={business.name} 
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={64} className="text-stone-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 -mt-32 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Info */}
          <div className="flex-grow space-y-8">
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-stone-100">
              <Link to="/" className="inline-flex items-center gap-2 text-stone-400 font-bold text-xs uppercase tracking-widest mb-8 hover:text-emerald-600 transition-colors">
                <ChevronLeft size={16} />
                <span>Back to Search</span>
              </Link>
              
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl md:text-5xl font-black text-stone-900 tracking-tight">{business.name}</h1>
                    {(business.verified || business.plan !== 'free') && (
                      <CheckCircle size={28} className="text-emerald-600 fill-emerald-50" />
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 bg-yellow-400 text-stone-900 px-3 py-1 rounded-full text-xs font-black shadow-sm">
                      <Star size={14} fill="currentColor" />
                      <span>{business.rating || 'New'}</span>
                    </div>
                    <span className="text-stone-400 text-sm font-medium">{reviews.length} Customer Reviews</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-200" />
                    <span className="text-emerald-600 text-sm font-bold uppercase tracking-wider">{business.category}</span>
                  </div>
                </div>

                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${business.lat},${business.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleGetDirections}
                  className="flex items-center gap-3 bg-stone-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-xl active:scale-95 text-sm md:text-base self-start"
                >
                  <Navigation size={20} className="rotate-45" />
                  <span>Get Directions</span>
                </a>
              </div>

              <div className="prose prose-stone max-w-none">
                <p className="text-stone-600 text-lg leading-relaxed whitespace-pre-wrap">{business.description}</p>
              </div>

              {/* Photos Gallery */}
              {visiblePhotos.length > 1 && (
                <div className="mt-12 space-y-4">
                  <h3 className="font-bold text-lg tracking-tight">Gallery</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {visiblePhotos.slice(1).map((photo, i) => (
                      <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-stone-100">
                        <img 
                          src={photo} 
                          alt={`${business.name} ${i + 1}`} 
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-zoom-in"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {business.plan === 'free' && business.photos.length > 1 && (
                <div className="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-2">Upgrade to see all photos</p>
                  <p className="text-xs text-emerald-600">Standard and Featured plans allow displaying up to 10 photos of your location and services.</p>
                </div>
              )}
            </div>

            {/* Map & Location */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100 overflow-hidden">
              <h3 className="font-bold text-xl mb-6">Location</h3>
              <div className="h-80 rounded-3xl overflow-hidden mb-6 border border-stone-100">
                <MapComponent 
                  center={[business.lat, business.lng]} 
                  zoom={15} 
                  businesses={[business]} 
                />
              </div>
              <div className="flex items-center gap-3 text-stone-500">
                <MapPin size={20} className="text-emerald-600 shrink-0" />
                <span className="text-sm font-medium">{business.address}, {business.city}</span>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-stone-100">
              <div className="flex items-center justify-between mb-10">
                <h3 className="font-bold text-2xl tracking-tight flex items-center gap-3">
                  <MessageSquare className="text-emerald-600" />
                  Customer Reviews
                </h3>
              </div>

              {user ? (
                <form onSubmit={handleSubmitReview} className="mb-12 bg-stone-50 p-6 md:p-8 rounded-3xl border border-stone-100">
                  <h4 className="font-bold text-stone-900 mb-6">Write a review</h4>
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Rating</label>
                      <div className="flex gap-2">
                        {[1,2,3,4,5].map(star => (
                          <button 
                            key={star}
                            type="button"
                            onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                            className={`p-2 rounded-xl transition-all ${newReview.rating >= star ? 'text-yellow-500 bg-yellow-50' : 'text-stone-300 hover:text-stone-400'}`}
                          >
                            <Star size={24} fill={newReview.rating >= star ? "currentColor" : "none"} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Your Comment</label>
                      <textarea 
                        className="w-full bg-white border-stone-100 rounded-2xl p-4 text-sm focus:ring-emerald-500 focus:border-emerald-500 min-h-[120px]"
                        placeholder="Share your experience with this business..."
                        required
                        value={newReview.content}
                        onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={submittingReview}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                      {submittingReview ? 'Posting...' : 'Post Review'}
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mb-12 p-8 bg-stone-50 border border-dashed border-stone-200 rounded-3xl text-center">
                  <p className="text-stone-500 text-sm mb-4">Please log in to share your experience.</p>
                  <Link to="/login" className="inline-block bg-stone-900 text-white px-6 py-2 rounded-xl font-bold text-sm">Log In</Link>
                </div>
              )}

              <div className="space-y-8">
                {reviews.length > 0 ? (
                  reviews.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).map((review) => (
                    <div key={review.id} className="border-b border-stone-100 pb-8 last:border-none">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-black text-sm uppercase">
                            {review.userName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-stone-900 block">{review.userName}</span>
                            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                              {review.createdAt?.toDate ? new Date(review.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star size={14} fill="currentColor" />
                          <span className="text-xs font-bold">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-stone-600 text-sm leading-relaxed">{review.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-stone-400 italic text-sm">No reviews yet. Be the first to review!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Panel */}
          <aside className="lg:w-96 shrink-0 h-fit lg:sticky lg:top-24">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-stone-100 space-y-8">
              <h4 className="font-bold text-xl tracking-tight">Contact Details</h4>
              
              <div className="space-y-6">
                {business.phone && (
                  <a href={`tel:${business.phone}`} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                      <Phone size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 block">Phone</span>
                      <span className="font-bold text-stone-900">{business.phone}</span>
                    </div>
                  </a>
                )}

                {business.email && (
                  <a href={`mailto:${business.email}`} className="flex items-center gap-4 group text-wrap break-all">
                    <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                      <Mail size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 block">Email</span>
                      <span className="font-bold text-stone-900">{business.email}</span>
                    </div>
                  </a>
                )}

                {business.website && (
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                      <Globe size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 block">Website</span>
                      <span className="font-bold text-stone-900 flex items-center gap-1">
                        Visit Site <ExternalLink size={12} />
                      </span>
                    </div>
                  </a>
                )}
              </div>

              <div className="pt-8 border-t border-stone-50">
                <button 
                  onClick={handleShare}
                  className="w-full bg-emerald-100 text-emerald-700 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-200 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 size={16} />
                  Share this business
                </button>
              </div>
            </div>

            {/* Share Toast */}
            <AnimatePresence>
              {showShareToast && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[2000] bg-stone-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm"
                >
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check size={14} />
                  </div>
                  Link copied to clipboard!
                </motion.div>
              )}
            </AnimatePresence>

            {/* Premium Badge Promo */}
            {business.plan === 'featured' && (
              <div className="mt-8 bg-gradient-to-br from-yellow-400 to-orange-400 p-8 rounded-[2.5rem] text-stone-900 shadow-xl relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Navigation size={120} className="rotate-45" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Star size={18} fill="currentColor" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Featured Business</span>
                </div>
                <h4 className="font-black text-2xl leading-tight mb-2">Verified & Recommended</h4>
                <p className="text-xs font-medium opacity-80 leading-relaxed">This business has been manually verified by the Ndangira team for quality and authenticity.</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>

    {/* Related & Ads Feed */}
    <section className="bg-stone-50 py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-black text-stone-900 tracking-tight mb-2 uppercase">Suggested for You</h2>
            <p className="text-stone-500 font-medium text-sm italic">Discover more verified partners and exclusive offers in Rwanda</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-purple-600">
            <Megaphone size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Partner Feed Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {related.length > 0 ? (
            related.map(b => (
              <Link 
                to={`/business/${b.id}`} 
                key={b.id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-stone-100 transition-all group flex flex-col"
              >
                <div className="relative h-48 bg-stone-200">
                  {b.photos?.[0] ? (
                    <img 
                      src={b.photos[0]} 
                      alt={b.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      <ImageIcon size={32} />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-emerald-800 shadow-sm">
                    {b.category}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg text-stone-900 group-hover:text-emerald-700 transition-colors line-clamp-1">{b.name}</h3>
                  <p className="text-xs text-stone-500 mt-2 line-clamp-2 leading-relaxed">{b.description}</p>
                </div>
              </Link>
            ))
          ) : (
            // If no related, show more ads or placeholder
            ads.length === 0 && <div className="text-stone-300 italic text-sm">No other suggestions yet.</div>
          )}
          
          {/* Always show up to 2 ads if available */}
          {ads.map(ad => (
            <AdCard key={ad.id} ad={ad as PalaceAd} />
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
