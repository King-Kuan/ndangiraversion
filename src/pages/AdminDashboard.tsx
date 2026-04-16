import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, updateDoc, doc, where, limit } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { BusinessListing, PalaceAd } from '../types';
import { 
  Building2, 
  Users, 
  BarChart3, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  FileText,
  Search,
  Check,
  X
} from 'lucide-react';

export default function AdminDashboard() {
  const [user, loadingAuth] = useAuthState(auth);
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingBusinesses, setPendingBusinesses] = useState<BusinessListing[]>([]);
  const [pendingAds, setPendingAds] = useState<PalaceAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalBusinesses: 0, totalAds: 0 });

  useEffect(() => {
    if (!loadingAuth && !user) navigate('/login');
    
    const checkAdmin = async () => {
      if (!user) return;
      try {
        const userDoc = await getDocs(query(collection(db, 'users'), where('email', '==', user.email)));
        if (!userDoc.empty) {
          const role = userDoc.docs[0].data().role;
          if (role === 'admin' || user.email === "fridomiamovement@gmail.com") {
            setIsAdmin(true);
            fetchAdminData();
          } else {
            navigate('/dashboard');
          }
        }
      } catch (error) {
        console.error('Admin check failed', error);
        navigate('/');
      }
    };

    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const busQuery = query(collection(db, 'businesses'), where('status', '==', 'pending'), limit(20));
        const busSnapshot = await getDocs(busQuery);
        setPendingBusinesses(busSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessListing)));

        const adsQuery = query(collection(db, 'palaceads'), where('status', '==', 'pending'), limit(20));
        const adsSnapshot = await getDocs(adsQuery);
        setPendingAds(adsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PalaceAd)));

        // Stats (Simple placeholder for now)
        setStats({ totalUsers: 0, totalBusinesses: 0, totalAds: 0 });
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'admin/data');
      } finally {
        setLoading(false);
      }
    };

    if (user) checkAdmin();
  }, [user, loadingAuth, navigate]);

  const handleAction = async (collectionName: string, id: string, status: 'active' | 'rejected' | 'expired') => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, { status });
      
      if (collectionName === 'businesses') {
        setPendingBusinesses(prev => prev.filter(b => b.id !== id));
      } else {
        setPendingAds(prev => prev.filter(a => a.id !== id));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${id}`);
    }
  };

  if (loadingAuth || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-stone-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="bg-stone-900 text-white py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-3xl font-black tracking-tight">System Administration</h1>
          </div>
          <p className="text-stone-400 font-medium">Moderate business listings, approve ad campaigns, and manage users.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Business Moderation */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Building2 size={20} className="text-stone-400" />
                Pending Listings
              </h2>
              <span className="bg-stone-200 text-stone-700 px-3 py-1 rounded-full text-xs font-bold tracking-widest">{pendingBusinesses.length}</span>
            </div>

            {pendingBusinesses.length > 0 ? (
              <div className="space-y-4">
                {pendingBusinesses.map(business => (
                  <div key={business.id} className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-stone-100 rounded-2xl shrink-0 overflow-hidden">
                        {business.photos?.[0] && <img src={business.photos[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold text-stone-900">{business.name}</h4>
                        <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">{business.city} • {business.category}</p>
                        <p className="text-xs text-stone-500 mt-2 line-clamp-2">{business.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAction('businesses', business.id, 'active')}
                        className="flex-grow bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                      >
                        <Check size={16} /> Approve
                      </button>
                      <button 
                        onClick={() => handleAction('businesses', business.id, 'rejected')}
                        className="flex-grow bg-stone-100 hover:bg-stone-200 text-stone-600 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                      >
                        <X size={16} /> Reject
                      </button>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${business.lat},${business.lng}`}
                        target="_blank"
                        className="p-3 bg-stone-50 text-stone-400 rounded-xl hover:text-stone-900"
                      >
                        <Search size={16} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-stone-200 rounded-3xl p-12 text-center">
                <p className="text-stone-400 text-sm italic">No pending business listings.</p>
              </div>
            )}
          </div>

          {/* Ad Moderation */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck size={20} className="text-stone-400" />
                Pending Ads
              </h2>
              <span className="bg-stone-200 text-stone-700 px-3 py-1 rounded-full text-xs font-bold tracking-widest">{pendingAds.length}</span>
            </div>

            {pendingAds.length > 0 ? (
              <div className="space-y-4">
                {pendingAds.map(ad => (
                  <div key={ad.id} className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-stone-100 rounded-2xl shrink-0">
                        {ad.image && <img src={ad.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold text-stone-900">{ad.title}</h4>
                        <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest">{ad.placement} • Campaign</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAction('palaceads', ad.id, 'active')}
                        className="flex-grow bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                      >
                        <Check size={16} /> Activate
                      </button>
                      <button 
                        onClick={() => handleAction('palaceads', ad.id, 'expired')}
                        className="flex-grow bg-stone-100 hover:bg-stone-200 text-stone-600 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                      >
                        <X size={16} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-stone-200 rounded-3xl p-12 text-center">
                <p className="text-stone-400 text-sm italic">No pending ad campaigns.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
