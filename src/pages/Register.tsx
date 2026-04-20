import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { setDoc, doc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { CITIES, CATEGORIES, PLANS } from '../constants';
import GPSPicker from '../components/GPSPicker';
import ImageUpload from '../components/ImageUpload';
import { Building2, Mail, Lock, User, Phone, Globe, Info, Map as MapIcon, ChevronRight, Check, X, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Register() {
  const [user, loadingAuth] = useAuthState(auth);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    businessDescription: '',
    businessCity: 'Kigali',
    businessCategory: 'Food',
    businessPhone: '',
    businessEmail: '',
    businessWebsite: '',
    businessAddress: '',
    plan: 'free',
    lat: -1.9441,
    lng: 30.0619,
    photos: [] as string[]
  });

  useEffect(() => {
    if (!loadingAuth && user) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || ''
      }));
      setStep(2); // Skip account creation if already logged in
    }
  }, [user, loadingAuth]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-center map if city changes
    if (field === 'businessCity') {
      const cityObj = CITIES.find(c => c.name === value);
      if (cityObj) {
        setFormData(prev => ({ ...prev, lat: cityObj.lat, lng: cityObj.lng }));
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      let currentUser = user;

      // 1. Create Auth User if not logged in
      if (!currentUser) {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        currentUser = userCredential.user;
        await updateProfile(currentUser, { displayName: formData.name });

        // 2. Create User Profile in Firestore
        await setDoc(doc(db, 'users', currentUser.uid), {
          name: formData.name,
          email: formData.email,
          role: 'user',
          createdAt: serverTimestamp()
        });
      }

      // 3. Create Business Listing
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const businessData = {
        name: formData.businessName,
        description: formData.businessDescription,
        city: formData.businessCity,
        category: formData.businessCategory,
        address: formData.businessAddress,
        phone: formData.businessPhone,
        email: formData.businessEmail || formData.email,
        website: formData.businessWebsite,
        lat: formData.lat,
        lng: formData.lng,
        status: 'pending',
        plan: formData.plan,
        photos: formData.photos,
        ownerUid: currentUser.uid,
        rating: 0,
        reviewCount: 0,
        mapClicks: 0,
        views: 0,
        verified: false,
        expiryDate: thirtyDaysFromNow,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'businesses'), businessData);

      // 4. Send Welcome Email via our API
      try {
        const emailRes = await fetch('/api/email/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, name: formData.name })
        });
        if (!emailRes.ok) {
          const emailData = await emailRes.json();
          console.warn("Email API response not OK:", emailData);
        }
      } catch (e) {
        console.error("Email notification failed", e);
      }

      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Registration failed. Please check your information.");
      // Optional: still log to our detailed handler for AI debugging
      try { handleFirestoreError(error, OperationType.CREATE, 'auth/businesses'); } catch(e) {}
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 md:py-24 px-4 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-100 rounded-full blur-3xl -z-10 opacity-30 translate-x-1/2 -translate-y-1/2" />
      
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Progress Header */}
        <div className="w-full flex items-center justify-between mb-16 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-stone-200 -z-10 translate-y-1/2" />
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex flex-col items-center gap-3">
              <div 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all shadow-xl ${
                  step >= s ? 'bg-emerald-600 text-white' : 'bg-white text-stone-300'
                }`}
              >
                {step > s ? <Check size={24} /> : s}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s ? 'text-emerald-700' : 'text-stone-300'}`}>
                {s === 1 ? 'Ownership' : s === 2 ? 'Details' : s === 3 ? 'Plan' : 'Location'}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleRegister} className="w-full bg-white rounded-[3rem] shadow-2xl p-8 md:p-16 border border-stone-100">
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-3xl font-black text-stone-900 mb-2">Create Account</h2>
              <p className="text-stone-400 text-sm mb-12">Set up your business owner profile to begin.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Your Full Name</label>
                  <div className="flex items-center bg-stone-50 border-stone-100 rounded-2xl px-6 py-4 gap-4 focus-within:ring-2 ring-emerald-500 transition-all">
                    <User className="text-stone-300" size={20} />
                    <input 
                      type="text" 
                      required 
                      className="bg-transparent border-none focus:ring-0 text-stone-900 w-full"
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Email Address</label>
                  <div className="flex items-center bg-stone-50 border-stone-100 rounded-2xl px-6 py-4 gap-4 focus-within:ring-2 ring-emerald-500 transition-all">
                    <Mail className="text-stone-300" size={20} />
                    <input 
                      type="email" 
                      required 
                      className="bg-transparent border-none focus:ring-0 text-stone-900 w-full"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Account Password</label>
                  <div className="flex items-center bg-stone-50 border-stone-100 rounded-2xl px-6 py-4 gap-4 focus-within:ring-2 ring-emerald-500 transition-all">
                    <Lock className="text-stone-300" size={20} />
                    <input 
                      type="password" 
                      required 
                      minLength={6}
                      className="bg-transparent border-none focus:ring-0 text-stone-900 w-full"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-8">
                  <button 
                    type="button" 
                    onClick={() => setStep(2)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all"
                  >
                    <span>Next step: Business Details</span>
                    <ChevronRight size={20} />
                  </button>
                  <p className="text-stone-400 text-xs text-center mt-6">
                    Already have an account? <Link to="/login" className="text-emerald-600 font-bold">Log in here</Link>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-3xl font-black text-stone-900 mb-2">Business Details</h2>
              <p className="text-stone-400 text-sm mb-12">Tell us about what you offer to the Rwandan market.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Business Name</label>
                  <div className="flex items-center bg-stone-50 border-stone-100 rounded-2xl px-6 py-4 gap-4">
                    <Building2 className="text-stone-300" size={20} />
                    <input 
                      type="text" 
                      required 
                      className="bg-transparent border-none focus:ring-0 text-stone-900 w-full"
                      placeholder="e.g. Kigali Fresh Eats"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">City</label>
                  <select 
                    className="w-full bg-stone-50 border-stone-100 rounded-2xl px-6 py-4 text-stone-900 focus:ring-emerald-500"
                    value={formData.businessCity}
                    onChange={(e) => handleInputChange('businessCity', e.target.value)}
                  >
                    {CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Category</label>
                  <select 
                    className="w-full bg-stone-50 border-stone-100 rounded-2xl px-6 py-4 text-stone-900 focus:ring-emerald-500"
                    value={formData.businessCategory}
                    onChange={(e) => handleInputChange('businessCategory', e.target.value)}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Business Description</label>
                  <textarea 
                    required
                    className="w-full bg-stone-50 border-stone-100 rounded-2xl px-6 py-4 text-stone-900 focus:ring-emerald-500 min-h-[120px]"
                    placeholder="Describe your services, hours, and what makes you special..."
                    value={formData.businessDescription}
                    onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Phone Number</label>
                  <div className="flex items-center bg-stone-50 border-stone-100 rounded-2xl px-6 py-4 gap-4">
                    <Phone className="text-stone-300" size={20} />
                    <input 
                      type="tel" 
                      required 
                      className="bg-transparent border-none focus:ring-0 text-stone-900 w-full"
                      placeholder="+250 792 612 139"
                      value={formData.businessPhone}
                      onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Website (Optional)</label>
                  <div className="flex items-center bg-stone-50 border-stone-100 rounded-2xl px-6 py-4 gap-4">
                    <Globe className="text-stone-300" size={20} />
                    <input 
                      type="url" 
                      className="bg-transparent border-none focus:ring-0 text-stone-900 w-full"
                      placeholder="https://..."
                      value={formData.businessWebsite}
                      onChange={(e) => handleInputChange('businessWebsite', e.target.value)}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <ImageUpload 
                    onUploadSuccess={(url) => setFormData(p => ({ ...p, photos: [...p.photos, url] }))}
                    currentCount={formData.photos.length}
                    maxFiles={10}
                  />
                  {formData.photos.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.photos.map((url, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-stone-200">
                          <img src={url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button 
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, photos: p.photos.filter((_, idx) => idx !== i) }))}
                            className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-12 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="flex-grow bg-stone-100 hover:bg-stone-200 text-stone-600 py-5 rounded-2xl font-black uppercase tracking-widest transition-all"
                >
                  Back
                </button>
                <button 
                  type="button" 
                  onClick={() => setStep(3)}
                  className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all"
                >
                  <span>Choose Plan</span>
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-3xl font-black text-stone-900 mb-2">Choose Plan</h2>
              <p className="text-stone-400 text-sm mb-12">Select the visibility and features that match your needs.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PLANS.map((p) => (
                  <div 
                    key={p.id}
                    onClick={() => handleInputChange('plan', p.id)}
                    className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${
                      formData.plan === p.id 
                        ? 'border-emerald-600 bg-emerald-50 ring-4 ring-emerald-50' 
                        : 'border-stone-100 hover:border-stone-200 bg-white'
                    }`}
                  >
                    <div className="mb-6">
                      <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${
                        formData.plan === p.id ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-400'
                      }`}>
                        {p.id === 'free' ? <Building2 size={20} /> : p.id === 'standard' ? <Check size={20} /> : <Check size={20} />}
                      </div>
                      <h4 className="font-black text-stone-900 uppercase tracking-widest text-xs mb-1">{p.name}</h4>
                      <p className="text-xl font-black text-stone-900">{p.price}</p>
                    </div>
                    
                    <ul className="space-y-3 mb-8">
                      {p.features.map((feat, i) => (
                        <li key={i} className="text-[10px] font-bold text-stone-500 flex items-start gap-2">
                          <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <div className={`w-full py-3 rounded-xl text-center text-[10px] font-black uppercase tracking-widest transition-all ${
                      formData.plan === p.id ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-400'
                    }`}>
                      {formData.plan === p.id ? 'Selected' : 'Select'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-12 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setStep(2)}
                  className="flex-grow bg-stone-100 hover:bg-stone-200 text-stone-600 py-5 rounded-2xl font-black uppercase tracking-widest transition-all"
                >
                  Back
                </button>
                <button 
                  type="button" 
                  onClick={() => setStep(4)}
                  className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all"
                >
                  <span>Set Location</span>
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-stone-900 mb-2">Exact Location</h2>
                  <p className="text-stone-400 text-sm">Pin your business building on the map for accurate GPS directions.</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex gap-4">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl shrink-0 flex items-center justify-center">
                    <Info size={20} />
                  </div>
                  <p className="text-emerald-800 text-xs font-bold leading-relaxed">
                    This step is critical in Rwanda where street addresses are rarely used. Users will see this exact pin when getting directions via Google Maps.
                  </p>
                </div>

                <GPSPicker 
                  initialPos={[formData.lat, formData.lng]} 
                  onLocationChange={(lat, lng) => setFormData(p => ({ ...p, lat, lng }))} 
                />

                <div className="pt-4">
                  <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Address Description</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full bg-stone-50 border-stone-100 rounded-2xl px-6 py-4 text-stone-900 focus:ring-emerald-500"
                    placeholder="e.g. Downtown Building, Floor 2, Beside M-Peace Plaza"
                    value={formData.businessAddress}
                    onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                  />
                </div>

                <div className="pt-8 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setStep(3)}
                    className="flex-grow bg-stone-100 hover:bg-stone-200 text-stone-600 py-5 rounded-2xl font-black uppercase tracking-widest transition-all"
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-[2] bg-stone-900 hover:bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Registering...' : 'Register Business'}
                    {!loading && <Check size={20} />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </form>
      </div>
    </div>
  );
}
