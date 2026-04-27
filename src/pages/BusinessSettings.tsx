import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { BusinessListing } from '../types';
import { CITIES, CATEGORIES } from '../constants';
import GPSPicker from '../components/GPSPicker';
import ImageUpload from '../components/ImageUpload';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Globe, 
  ChevronLeft, 
  Check, 
  X, 
  Info, 
  Save, 
  Search,
  LayoutDashboard
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function BusinessSettings() {
  const { id } = useParams<{ id: string }>();
  const [user, loadingAuth] = useAuthState(auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState<BusinessListing | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    city: '',
    category: '',
    phone: '',
    email: '',
    website: '',
    bookingUrl: '',
    address: '',
    priceRange: '1',
    lat: -1.9,
    lng: 30.1,
    photos: [] as string[]
  });

  useEffect(() => {
    if (!loadingAuth && !user) navigate('/login');
    if (id) fetchBusiness();
  }, [id, user, loadingAuth]);

  const fetchBusiness = async () => {
    try {
      const docRef = doc(db, 'businesses', id!);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data() as BusinessListing;
        if (data.ownerUid !== user?.uid && user?.email !== 'fridomiamovement@gmail.com') {
          navigate('/dashboard');
          return;
        }
        setBusiness(data);
        setFormData({
          name: data.name,
          description: data.description,
          city: data.city,
          category: data.category,
          phone: data.phone,
          email: data.email,
          website: data.website || '',
          bookingUrl: data.bookingUrl || '',
          address: data.address,
          priceRange: data.priceRange || '1',
          lat: data.lat,
          lng: data.lng,
          photos: data.photos || []
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `businesses/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !business) return;
    setSaving(true);
    try {
      // Only set to pending if status was rejected or if name was changed significantly
      const newStatus = business.status === 'rejected' ? 'pending' : business.status;
      
      await updateDoc(doc(db, 'businesses', id), {
        ...formData,
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      setBusiness(prev => prev ? { ...prev, ...formData, status: newStatus } : null);
      alert('Changes saved successfully!');
      navigate('/dashboard');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `businesses/${id}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="w-10 h-10 bg-white border border-stone-100 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-900 shadow-sm transition-all">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tight">Listing Settings</h1>
            <p className="text-stone-500 font-medium">Update your business information and online presence.</p>
          </div>
        </div>
        <button 
          form="settings-form"
          disabled={saving}
          className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
          {!saving && <Save size={18} />}
        </button>
      </div>

      <form id="settings-form" onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-100 overflow-hidden">
          <div className="p-8 md:p-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Business Name</label>
                <div className="flex items-center bg-stone-50 border-stone-100 rounded-2xl px-6 py-4 gap-4 focus-within:ring-2 ring-emerald-500 transition-all">
                  <Building2 size={20} className="text-stone-300" />
                  <input 
                    type="text" 
                    required
                    className="bg-transparent border-none focus:ring-0 text-stone-900 w-full font-bold"
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">District</label>
                <select 
                  className="w-full bg-stone-50 border-stone-100 rounded-2xl px-6 py-4 text-stone-900 font-bold focus:ring-emerald-500"
                  value={formData.city}
                  onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
                >
                  {CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Category</label>
                <select 
                  className="w-full bg-stone-50 border-stone-100 rounded-2xl px-6 py-4 text-stone-900 font-bold focus:ring-emerald-500"
                  value={formData.category}
                  onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Price Range</label>
                <div className="flex gap-2">
                  {['1', '2', '3'].map((p) => (
                    <button 
                      key={p}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, priceRange: p }))}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${
                        formData.priceRange === p ? 'bg-emerald-600 text-white shadow-lg' : 'bg-stone-50 text-stone-400 border border-stone-100'
                      }`}
                    >
                      {Array(parseInt(p)).fill('$').join('')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Business Description</label>
                <textarea 
                  required
                  className="w-full bg-stone-50 border-stone-100 rounded-2xl px-6 py-4 text-stone-900 font-medium focus:ring-emerald-500 min-h-[160px]"
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Phone Number</label>
                <div className="flex items-center bg-stone-50 border-stone-100 rounded-2xl px-6 py-4 gap-4 focus-within:ring-2 ring-emerald-500 transition-all">
                  <Phone size={20} className="text-stone-300" />
                  <input 
                    type="tel" 
                    required
                    className="bg-transparent border-none focus:ring-0 text-stone-900 w-full font-bold"
                    value={formData.phone}
                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Target URL/Website (Optional)</label>
                <div className="flex items-center bg-stone-50 border-stone-100 rounded-2xl px-6 py-4 gap-4 focus-within:ring-2 ring-emerald-500 transition-all">
                  <Globe size={20} className="text-stone-300" />
                  <input 
                    type="url" 
                    className="bg-transparent border-none focus:ring-0 text-stone-900 w-full font-bold"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) => setFormData(p => ({ ...p, website: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Booking/Reservation URL (Optional)</label>
                <div className="flex items-center bg-stone-50 border-stone-100 rounded-2xl px-6 py-4 gap-4 focus-within:ring-2 ring-emerald-500 transition-all">
                  <LayoutDashboard size={20} className="text-stone-300" />
                  <input 
                    type="url" 
                    className="bg-transparent border-none focus:ring-0 text-stone-900 w-full font-bold"
                    placeholder="https://calendly.com/your-business"
                    value={formData.bookingUrl}
                    onChange={(e) => setFormData(p => ({ ...p, bookingUrl: e.target.value }))}
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-2 font-medium">Link to Calendly, your website booking page, or a form.</p>
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-xs font-black uppercase tracking-widest text-stone-400 block">Manage Photos</label>
              <ImageUpload 
                onUploadSuccess={(url) => setFormData(p => ({ ...p, photos: [...p.photos, url] }))}
                currentCount={formData.photos.length}
                maxFiles={10}
              />
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {formData.photos.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-stone-100 group">
                    <img src={url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button 
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, photos: p.photos.filter((_, idx) => idx !== i) }))}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-100 overflow-hidden">
          <div className="p-8 md:p-12 space-y-8">
            <h3 className="text-xl font-black text-stone-900 flex items-center gap-3">
              <MapPin className="text-emerald-600" />
              Precise Pin Location
            </h3>
            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex gap-4">
              <Info className="text-emerald-600 shrink-0" size={20} />
              <p className="text-xs font-bold text-emerald-800 leading-relaxed">
                Adjust the pin to the exact entrance of your building. This ensures Google Maps directions are precise for your customers.
              </p>
            </div>
            
            <GPSPicker 
              initialPos={[formData.lat, formData.lng]}
              onLocationChange={(lat, lng) => setFormData(p => ({ ...p, lat, lng }))}
            />

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Address Description</label>
              <input 
                type="text" 
                required
                className="w-full bg-stone-50 border-stone-100 rounded-2xl px-6 py-4 text-stone-900 font-bold focus:ring-emerald-500"
                placeholder="e.g. Building Name, Suite 201"
                value={formData.address}
                onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
