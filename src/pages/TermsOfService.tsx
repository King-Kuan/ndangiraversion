import React from 'react';
import { motion } from 'framer-motion';

export default function TermsOfService() {
  return (
    <div className="bg-stone-50 min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-[3rem] shadow-xl border border-stone-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-black text-stone-900 mb-8 tracking-tight">Terms of Service</h1>
          <div className="prose prose-stone max-w-none space-y-6 text-stone-600">
            <section>
              <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-widest text-xs">Agreement to Terms</h2>
              <p>By accessing or using Ndangira, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-widest text-xs">Business Listings</h2>
              <p>Users are responsible for the accuracy of their business listings. We reserve the right to moderate, reject, or remove any listing that violates our standards.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-widest text-xs">Plan Upgrades</h2>
              <p>Plan upgrades require admin approval and payment verification. All payments are final unless otherwise determined by our team.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-widest text-xs">Ownership</h2>
              <p>Ndangira is a product of The Palace, Inc. All content and technology are protected by local and international intellectual property laws.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
