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
          <div className="mb-12 border-b border-stone-100 pb-8">
            <h1 className="text-4xl font-black text-stone-900 mb-4 tracking-tight">Terms of Service</h1>
            <p className="text-stone-400 text-sm font-medium italic">Last updated: April 22, 2026</p>
          </div>
          
          <div className="prose prose-stone max-w-none space-y-10 text-stone-600">
            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                Welcome to <strong>Ndangira</strong>, a platform operated by <strong>The Palace, Inc. ("we," "us," or "our")</strong>. 
                By accessing or using our website and services, you ("User" or "you") agree to comply with and be bound by these Terms of Service. 
                If you do not agree with any part of these terms, you must immediately discontinue use of the platform.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">2. User Registration and Account Security</h2>
              <p className="leading-relaxed mb-4">
                To access certain features of Ndangira, including listing a business, you must register for an account. You agree to:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-sm italic">
                <li>Provide accurate, current, and complete information during the registration process.</li>
                <li>Maintain the security of your password and accept all risks of unauthorized access to your account.</li>
                <li>Notify us immediately if you discover or suspect any security breaches related to our platform.</li>
                <li>You are solely responsible for all activities that occur under your account.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">3. Business Listings and Content</h2>
              <p className="leading-relaxed mb-4">
                Users may submit business listings, reviews, photos, and other content ("User Content"). 
                By submitting User Content, you represent that:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-sm italic">
                <li>You own or have the necessary licenses to use the content.</li>
                <li>The content is accurate and does not deceive consumers.</li>
                <li>The content does not violate any Rwandan laws, including those relating to defamation, privacy, or intellectual property.</li>
              </ul>
              <p className="mt-4 leading-relaxed">
                We reserve the right, but are not obligated, to monitor, edit, or remove any User Content at our sole discretion, without notice. 
                We reserve the right to reject business listings that do not meet our quality standards.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">4. Payments, Subscriptions, and Refunds</h2>
              <p className="leading-relaxed mb-4">
                Certain services, such as Standard and Featured listings, require payment.
              </p>
              <ul className="list-disc ml-6 space-y-2 text-sm italic">
                <li>All prices listed are in Rwandan Francs (RWF) unless stated otherwise.</li>
                <li>Subscriptions are billed in advance on a monthly or yearly basis.</li>
                <li>Payments are generally non-refundable once the service (e.g., ad placement or plan upgrade) has been activated.</li>
                <li>We use third-party payment verifiers. You agree to provide valid payment details.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">5. Intellectual Property Rights</h2>
              <p className="leading-relaxed">
                The Ndangira logo, design, website code, and all content created by us are the exclusive property of <strong>The Palace, Inc.</strong> 
                You may not copy, reproduce, or distribute any part of our technology without prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">6. Limitation of Liability</h2>
              <p className="leading-relaxed">
                Ndangira provides a platform for business discovery. We do not guarantee the quality, safety, or legality of the businesses listed. 
                We are not responsible for any transactions or disputes between users and listed businesses. 
                To the maximum extent permitted by Rwandan law, we shall not be liable for any indirect, incidental, or consequential damages.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">7. Termination</h2>
              <p className="leading-relaxed">
                We reserve the right to terminate or suspend your account and access to our services at any time, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users or our business interests.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">8. Governing Law</h2>
              <p className="leading-relaxed">
                These Terms of Service are governed by and construed in accordance with the laws of <strong>The Republic of Rwanda</strong>. 
                Any disputes arising under or in connection with these terms shall be subject to the exclusive jurisdiction of the courts in Kigali, Rwanda.
              </p>
            </section>

            <section className="bg-stone-50 p-8 rounded-3xl border border-stone-100">
              <h2 className="text-stone-900 font-black uppercase tracking-widest text-xs mb-4 italic">Contact Us</h2>
              <p className="text-stone-500 text-sm leading-relaxed">
                For questions regarding these Terms, please contact <strong>The Palace Management Team</strong> at:<br/>
                <span className="text-emerald-600 font-bold">management@ndangira.rw</span><br/>
                Location: Gisenyi, Rubavu District, Rwanda.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
