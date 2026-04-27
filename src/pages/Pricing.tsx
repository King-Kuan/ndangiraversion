import { PLANS } from '../constants';
import { Check, Mail, Phone, ArrowRight, Megaphone, Star, Zap, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Pricing() {
  return (
    <div className="py-20 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h1 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight mb-6">Simple, local pricing.</h1>
          <p className="text-stone-500 font-medium">No hidden fees or international credit cards required. Pay via MTN MoMo or Airtel Money to scale your business presence.</p>
        </div>

        {/* Membership Plans Section */}
        <div className="mb-20">
          <h2 className="text-sm font-black text-emerald-600 uppercase tracking-[0.4em] mb-12 flex items-center gap-4">
            <span className="w-12 h-[1px] bg-emerald-600"></span>
            Membership Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <div key={plan.id} className={`bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-stone-100 flex flex-col ${plan.id === 'featured' ? 'ring-2 ring-emerald-600 relative' : ''}`}>
                {plan.id === 'featured' && (
                  <div className="absolute top-0 right-10 -translate-y-1/2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-8">
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-2">{plan.id}</span>
                  <h3 className="text-2xl font-black text-stone-900 mb-4">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 focus:outline-none">
                    <span className="text-3xl font-black text-emerald-900">{plan.price.split('/')[0]}</span>
                    {plan.price.includes('/') && <span className="text-stone-400 font-bold text-sm">/{plan.price.split('/')[1]}</span>}
                  </div>
                </div>

                <ul className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                        <Check size={10} strokeWidth={4} />
                      </div>
                      <span className="text-sm text-stone-600 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link 
                  to="/register" 
                  className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-center transition-all shadow-md active:scale-95 ${
                    plan.id === 'featured' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-stone-900 text-white hover:bg-black'
                  }`}
                >
                  Choose {plan.name}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Advertising Campaigns Section */}
        <div className="mb-20 pt-20 border-t border-stone-200">
          <h2 className="text-sm font-black text-stone-400 uppercase tracking-[0.4em] mb-12 flex items-center gap-4">
            <span className="w-12 h-[1px] bg-stone-300"></span>
            Advertising Campaigns
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Redirect Interstitial */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100 flex flex-col group relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                <Megaphone size={120} className="rotate-12" />
              </div>
              <div className="mb-8">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block mb-2">High Visibility</span>
                <h3 className="text-2xl font-black text-stone-900 mb-4 uppercase italic">Redirect Interstitial</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-stone-900">10,000 RWF</span>
                  <span className="text-stone-400 font-bold text-sm">/per campaign</span>
                </div>
              </div>
              <p className="text-stone-600 text-xs font-medium mb-10 leading-relaxed">Exclusive 3-second countdown page that appears when users explore our directory. Guaranteed attention with a direct link to your site or business.</p>
              <a href="https://wa.me/250792612139" className="mt-auto w-full bg-stone-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-center shadow-lg hover:bg-black transition-all">Launch via WhatsApp</a>
            </div>

            {/* Palace Pop-Up */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100 flex flex-col group relative overflow-hidden">
               <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                <Star size={120} className="rotate-12 text-yellow-500" />
              </div>
              <div className="mb-8">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block mb-2">Engagement Focus</span>
                <h3 className="text-2xl font-black text-stone-900 mb-4 uppercase italic">Palace Pop-Up</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-stone-900">30,000 RWF</span>
                  <span className="text-stone-400 font-bold text-sm">/week</span>
                </div>
              </div>
              <p className="text-stone-600 text-xs font-medium mb-10 leading-relaxed">Interactive popup cards that appear globally or when specific categories are searched. Perfect for seasonal discounts or event registrations.</p>
              <a href="https://wa.me/250792612139" className="mt-auto w-full bg-stone-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-center shadow-lg hover:bg-black transition-all">Launch via WhatsApp</a>
            </div>

            {/* Global Ribbon */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100 flex flex-col group relative overflow-hidden">
               <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                <Zap size={120} className="rotate-12 text-emerald-500" />
              </div>
              <div className="mb-8">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block mb-2">Omnipresent Brand</span>
                <h3 className="text-2xl font-black text-stone-900 mb-4 uppercase italic">Global Ribbon</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-stone-900">15,000 RWF</span>
                  <span className="text-stone-400 font-bold text-sm">/week</span>
                </div>
              </div>
              <p className="text-stone-600 text-xs font-medium mb-10 leading-relaxed">A persistent sticky header banner visible on every page of the platform. Maximum national awareness for your brand name and logo.</p>
              <a href="https://wa.me/250792612139" className="mt-auto w-full bg-stone-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-center shadow-lg hover:bg-black transition-all">Launch via WhatsApp</a>
            </div>
          </div>
        </div>

        {/* Offline Payment Info */}
        <div className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-16 border border-stone-100 flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2 space-y-6">
            <h2 className="text-3xl font-black text-stone-900 tracking-tight leading-tight uppercase italic underline decoration-emerald-500 underline-offset-8">Ready to upgrade?</h2>
            <p className="text-stone-500 leading-relaxed font-medium">To keep service fees at 0 RWF, we handle premium plan activations manually. Process is fast and simple.</p>
            
            <div className="pt-4 flex flex-col sm:flex-row gap-6">
              <a href="mailto:management@ndangira.rw" className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                  <Mail size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 block">Email Us</span>
                  <span className="font-bold text-stone-900">management@ndangira.rw</span>
                </div>
              </a>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-emerald-600 transition-all shadow-sm">
                  <Phone size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 block">WhatsApp</span>
                  <span className="font-bold text-stone-900">+250 792 612 139</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:w-1/2 bg-stone-50 rounded-[2.5rem] p-8 space-y-8">
            <h4 className="font-bold text-stone-900 uppercase text-xs tracking-widest">Protocol for Activation:</h4>
            <div className="space-y-6">
              {[
                { step: 1, text: 'Go to your Dashboard and click "Request Upgrade" on your business listing.' },
                { step: 2, text: 'Our team will contact you or you can contact us directly via WhatsApp with your Business ID.' },
                { step: 3, text: 'Send payment (MTN MoMo/Airtel Money) and share the confirmation screenshot.' },
                { step: 4, text: 'The Palace Tech Team reviews and activates your premium status within minutes.' },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600 font-black text-sm shrink-0 border border-stone-100">
                    {item.step}
                  </div>
                  <p className="text-sm text-stone-600 font-medium pt-1 italic">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
