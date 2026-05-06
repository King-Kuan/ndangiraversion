import React from 'react';
import { motion } from 'framer-motion';
import { Search, MessageSquare, LayoutDashboard, Flag, Zap, Shield, MapPin, Globe } from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: <Shield className="text-emerald-500" />,
      title: "The Verified Pillar",
      description: "Our signature 'Verified Trust' badge isn't for sale. It is earned through 6 months of active service, 2,000+ eligible views, and 350+ authentic reviews. These businesses form the bedrock of the Rwandan economy."
    },
    {
      icon: <Search className="text-emerald-500" />,
      title: "Precision Discovery",
      description: "Advanced multi-layered search designed for Rwanda. Filter by city, category, or trust status to find exactly what you need, from a local tailor in Rubavu to a tech hub in Kigali."
    },
    {
      icon: <MessageSquare className="text-emerald-500" />,
      title: "Interaction Loops",
      description: "We bridge the trust gap. Users leave detailed reviews, and business owners acknowledge them. This obligatory feedback loop ensures that the community always has the final word on quality."
    },
    {
      icon: <MapPin className="text-emerald-500" />,
      title: "Geo-Spatial Accuracy",
      description: "Never get lost. We provide exact digital coordinates for every business, making it smooth for users to locate services in person after discovering them online."
    },
    {
      icon: <Zap className="text-emerald-500" />,
      title: "Featured Growth",
      description: "For businesses looking to scale, our Featured tier provides a visibility boost below the Verified layer. It's a powerful tool for growth while respecting the ultimate priority of verified trust."
    },
    {
      icon: <LayoutDashboard className="text-emerald-500" />,
      title: "Growth Dashboard",
      description: "Business owners get a real-time command center to track verification milestones, respond to reviews, and manage their digital identity with professional precision."
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
            <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em]">Building Trust in Rwanda</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter italic uppercase"
          >
            Trust Over <span className="text-emerald-500">Revenue</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-stone-400 max-w-3xl mx-auto text-lg leading-relaxed font-medium"
          >
            Ndangira is Rwanda's premier business discovery and verification system. We have replaced the standard "pay-to-win" model with a "trust-to-earn" architecture. Our mission is to protect consumers while celebrating the businesses that consistently deliver excellence.
          </motion.p>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-32 px-4 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center">
            <h2 className="text-3xl font-black text-stone-900 mb-4 uppercase tracking-tight">The Best Answer for Rwanda</h2>
            <p className="text-stone-500 max-w-2xl mx-auto">Every line of code in Ndangira is written to support the local economy. We've built an ecosystem where visibility is a reward for reliability.</p>
          </div>
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
              <h2 className="text-4xl font-black text-white mb-8 tracking-tight uppercase italic">The Ndangira <br/>Standard</h2>
              <p className="text-stone-400 leading-relaxed mb-8">
                In a crowded marketplace, the loudest voice shouldn't always win—the most trusted one should. By enforcing strict verification milestones, we ensure that Rwandan consumers can find partners they can truly depend on.
              </p>
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Shield size={18} className="text-emerald-500" />
                  </div>
                  <span className="text-white font-bold text-sm">Earned Verification</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <MessageSquare size={18} className="text-emerald-500" />
                  </div>
                  <span className="text-white font-bold text-sm">Community-Driven Ranking</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center p-8 text-center">
                <span className="text-3xl font-black text-emerald-500 mb-2">350+</span>
                <span className="text-white text-[10px] uppercase font-bold tracking-widest leading-tight">Reviews to Verify</span>
              </div>
              <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center p-8 text-center translate-y-8">
                <span className="text-3xl font-black text-emerald-500 mb-2">6mo</span>
                <span className="text-white text-[10px] uppercase font-bold tracking-widest leading-tight">Min. Platform Age</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Info */}
      <section className="py-32 px-4 border-t border-stone-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-sm font-black uppercase tracking-[0.4em] text-stone-400 mb-8">Official Platform Notice</h2>
          <p className="text-stone-600 leading-relaxed mb-12 italic">
            Ndangira is Rwanda's answer to the need for a secure, professional, and authentic business directory. Operated by <strong>The Palace, Inc.</strong>, we are committed to national digital transformation and the success of every honest Rwandan business.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-stone-400">
            <span>www.ndangira.rw</span>
            <div className="w-1 h-1 bg-stone-300 rounded-full hidden sm:block" />
            <span>Rubavu, Rwanda</span>
            <div className="w-1 h-1 bg-stone-300 rounded-full hidden sm:block" />
            <span>Operational Authority: The Palace, Inc.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
