import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { LogIn, LogOut, LayoutDashboard, User, Search, MapPin, PlusCircle } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans">
      {/* Ad TickerPlaceholder */}
      <div className="bg-yellow-400 text-stone-900 py-2 overflow-hidden whitespace-nowrap border-b border-stone-200">
        <div className="animate-marquee inline-block">
          🚀 Welcome to Ndangira - Rwanda's First Business Discovery Platform! • Add your business for FREE today! • Best restaurants in Kigali now featured! • Find services near you! 🚀
        </div>
      </div>

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
              <div className="flex items-center gap-4">
                <Link 
                  to="/login" 
                  className="flex items-center gap-2 px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <LogIn size={18} />
                  <span>Login</span>
                </Link>
                <Link 
                  to="/register" 
                  className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-full font-medium hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all"
                >
                  <PlusCircle size={18} />
                  <span>Add Business</span>
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
              <li>Kigali, Rwanda</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Newsletter</h4>
            <div className="flex bg-stone-800 rounded-lg p-1.5 focus-within:ring-2 ring-emerald-500 transition-all">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-transparent border-none focus:ring-0 text-sm flex-grow px-3"
              />
              <button className="bg-emerald-600 text-white text-xs px-4 py-2 rounded-md font-bold uppercase tracking-wider">Join</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-stone-800 text-center text-xs">
          &copy; {new Date().getFullYear()} Ndangira. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
