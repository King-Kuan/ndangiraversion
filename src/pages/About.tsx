import React from 'react';
import { motion } from 'framer-motion';
import { Search, MessageSquare, LayoutDashboard, Flag, Zap, Shield, MapPin, Globe } from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: <Search className="text-emerald-500" />,
      title: "Intelligent Discovery",
      description: "Advanced search algorithms enabling users to locate specific business entities across Rwandan cities and categories with high precision."
    },
    {
      icon: <MessageSquare className="text-emerald-500" />,
      title: "Direct Client Correlation",
      description: "Integrated real-time messaging architecture allowing instant communication between prospective clients and enterprise owners."
    },
    {
      icon: <Flag className="text-emerald-500" />,
      title: "Geo-Spatial Mapping",
      description: "Precise localization services using digital mapping to provide exact geographic coordinates for all registered businesses."
    },
    {
      icon: <Zap className="text-emerald-500" />,
      title: "Featured Visibility",
      description: "Tiered advertising systems including Redirect Interstitials and Palace Pop-Ups for maximal brand exposure."
    },
    {
      icon: <LayoutDashboard className="text-emerald-500" />,
      title: "Enterprise Command Center",
      description: "A comprehensive dashboard for business owners to manage listings, track engagement, and update professional profiles."
    },
    {
      icon: <Shield className="text-emerald-500" />,
      title: "Verified Ecosystem",
      description: "Strict moderation protocols and admin-governed verification systems to maintain a high-trust professional network."
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-stone-900 py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500 blur-[120px] rounded-full" />
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6"
          >
            <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em]">Institutional Overview</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter italic uppercase"
          >
            Ndangira <span className="text-emerald-500">Systems</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-stone-400 max-w-2xl mx-auto text-lg leading-relaxed"
          >
            A high-performance digital infrastructure designed to bridge the gap between Rwandan consumer demand and institutional service providers. Ndangira operates as a central nervous system for national business discovery.
          </motion.p>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-32 px-4 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-12 rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-tight italic">{f.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Mission */}
      <section className="py-32 px-4">
        <div className="max-w-5xl mx-auto bg-stone-900 rounded-[3rem] p-12 md:p-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[80px]" />
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black text-white mb-8 tracking-tight uppercase italic">The Ndangira <br/>Ethos</h2>
              <p className="text-stone-400 leading-relaxed mb-8">
                We believe in the power of visibility. In an age of rapid digital transformation, Ndangira provides the baseline infrastructure for local businesses to evolve from physical presence to digital dominance.
              </p>
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Globe size={18} className="text-emerald-500" />
                  </div>
                  <span className="text-white font-bold text-sm">National Reach</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <MapPin size={18} className="text-emerald-500" />
                  </div>
                  <span className="text-white font-bold text-sm">Hyper-Local Context</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center p-8 text-center">
                <span className="text-3xl font-black text-emerald-500 mb-2">100%</span>
                <span className="text-white text-[10px] uppercase font-bold tracking-widest leading-tight">Digital Integrity</span>
              </div>
              <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center p-8 text-center translate-y-8">
                <span className="text-3xl font-black text-emerald-500 mb-2">24/7</span>
                <span className="text-white text-[10px] uppercase font-bold tracking-widest leading-tight">System Availability</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Info */}
      <section className="py-32 px-4 border-t border-stone-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-sm font-black uppercase tracking-[0.4em] text-stone-400 mb-8">Corporate Governance</h2>
          <p className="text-stone-600 leading-relaxed mb-12 italic">
            Ndangira is a strategic asset of <strong>The Palace, Inc.</strong> Developed and maintained by the <strong>The Palace Tech House</strong>, a center of excellence for software engineering and national digital transformation based in Rwanda.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-stone-400">
            <span>Registration: RUB-2026-X01</span>
            <div className="w-1 h-1 bg-stone-300 rounded-full hidden sm:block" />
            <span>Rubavu, Western Province, Rwanda</span>
            <div className="w-1 h-1 bg-stone-300 rounded-full hidden sm:block" />
            <span>Operational Authority: The Palace, Inc.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
