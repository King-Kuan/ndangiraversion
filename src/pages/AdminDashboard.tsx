import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, updateDoc, doc, where, limit, addDoc, serverTimestamp } from 'firebase/firestore';
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
  const [activeTab, setActiveTab] = useState<'listings' | 'ads' | 'users' | 'messages'>('listings');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'active' | 'rejected' | 'expired'>('all');

  // Message Center States
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{success: number, total: number} | null>(null);

  const emailFooter = `
    <div style="margin-top: 40px; border-top: 1px solid #e7e5e4; padding-top: 20px; font-size: 11px; color: #78716c;">
      <p><strong>Ndangira - Rwanda Business Discovery</strong></p>
      <p><a href="${window.location.origin}" style="color: #059669; text-decoration: none; font-weight: bold;">Visit Ndangira Platform</a></p>
      <p>Address: Gisenyi, Rubavu, Rwanda</p>
      <p>Contact: management@ndangira.rw | +250 792 612 139</p>
      <p style="margin-top: 10px;">The Palace, Inc. - The Palace Tech House</p>
    </div>
  `;

  const presets = [
    {
      id: 'update',
      title: 'Platform Discovery',
      subject: 'Exploring Ndangira: What\'s New',
      html: (name: string) => `
        <div style="font-family: sans-serif; color: #1c1917;">
          <h1 style="color: #059669;">New Discoveries Await</h1>
          <p>Hello ${name},</p>
          <p>We've recently added several new high-quality business listings to Ndangira. From local artisans to tech services, discovery is just a click away.</p>
          <p>Our platform is growing every day, helping connect you with Rwanda's most vibrant services.</p>
          <p>Best regards,<br/>The Ndangira Team</p>
          ${emailFooter}
        </div>
      `
    },
    {
      id: 'spotlight',
      title: 'Featured Business Spotlight',
      subject: 'Featured Services on Ndangira',
      html: (name: string) => `
        <div style="font-family: sans-serif; color: #1c1917;">
          <h1 style="color: #8b5cf6;">Business Spotlight</h1>
          <p>Hello ${name},</p>
          <p>Check out our featured listings of the week! These businesses have been verified and highly rated by the community.</p>
          <p>Support local growth by discovering excellence in your category.</p>
          <p>Best regards,<br/>The Ndangira Team</p>
          ${emailFooter}
        </div>
      `
    },
    {
      id: 'promo',
      title: 'Weekend Promo',
      subject: 'Weekend Special Offers on Ndangira',
      html: (name: string) => `
        <div style="font-family: sans-serif; color: #1c1917;">
          <h1 style="color: #f59e0b;">Weekend Specials</h1>
          <p>Hello ${name},</p>
          <p>Don't miss out on exclusive weekend offers from businesses in Gisenyi and beyond. Check the platform now for limited-time deals!</p>
          <p>Best regards,<br/>The Ndangira Team</p>
          ${emailFooter}
        </div>
      `
    },
    {
      id: 'category',
      title: 'New Category Launch',
      subject: 'New Business Categories Now Available',
      html: (name: string) => `
        <div style="font-family: sans-serif; color: #1c1917;">
          <h1 style="color: #6366f1;">More Ways to Discover</h1>
          <p>Hello ${name},</p>
          <p>We've expanded our search categories! You can now browse even more specific service sectors to find exactly what you need.</p>
          <p>Best regards,<br/>The Ndangira Team</p>
          ${emailFooter}
        </div>
      `
    },
    {
      id: 'safety',
      title: 'Security & Safety Tips',
      subject: 'Safe Discovery on Ndangira',
      html: (name: string) => `
        <div style="font-family: sans-serif; color: #1c1917;">
          <h1 style="color: #ef4444;">Your Safety First</h1>
          <p>Hello ${name},</p>
          <p>When discovering new businesses, remember to check ratings and verified badges. Your safety and trust are our priorities.</p>
          <p>Best regards,<br/>The Ndangira Team</p>
          ${emailFooter}
        </div>
      `
    },
    {
      id: 'growth',
      title: 'Business Growth Resource',
      subject: 'Tips for Growing Your Local Business',
      html: (name: string) => `
        <div style="font-family: sans-serif; color: #1c1917;">
          <h1 style="color: #10b981;">Grow With Us</h1>
          <p>Hello ${name},</p>
          <p>Did you know that Featured listings on Ndangira see 3x more engagement? Update your listing today to reach more customers.</p>
          <p>Best regards,<br/>The Ndangira Team</p>
          ${emailFooter}
        </div>
      `
    },
    {
      id: 'community',
      title: 'Community Update',
      subject: 'Local Community News from Ndangira',
      html: (name: string) => `
        <div style="font-family: sans-serif; color: #1c1917;">
          <h1 style="color: #3b82f6;">Platform Community</h1>
          <p>Hello ${name},</p>
          <p>Join the conversation on our local discovery boards. Your feedback helps Rwandan businesses thrive.</p>
          <p>Best regards,<br/>The Ndangira Team</p>
          ${emailFooter}
        </div>
      `
    },
    {
      id: 'reviews',
      title: 'Review Reminder',
      subject: 'Your Opinion Matters!',
      html: (name: string) => `
        <div style="font-family: sans-serif; color: #1c1917;">
          <h1 style="color: #ec4899;">Share Your Voice</h1>
          <p>Hello ${name},</p>
          <p>Found a great service recently? Leave a review on Ndangira to help others find quality local businesses.</p>
          <p>Best regards,<br/>The Ndangira Team</p>
          ${emailFooter}
        </div>
      `
    },
    {
      id: 'benefits',
      title: 'Member Perks',
      subject: 'Exclusive Benefits for Ndangira Users',
      html: (name: string) => `
        <div style="font-family: sans-serif; color: #1c1917;">
          <h1 style="color: #8b5cf6;">Unlock Your Rewards</h1>
          <p>Hello ${name},</p>
          <p>As a valued member of Ndangira, you have access to exclusive platform features. Sign in to see what's reserved for you.</p>
          <p>Best regards,<br/>The Ndangira Team</p>
          ${emailFooter}
        </div>
      `
    },
    {
      id: 'custom_announcement',
      title: 'Custom Announcement',
      isCustom: true,
      subject: 'Ndangira: Special Announcement',
      html: (name: string, content: string) => `
        <div style="font-family: sans-serif; color: #1c1917;">
          <h1 style="color: #059669;">Special Announcement</h1>
          <p>Hello ${name},</p>
          <div style="line-height: 1.6; margin: 20px 0;">
            ${content ? content.replace(/\n/g, '<br/>') : '...'}
          </div>
          <p>Best regards,<br/>The Ndangira Team</p>
          ${emailFooter}
        </div>
      `
    },
    {
      id: 'custom_greeting',
      title: 'Custom Seasonal Greeting',
      isCustom: true,
      subject: 'Warm Wishes from Ndangira',
      html: (name: string, content: string) => `
        <div style="font-family: sans-serif; color: #1c1917;">
          <h1 style="color: #f59e0b;">Warm Wishes</h1>
          <p>Hello ${name},</p>
          <div style="line-height: 1.6; margin: 20px 0;">
            ${content ? content.replace(/\n/g, '<br/>') : '...'}
          </div>
          <p>Best regards,<br/>The Ndangira Team</p>
          ${emailFooter}
        </div>
      `
    },
    {
      id: 'custom_update',
      title: 'Custom Urgent Update',
      isCustom: true,
      subject: 'Ndangira: Important Update',
      html: (name: string, content: string) => `
        <div style="font-family: sans-serif; color: #1c1917;">
          <h1 style="color: #ef4444;">Important Update</h1>
          <p>Hello ${name},</p>
          <div style="line-height: 1.6; margin: 20px 0;">
            ${content ? content.replace(/\n/g, '<br/>') : '...'}
          </div>
          <p>Best regards,<br/>The Ndangira Team</p>
          ${emailFooter}
        </div>
      `
    }
  ];

  const handleBulkSend = async () => {
    if (!selectedTemplate || recipients.length === 0) return;
    setIsSending(true);
    let successCount = 0;
    const template = presets.find(p => p.id === selectedTemplate);
    if (!template) return;
    if (template.isCustom && !customMessage) {
      alert("Please provide the custom message body.");
      setIsSending(false);
      return;
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    try {
      for (const email of recipients) {
        // 1. Check daily limit (20 per day per type)
        const todayLogs = await getDocs(query(
          collection(db, 'email_logs'), 
          where('templateId', '==', selectedTemplate), 
          where('date', '==', todayDate)
        ));
        
        if (todayLogs.size >= 20) {
          alert(`Daily limit of 20 emails for ${template.title} reached.`);
          break;
        }

        // 2. Check if sent yesterday
        const yesterdayLogs = await getDocs(query(
          collection(db, 'email_logs'), 
          where('templateId', '==', selectedTemplate), 
          where('date', '==', yesterdayDate),
          where('email', '==', email)
        ));

        if (!yesterdayLogs.empty) {
          console.warn(`Skipping ${email}: Sent yesterday.`);
          continue;
        }

        const userProfile = allUsers.find(u => u.email === email);
        const userName = userProfile?.name || 'Valued User';

        // 3. Send via API
        const response = await fetch('/api/email/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            subject: template.subject,
            html: template.isCustom ? (template as any).html(userName, customMessage) : (template as any).html(userName)
          })
        });

        if (response.ok) {
          successCount++;
          // 4. Log to Firestore
          await addDoc(collection(db, 'email_logs'), {
            templateId: selectedTemplate,
            email,
            date: todayDate,
            sentAt: serverTimestamp()
          });
        }
      }
      setEmailStatus({ success: successCount, total: recipients.length });
    } catch (error) {
      console.error("Bulk send failed", error);
    } finally {
      setIsSending(false);
      setRecipients([]);
    }
  };

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
        const business = allBusinesses.find(b => b.id === id);
        if (status === 'active' && business && !business.approvalEmailSent) {
          // Send approval email
          try {
            await fetch('/api/email/approved', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: business.email,
                businessName: business.name,
                baseUrl: window.location.origin
              })
            });
            await updateDoc(docRef, { approvalEmailSent: true });
          } catch (e) {
            console.error("Failed to send approval email", e);
          }
        }
        setAllBusinesses(prev => prev.map(b => b.id === id ? { ...b, status, approvalEmailSent: status === 'active' ? true : b.approvalEmailSent } : b));
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
          <button 
            onClick={() => setActiveTab('messages')}
            className={`px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'messages' ? 'bg-stone-900 text-white shadow-xl scale-105' : 'bg-white text-stone-400 hover:bg-stone-100'}`}
          >
            Message Center
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
                    {business.status === 'active' && !business.approvalEmailSent && (
                      <button 
                        onClick={() => handleAction('businesses', business.id, 'active')}
                        className="flex-grow bg-emerald-50 text-emerald-600 h-12 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-colors"
                      >
                        Send Approval Email
                      </button>
                    )}
                    {business.status === 'active' && business.approvalEmailSent && (
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
                const ownerBusiness = allBusinesses.find(b => b.ownerUid === ad.ownerUid);
                const displayBusinessName = ad.businessName || ownerBusiness?.name || 'Independent';
                const displayBusinessPhone = ad.businessPhone || ownerBusiness?.phone || '';

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
                          <p className="text-xs font-bold text-stone-900">{displayBusinessName}</p>
                          {displayBusinessPhone && (
                            <p className="text-[10px] text-stone-500 font-medium flex items-center gap-1 mt-0.5">
                              <Phone size={10} /> {displayBusinessPhone}
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
        ) : activeTab === 'messages' ? (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-stone-100">
              <h2 className="text-2xl font-black text-stone-900 mb-6 flex items-center gap-3 italic uppercase italic text-emerald-600">
                <Mail size={28} /> Campaign Builder
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 max-h-[400px] overflow-y-auto pr-4">
                {presets.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => {
                      setSelectedTemplate(p.id);
                      if (!p.isCustom) setCustomMessage('');
                    }}
                    className={`text-left p-6 rounded-[2.5rem] border-2 transition-all ${selectedTemplate === p.id ? 'border-emerald-500 bg-emerald-50/30' : 'border-stone-100 bg-stone-50 hover:border-stone-200'}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-xl shrink-0 ${selectedTemplate === p.id ? 'bg-emerald-500 text-white' : 'bg-stone-200 text-stone-500'}`}>
                        <FileText size={20} />
                      </div>
                      <h4 className="font-bold text-stone-800 text-xs sm:text-sm">{p.title}</h4>
                    </div>
                    {p.isCustom && <span className="text-[8px] font-black uppercase text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full mb-3 inline-block">Flexible Body</span>}
                    <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mb-1 italic">Subject</p>
                    <p className="text-xs text-stone-600 font-medium mb-4 line-clamp-1">{p.subject}</p>
                    <div className="bg-white/50 p-4 rounded-xl text-[10px] text-stone-500 italic line-clamp-3 leading-relaxed">
                      {p.isCustom ? (p as any).html('Recipient', 'Your custom message goes here...') : (p as any).html('Recipient')}
                    </div>
                  </button>
                ))}
              </div>

              {selectedTemplate && presets.find(p => p.id === selectedTemplate)?.isCustom && (
                <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                  <label className="block text-[10px] font-black uppercase text-stone-400 mb-3 tracking-[0.2em] italic">Compose Message Body</label>
                  <textarea 
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Enter the main content of your email here..."
                    className="w-full bg-stone-50 border-2 border-stone-100 rounded-3xl p-6 min-h-[200px] text-stone-900 focus:border-emerald-500 focus:ring-0 transition-all font-medium text-sm leading-relaxed"
                  />
                  <p className="mt-4 text-[10px] text-stone-400 font-medium flex items-center gap-2">
                    <CheckCircle size={12} className="text-emerald-500" />
                    Placeholders like Name, Location, and Contacts are automatically injected.
                  </p>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-stone-400 mb-4 tracking-[0.2em] italic">Assign Recipients (Select from Directory)</label>
                  <div className="flex flex-wrap gap-2">
                    {allUsers.filter(u => u.email !== user?.email).slice(0, 50).map(u => (
                      <button 
                        key={u.uid}
                        onClick={() => setRecipients(prev => prev.includes(u.email) ? prev.filter(e => e !== u.email) : [...prev, u.email])}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${recipients.includes(u.email) ? 'bg-emerald-600 text-white shadow-lg' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
                      >
                        {u.name}
                      </button>
                    ))}
                  </div>
                </div>

                {recipients.length > 0 && (
                  <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <Users size={24} />
                      </div>
                      <div>
                        <p className="font-black text-stone-900 italic uppercase italic text-emerald-700">Target Audience</p>
                        <p className="text-xs font-bold text-stone-600">{recipients.length} Users Selected</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleBulkSend}
                      disabled={isSending || recipients.length === 0}
                      className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${isSending ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-stone-900 text-white hover:bg-black shadow-xl'}`}
                    >
                      {isSending ? 'Transmitting...' : `Launch Transmission (${recipients.length})`}
                    </button>
                  </div>
                )}

                {emailStatus && (
                  <div className="p-4 rounded-2xl bg-stone-900 text-white text-center">
                    <p className="text-xs font-bold">Execution Complete: {emailStatus.success} of {emailStatus.total} signals sent successfully.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-stone-100">
               <h3 className="text-sm font-black text-stone-900 mb-6 uppercase tracking-widest italic">Operational Thresholds</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-stone-50 p-4 rounded-2xl">
                    <p className="text-xs font-bold text-stone-800 mb-2">Throttling Rules</p>
                    <ul className="text-[10px] text-stone-500 space-y-1 font-medium list-disc ml-4">
                      <li>Max 20 transmissions per type per solar day.</li>
                      <li>Sequential day bypass: Cannot send the same type to the same recipient 2 days in a row.</li>
                    </ul>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-2xl flex items-center justify-center text-center">
                    <p className="text-[10px] text-stone-400 font-bold italic uppercase tracking-widest leading-relaxed">
                      System ensures platform integrity and prevents signal saturation.
                    </p>
                  </div>
               </div>
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
