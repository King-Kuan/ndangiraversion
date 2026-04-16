import React from 'react';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  return (
    <div className="bg-stone-50 min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-[3rem] shadow-xl border border-stone-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-black text-stone-900 mb-8 tracking-tight">Privacy Policy</h1>
          <div className="prose prose-stone max-w-none space-y-6 text-stone-600">
            <section>
              <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-widest text-xs">Introduction</h2>
              <p>Welcome to Ndangira. We value your privacy and are committed to protecting your personal data. This policy explains how we collect and use your information when you use our services.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-widest text-xs">Data We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create an account, list a business, or contact us. This includes your name, email, phone number, and business details.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-widest text-xs">How We Use Your Data</h2>
              <p>We use your data to provide and improve our services, facilitate business discovery, and communicate with you about your account or listings.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-widest text-xs">Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at management@ndangira.rw or visit us in Gisenyi, Rubavu, Rwanda.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
