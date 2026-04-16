import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, handleFirestoreError, OperationType } from '../firebase';
import { Mail, Lock, LogIn, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'auth/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 md:py-24 px-4 relative overflow-hidden flex items-center justify-center">
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-100 rounded-full blur-3xl -z-10 opacity-30 -translate-x-1/2 translate-y-1/2" />
      
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 border border-stone-100">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-3xl font-black text-stone-900 mb-2">Welcome Back</h2>
            <p className="text-stone-400 text-sm mb-12">Log in to manage your business listing.</p>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Email Address</label>
                <div className="flex items-center bg-stone-50 border-stone-100 rounded-2xl px-6 py-4 gap-4 focus-within:ring-2 ring-emerald-500 transition-all">
                  <Mail className="text-stone-300" size={20} />
                  <input 
                    type="email" 
                    required 
                    className="bg-transparent border-none focus:ring-0 text-stone-900 w-full"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-stone-400 block mb-3">Password</label>
                <div className="flex items-center bg-stone-50 border-stone-100 rounded-2xl px-6 py-4 gap-4 focus-within:ring-2 ring-emerald-500 transition-all">
                  <Lock className="text-stone-300" size={20} />
                  <input 
                    type="password" 
                    required 
                    className="bg-transparent border-none focus:ring-0 text-stone-900 w-full"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-8">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'Log In'}
                  {!loading && <ChevronRight size={20} />}
                </button>
                <p className="text-stone-400 text-xs text-center mt-8">
                  Don't have an account? <Link to="/register" className="text-emerald-600 font-bold hover:underline">Register your business</Link>
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
