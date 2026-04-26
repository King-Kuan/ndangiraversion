import { ReactNode, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { LogIn, LogOut, LayoutDashboard, User, Search, MapPin, PlusCircle, MessageSquare, Bell } from 'lucide-react';

import { GlobalRibbon } from './AdComponents';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [user] = useAuthState(auth);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setHasNewMessages(false);
      return;
    }

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // If any chat has documents, and for now just showing a badge if there's any update
      if (!snapshot.empty) {
        setHasNewMessages(true);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans">
      <GlobalRibbon />

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <MapPin size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-emerald-900">Ndangira</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <Link to="/" className="hover:text-emerald-600 transition-colors">Find Businesses</Link>
            <Link to="/pricing" className="hover:text-emerald-600 transition-colors">Pricing</Link>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {(user.email === "fridomiamovement@gmail.com") && (
                  <Link 
                    to="/admin" 
                    className="hidden lg:flex items-center gap-2 px-4 py-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors font-bold"
                  >
                    <User size={18} />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <Link 
                  to="/messages" 
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-full transition-colors relative"
                  onClick={() => setHasNewMessages(false)}
                >
                  <MessageSquare size={18} />
                  <span>Messages</span>
                  {hasNewMessages && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                  )}
                </Link>
                <Link 
                  to="/dashboard" 
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-stone-600 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link 
                  to="/login" 
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-full transition-colors text-sm font-bold"
                >
                  <LogIn size={18} />
                  <span>Login</span>
                </Link>
                <Link 
                  to="/signup" 
                  className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors text-sm font-bold border border-emerald-100"
                >
                  <span>Sign Up</span>
                </Link>
                <Link 
                  to="/register" 
                  className="flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-full font-bold hover:bg-black shadow-md hover:shadow-lg transition-all text-xs uppercase tracking-widest"
                >
                  <PlusCircle size={18} />
                  <span className="hidden xs:inline">Add Business</span>
                  <span className="xs:hidden">Add</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-stone-900 text-stone-400 py-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <MapPin size={24} className="text-emerald-500" />
              <span className="text-xl font-bold italic">Ndangira</span>
            </div>
            <p className="text-sm leading-relaxed">
              Rwanda's dedicated local business discovery platform. Connecting communities with the services they need.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-emerald-500">Search</Link></li>
              <li><Link to="/pricing" className="hover:text-emerald-500">Pricing</Link></li>
              <li><Link to="/register" className="hover:text-emerald-500">Register Business</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li>management@ndangira.rw</li>
              <li>+250 792 612 139</li>
              <li>Gisenyi, Rubavu, Rwanda</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Policies</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/privacy" className="hover:text-emerald-500">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-emerald-500">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium">
          <p>&copy; {new Date().getFullYear()} Ndangira. All rights reserved.</p>
          <div className="flex flex-col items-center md:items-end">
            <p className="font-black uppercase tracking-[0.2em] text-stone-500 text-center md:text-right">
              Created by <span className="text-emerald-500">The Palace, Inc.</span>
            </p>
            <p className="text-[9px] font-bold text-stone-600 mt-0.5 uppercase tracking-widest text-center md:text-right">
              The Palace Tech House
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
