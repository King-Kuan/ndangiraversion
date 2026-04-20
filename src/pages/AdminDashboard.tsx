import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, updateDoc, doc, where, limit } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { BusinessListing, PalaceAd, UserProfile } from '../types';
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
  X,
  Phone,
  Mail,
  Star,
  ExternalLink,
  Navigation
} from 'lucide-react';

export default function AdminDashboard() {
  const [user, loadingAuth] = useAuthState(auth);
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [allBusinesses, setAllBusinesses] = useState<BusinessListing[]>([]);
  const [allAds, setAllAds] = useState<PalaceAd[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'listings' | 'ads' | 'users'>('listings');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'active' | 'rejected' | 'expired'>('all');

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
        // Fetch All Businesses
        const busSnapshot = await getDocs(collection(db, 'businesses'));
        setAllBusinesses(busSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessListing)));

        // Fetch All Ads
        const adsSnapshot = await getDocs(collection(db, 'palaceads'));
        setAllAds(adsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PalaceAd)));

        // Fetch Users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        setAllUsers(usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
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
        setAllBusinesses(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      } else {
        setAllAds(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${id}`);
    }
  };

  const handleApproveUpgrade = async (businessId: string, plan: string) => {
    try {
      const docRef = doc(db, 'businesses', businessId);
      // When approving upgrade, update plan and clear pendingPlanUpdate
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      await updateDoc(docRef, { 
        plan, 
        pendingPlanUpdate: null,
        expiryDate: thirtyDaysFromNow,
        verified: plan === 'featured' || plan === 'standard' // Auto-verify on paid plans
      });
      setAllBusinesses(prev => prev.map(b => b.id === businessId ? { ...b, plan: plan as any, pendingPlanUpdate: undefined, verified: true } : b));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `businesses/${businessId}/upgrade`);
    }
  };

  const filteredBusinesses = allBusinesses.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         b.ownerUid.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || filterStatus === 'expired' ? true : b.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredAds = allAds.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         ad.ownerUid.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' ? true : ad.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredUsers = allUsers.filter(u => {
    return u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           u.uid.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
                <h1 className="text-3xl font-black tracking-tight uppercase italic text-emerald-400">Palace Command</h1>
              </div>
              <p className="text-stone-400 font-medium">The Palace, Inc. Administration Portal</p>
            </div>
            
            <div className="hidden md:flex gap-4">
              <div className="bg-stone-800/50 p-4 rounded-2xl border border-stone-700">
                <p className="text-[10px] uppercase font-black text-stone-500 mb-1">Total Assets</p>
                <p className="text-xl font-bold">{allBusinesses.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-24">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('listings')}
            className={`px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'listings' ? 'bg-stone-900 text-white shadow-xl scale-105' : 'bg-white text-stone-400 hover:bg-stone-100'}`}
          >
            Business Inventory
          </button>
          <button 
            onClick={() => setActiveTab('ads')}
            className={`px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'ads' ? 'bg-stone-900 text-white shadow-xl scale-105' : 'bg-white text-stone-400 hover:bg-stone-100'}`}
          >
            Ad Center ({allAds.filter(a => a.status === 'pending').length})
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'users' ? 'bg-stone-900 text-white shadow-xl scale-105' : 'bg-white text-stone-400 hover:bg-stone-100'}`}
          >
            User Directory
          </button>
        </div>

        {activeTab === 'listings' ? (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-stone-100 flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-grow flex items-center gap-4 bg-stone-50 px-6 py-4 rounded-2xl w-full">
                <Search className="text-stone-300" size={20} />
                <input 
                  type="text" 
                  placeholder="Search by business name or user ID..."
                  className="bg-transparent border-none focus:ring-0 w-full text-stone-900"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                {['all', 'pending', 'active', 'rejected'].map((s) => (
                  <button 
                    key={s}
                    onClick={() => setFilterStatus(s as any)}
                    className={`flex-grow md:flex-initial px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-400'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBusinesses.map(business => (
                <div key={business.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-stone-100 flex flex-col">
                  {/* ... (business card content remains same) */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 bg-stone-100 rounded-2xl shrink-0 overflow-hidden">
                      {business.photos?.[0] && <img src={business.photos[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={business.name} />}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-stone-900 truncate">{business.name}</h4>
                      <div className="flex gap-2 mt-1">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                          business.plan === 'featured' ? 'bg-purple-100 text-purple-700' :
                          business.plan === 'standard' ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-500'
                        }`}>
                          {business.plan}
                        </span>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                          business.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                          business.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {business.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-stone-50 rounded-2xl p-4 space-y-3 mb-6 flex-grow">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-stone-400 font-bold uppercase tracking-widest">Expires</span>
                      <span className="text-stone-900 font-black">
                        {business.expiryDate?.seconds ? new Date(business.expiryDate.seconds * 1000).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-stone-400 font-bold uppercase tracking-widest">Region</span>
                      <span className="text-stone-900 font-black">{business.city}</span>
                    </div>
                    <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-[10px] text-stone-600">
                        <Phone size={10} className="text-stone-400" />
                        <span className="font-bold">{business.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-stone-600 truncate">
                        <Mail size={10} className="text-stone-400" />
                        <span className="font-bold">{business.email}</span>
                      </div>
                    </div>
                  </div>

                  {business.pendingPlanUpdate && (
                    <div className="mb-4 p-3 bg-purple-50 rounded-2xl border border-purple-100">
                      <p className="text-[10px] font-black uppercase text-purple-700 mb-2">Upgrade Requested: {business.pendingPlanUpdate}</p>
                      <button 
                        onClick={() => handleApproveUpgrade(business.id, business.pendingPlanUpdate!)}
                        className="w-full bg-purple-600 text-white text-[10px] font-black uppercase py-2 rounded-xl hover:bg-purple-700 transition-all"
                      >
                        Approve Upgrade
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {business.status === 'pending' && (
                      <button 
                        onClick={() => handleAction('businesses', business.id, 'active')}
                        className="flex-grow bg-emerald-600 hover:bg-emerald-700 text-white h-12 rounded-xl font-bold text-xs shadow-lg shadow-emerald-100"
                      >
                        Approve
                      </button>
                    )}
                    {business.status === 'active' && (
                      <button 
                        className="flex-grow bg-stone-100 text-stone-400 h-12 rounded-xl font-bold text-xs cursor-default"
                      >
                        Listing Live
                      </button>
                    )}
                    <button 
                      onClick={() => handleAction('businesses', business.id, 'rejected')}
                      className="p-3 bg-stone-50 text-stone-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredBusinesses.length === 0 && (
              <div className="bg-white border-2 border-dashed border-stone-200 rounded-[3rem] p-24 text-center">
                <Search size={48} className="mx-auto text-stone-200 mb-6" />
                <h3 className="text-xl font-bold text-stone-900 mb-2">No Matching Listings</h3>
                <p className="text-stone-400 text-sm">Try adjusting your filters or search query.</p>
              </div>
            )}
          </div>
        ) : activeTab === 'ads' ? (
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-stone-100 flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-grow flex items-center gap-4 bg-stone-50 px-6 py-4 rounded-2xl w-full">
                <Search className="text-stone-300" size={20} />
                <input 
                  type="text" 
                  placeholder="Search by campaign title or owner UID..."
                  className="bg-transparent border-none focus:ring-0 w-full text-stone-900"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                {['all', 'pending', 'active', 'expired'].map((s) => (
                  <button 
                    key={s}
                    onClick={() => setFilterStatus(s as any)}
                    className={`flex-grow md:flex-initial px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-purple-600 text-white' : 'bg-stone-100 text-stone-400'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredAds.map(ad => {
                const owner = allUsers.find(u => u.uid === ad.ownerUid);
                return (
                  <div key={ad.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-stone-100 flex flex-col">
                    <div className="flex gap-6 items-start mb-6">
                      <div className="w-24 h-24 bg-stone-100 rounded-3xl shrink-0 overflow-hidden">
                        {ad.image && <img src={ad.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={ad.title} />}
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold text-stone-900 mb-1">{ad.title}</h4>
                        <div className="flex flex-wrap gap-2 items-center mb-3">
                          <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full tracking-wider">{ad.placement}</span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            ad.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                            ad.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {ad.status}
                          </span>
                        </div>
                        {ad.description && <p className="text-[10px] text-stone-500 line-clamp-1 mb-2 italic">"{ad.description}"</p>}
                        {ad.targetUrl && (
                          <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 font-bold flex items-center gap-1 mb-4 hover:underline">
                            <Navigation size={10} /> {ad.targetUrl}
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="bg-stone-50 rounded-2xl p-4 mb-6 grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-black uppercase text-stone-400 mb-1">Submitter</p>
                          <p className="text-xs font-bold text-stone-900">{owner?.name || 'Unknown'}</p>
                          <p className="text-[10px] text-stone-500 font-medium">{owner?.email || ad.ownerUid}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-stone-400 mb-1">Business Context</p>
                          <p className="text-xs font-bold text-stone-900">{ad.businessName || 'Independent'}</p>
                          {ad.businessPhone && (
                            <p className="text-[10px] text-stone-500 font-medium flex items-center gap-1 mt-0.5">
                              <Phone size={10} /> {ad.businessPhone}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase text-stone-400 mb-1">Campaign Region</p>
                          <p className="text-xs font-bold text-stone-900">{ad.city}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-stone-400 mb-1">Expiry Date</p>
                          <p className="text-xs font-bold text-stone-900">
                            {ad.expiryDate?.seconds ? new Date(ad.expiryDate.seconds * 1000).toLocaleDateString() : '30 Days From Approval'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {ad.status === 'pending' && (
                        <button 
                          onClick={() => handleAction('palaceads', ad.id, 'active')}
                          className="flex-grow bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-emerald-100"
                        >
                          Approve & Launch
                        </button>
                      )}
                      {(ad.status === 'active' || ad.status === 'pending') && (
                        <button 
                          onClick={() => handleAction('palaceads', ad.id, 'expired')}
                          className="flex-grow bg-white border border-stone-200 text-stone-400 hover:text-red-600 py-3 rounded-xl font-bold text-xs transition-colors"
                        >
                          Stop Campaign
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-stone-100">
              <div className="flex items-center gap-4 bg-stone-50 px-6 py-4 rounded-2xl w-full">
                <Search className="text-stone-300" size={20} />
                <input 
                  type="text" 
                  placeholder="Search users by name, email or UID..."
                  className="bg-transparent border-none focus:ring-0 w-full text-stone-900"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-stone-50 border-b border-stone-100 text-[10px] font-black uppercase tracking-widest text-stone-400">
                  <tr>
                    <th className="px-8 py-4">User</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Member Since</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {filteredUsers.map(u => (
                    <tr key={u.uid} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-black">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-stone-900">{u.name}</p>
                            <p className="text-xs text-stone-500 font-medium">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-xs text-stone-400 font-medium">
                        {u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <a href={`mailto:${u.email}`} className="p-2 text-stone-400 hover:text-emerald-600 transition-colors inline-block">
                          <Mail size={18} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
