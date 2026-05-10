import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, increment, limit } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { BusinessListing, Review, PalaceAd } from '../types';
import MapComponent from '../components/MapComponent';
import { AdCard } from '../components/AdComponents';
import { Star, MapPin, Phone, Mail, Globe, Navigation, CheckCircle, ChevronLeft, Image as ImageIcon, Send, MessageSquare, ExternalLink, TrendingUp, Eye, Share2, Check, Megaphone, Heart } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useBookmarks } from '../hooks/useBookmarks';
import { logActivity, LogCategory } from '../services/logService';

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<BusinessListing & { views?: number } | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<BusinessListing[]>([]);
  const [ads, setAds] = useState<PalaceAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);
  const { bookmarkedIds, toggleBookmark } = useBookmarks();
  const [newReview, setNewReview] = useState({ content: '', rating: 5 });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  // Structured Data (JSON-LD) for SEO
  const jsonLd = business ? {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": business.name,
    "image": business.photos?.[0] || "",
    "@id": `https://ndangira.rw/business/${id}`,
    "url": `https://ndangira.rw/business/${id}`,
    "telephone": business.phone || "",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": business.address || "",
      "addressLocality": business.city || "",
      "addressCountry": "RW"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": business.lat,
      "longitude": business.lng
    },
    "aggregateRating": business.reviewCount ? {
      "@type": "AggregateRating",
      "ratingValue": business.rating || 0,
      "reviewCount": business.reviewCount
    } : undefined
  } : null;

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
          // Log business view
          logActivity({
            category: LogCategory.VIEW,
            action: 'VIEW_BUSINESS',
            details: { 
              businessId: id, 
              businessName: businessData.name,
              category: businessData.category
            }
          });

          const updates: any = { views: increment(1) };
          
          // Only increment verification views if plan is free
          if (businessData.plan === 'free') {
            updates.verificationViews = increment(1);
          }

          await updateDoc(docRef, updates).catch(console.error);

          // Contextual ad trigger (Rare: 10% chance when viewing a business)
          if (Math.random() < 0.1) {
            const type = Math.random() < 0.8 ? 'popup' : 'redirect';
            window.dispatchEvent(new CustomEvent('palace-ad-trigger', { detail: { type } }));
          }
        }

        const reviewsSnapshot = await getDocs(query(collection(db, 'reviews'), where('businessId', '==', id)));
        setReviews(reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));

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
          limit(5)
        );
        const adsSnap = await getDocs(adsQ);
        setAds(adsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PalaceAd)));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `businesses/${id}`);
    } finally {
      if (isFirstLoad) setLoading(false);
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

      // Log review action
      logActivity({
        category: LogCategory.REVIEW,
        action: 'POST_REVIEW',
        details: {
          businessId: id,
          businessName: business.name,
          rating: newReview.rating,
          contentPreview: newReview.content.slice(0, 50)
        }
      });
      
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
      logActivity({
        category: LogCategory.VIEW,
        action: 'GET_DIRECTIONS',
        details: { businessId: id, businessName: business?.name }
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

    logActivity({
      category: LogCategory.VIEW,
      action: 'SHARE_BUSINESS',
      details: { businessId: id, businessName: business.name }
    });

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  const handleStartChat = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!business) return;
    
    try {
      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', user.uid),
        where('businessId', '==', id)
      );
      const snap = await getDocs(q);
      
      let chatId;
      if (snap.empty) {
        const newChat = {
          participants: [user.uid, business.ownerUid],
          businessId: id,
          businessName: business.name,
          updatedAt: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, 'chats'), newChat);
        chatId = docRef.id;
      } else {
        chatId = snap.docs[0].id;
      }
      
      logActivity({
        category: LogCategory.VIEW,
        action: 'START_CHAT',
        details: { businessId: id, businessName: business.name, chatId }
      });

      window.dispatchEvent(new CustomEvent('open-chat', { detail: { chatId, businessName: business.name } }));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'chats');
    }
  };

  const visiblePhotos = business 
    ? (business.plan === 'free' ? business.photos.slice(0, 5) : business.photos.slice(0, 10))
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
    <Helmet>
      <title>{business.name} - {business.category} in {business.city} | Ndangira</title>
      <meta name="description" content={`${business.name} is a ${business.category} located in ${business.address}, ${business.city}. ${business.description.slice(0, 150)}...`} />
      <meta property="og:title" content={`${business.name} | Ndangira Rwanda`} />
      <meta property="og:description" content={`Discover ${business.name}, leading ${business.category} in ${business.city}. Verified trust on Ndangira.`} />
      <meta property="og:image" content={business.photos?.[0] || "/og-image.png"} />
      <meta property="og:url" content={window.location.href} />
      <meta property="og:type" content="business.business" />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>

    <div className="flex flex-col pb-20">
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
                    {business.verified && (
                      <div className="bg-emerald-600 text-white p-2 rounded-2xl shadow-[0_0_20px_rgba(5,150,105,0.4)]">
                        <CheckCircle size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 bg-yellow-400 text-stone-900 px-3 py-1 rounded-full text-xs font-black shadow-sm">
                      <Star size={14} fill="currentColor" />
                      <span>{business.rating || 'New'}</span>
                    </div>
                    <span className="text-stone-400 text-sm font-medium">{reviews.length} Customer Reviews</span>
                    <span className="text-emerald-600 text-sm font-bold uppercase tracking-wider">{business.category}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${business.lat},${business.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleGetDirections}
                    className="flex items-center gap-3 bg-stone-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-xl active:scale-95 text-sm"
                  >
                    <Navigation size={20} className="rotate-45" />
                    <span>Get Directions</span>
                  </a>

                  {business.ownerUid !== user?.uid && (
                    <button 
                      onClick={handleStartChat}
                      className="flex items-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl active:scale-95 text-sm"
                    >
                      <MessageSquare size={20} />
                      <span>Message</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="prose prose-stone max-w-none">
                <p className="text-stone-600 text-lg leading-relaxed whitespace-pre-wrap">{business.description}</p>
              </div>

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
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100 overflow-hidden">
              <h3 className="font-bold text-xl mb-6">Location</h3>
              <div className="h-80 rounded-3xl overflow-hidden mb-6 border border-stone-100">
                <MapComponent center={[business.lat, business.lng]} zoom={15} businesses={[business]} />
              </div>
              <div className="flex items-center gap-3 text-stone-500">
                <MapPin size={20} className="text-emerald-600 shrink-0" />
                <span className="text-sm font-medium">{business.address}, {business.city}</span>
              </div>
            </div>

            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-stone-100">
              <h3 className="font-bold text-2xl tracking-tight flex items-center gap-3 mb-10">
                <MessageSquare className="text-emerald-600" />
                Customer Reviews
              </h3>

              {user ? (
                <form id="review-form" onSubmit={handleSubmitReview} className="mb-12 bg-stone-50 p-6 md:p-8 rounded-3xl border border-stone-100">
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
                        placeholder="Share your experience..."
                        required
                        value={newReview.content}
                        onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                      />
                    </div>
                    <button type="submit" disabled={submittingReview} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg disabled:opacity-50 flex items-center gap-2">
                      {submittingReview ? 'Posting...' : 'Post Review'} <Send size={16} />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mb-12 p-8 bg-stone-50 border border-dashed border-stone-200 rounded-3xl text-center">
                  <p className="text-stone-500 text-sm mb-4">Log in to review.</p>
                  <Link to="/login" className="inline-block bg-stone-900 text-white px-6 py-2 rounded-xl font-bold text-sm">Log In</Link>
                </div>
              )}

              <div className="space-y-8">
                {reviews.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).map((review) => (
                  <div key={review.id} className="border-b border-stone-100 pb-8 last:border-none">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-black text-sm uppercase">{review.userName.charAt(0)}</div>
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
                ))}
              </div>
            </div>
          </div>

          <aside className="lg:w-96 shrink-0 h-fit lg:sticky lg:top-24">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-stone-100 space-y-8">
              <h4 className="font-bold text-xl tracking-tight">Contact</h4>
              <div className="space-y-6">
                {business.phone && (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm"><Phone size={20} /></div>
                    <div><span className="text-[10px] font-black uppercase tracking-widest text-stone-400 block">Phone</span><span className="font-bold text-stone-900">{business.phone}</span></div>
                  </div>
                )}
                {business.email && (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm"><Mail size={20} /></div>
                    <div><span className="text-[10px] font-black uppercase tracking-widest text-stone-400 block">Email</span><span className="font-bold text-stone-900 break-all">{business.email}</span></div>
                  </div>
                )}
              </div>
              <div className="pt-8 border-t border-stone-50">
                <button onClick={handleShare} className="w-full bg-emerald-100 text-emerald-700 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-200 transition-all flex items-center justify-center gap-2">
                  <Share2 size={16} /> Share this business
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
    </>
  );
}
