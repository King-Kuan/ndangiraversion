import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { Mail, Lock, User, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: formData.name });

      // Create User Profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        email: formData.email,
        role: 'user',
        createdAt: serverTimestamp()
      });

      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message || "Failed to create account");
      handleFirestoreError(error, OperationType.CREATE, 'auth/signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 md:py-24 px-4 relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-100 rounded-full blur-3xl -z-10 opacity-30 translate-x-1/2 -translate-y-1/2" />
      
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 border border-stone-100">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <User size={20} />
              </div>
              <h2 className="text-3xl font-black text-stone-900 tracking-tight">Join Ndangira</h2>
            </div>
            <p className="text-stone-400 text-sm mb-10 font-medium">Create an account to review businesses, save favorites, and advertise with us.</p>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-3">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Full Name</label>
                <div className="flex items-center bg-stone-50 border-stone-100 rounded-2xl px-6 py-4 gap-4 focus-within:ring-2 ring-emerald-500 transition-all">
                  <User className="text-stone-300" size={20} />
                  <input 
                    type="text" 
                    required 
                    className="bg-transparent border-none focus:ring-0 text-stone-900 w-full text-sm"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
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
                    className="bg-transparent border-none focus:ring-0 text-stone-900 w-full text-sm"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Password</label>
                  <div className="flex items-center bg-stone-50 border-stone-100 rounded-2xl px-6 py-4 gap-4 focus-within:ring-2 ring-emerald-500 transition-all">
                    <Lock className="text-stone-300" size={20} />
                    <input 
                      type="password" 
                      required 
                      minLength={6}
                      className="bg-transparent border-none focus:ring-0 text-stone-900 w-full text-sm"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Confirm Password</label>
                  <div className="flex items-center bg-stone-50 border-stone-100 rounded-2xl px-6 py-4 gap-4 focus-within:ring-2 ring-emerald-500 transition-all">
                    <Lock className="text-stone-300" size={20} />
                    <input 
                      type="password" 
                      required 
                      minLength={6}
                      className="bg-transparent border-none focus:ring-0 text-stone-900 w-full text-sm"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-stone-900 hover:bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                  {!loading && <ChevronRight size={20} />}
                </button>
                
                <div className="mt-8 pt-8 border-t border-stone-100 space-y-4">
                  <p className="text-stone-400 text-xs text-center">
                    Already have an account? <Link to="/login" className="text-emerald-600 font-bold hover:underline">Log in</Link>
                  </p>
                  <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span>Access to reviews & ads</span>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
