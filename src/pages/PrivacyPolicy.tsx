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
          <div className="mb-12 border-b border-stone-100 pb-8">
            <h1 className="text-4xl font-black text-stone-900 mb-4 tracking-tight">Privacy Policy</h1>
            <p className="text-stone-400 text-sm font-medium italic">Last updated: April 22, 2026</p>
          </div>

          <div className="prose prose-stone max-w-none space-y-10 text-stone-600">
            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">1. Introduction</h2>
              <p className="leading-relaxed">
                Welcome to <strong>Ndangira</strong>. We are committed to protecting your personal data and your privacy. 
                This Privacy Policy describes how <strong>The Palace, Inc.</strong> collects, uses, and shares your personal information 
                when you visit our platform or use our services in accordance with the <strong>Law No. 058/2021 of 13/10/2021 Relating to the Protection of Personal Data and Privacy</strong> in Rwanda.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">2. Information We Collect</h2>
              <p className="leading-relaxed mb-4">
                We collect information that you contribute directly to us, including:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-sm italic">
                <li><strong>Account Information:</strong> Name, email address, password, and phone number.</li>
                <li><strong>Business Information:</strong> Business name, description, address, category, contact details, and photos.</li>
                <li><strong>Communication Data:</strong> Information provided when you contact our support team.</li>
                <li><strong>Automatically Collected Data:</strong> IP address, device type, browser information, and how you interact with our platform (via Google Analytics and Firebase).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">3. How We Use Your Information</h2>
              <p className="leading-relaxed mb-4">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-sm italic">
                <li>To provide and maintain our services.</li>
                <li>To facilitate business discovery and connecting users with local Rwandan businesses.</li>
                <li>To process payments and manage your subscriptions.</li>
                <li>To communicate with you about updates, security alerts, and support.</li>
                <li>To analyze platform usage and improve our user interface and features.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">4. Data Sharing and Disclosure</h2>
              <p className="leading-relaxed">
                We do not sell your personal data. We may share information with:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-sm italic">
                <li><strong>Service Providers:</strong> Third parties like Google Firebase (hosting/database), ImageKit (photo storage), and Resend (email delivery).</li>
                <li><strong>Public Listings:</strong> Business details you provide for your listing will be publicly visible to all users of the platform.</li>
                <li><strong>Legal Compliance:</strong> If required by Rwandan authorities to comply with legal obligations or protect our rights.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">5. Data Security</h2>
              <p className="leading-relaxed">
                We implement industry-standard security measures, including encryption and secure database protocols provided by Google Cloud, to protect your data. 
                However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">6. Your Rights</h2>
              <p className="leading-relaxed mb-4">
                Under Rwandan data protection laws, you have the right to:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-sm italic">
                <li>Access the personal data we hold about you.</li>
                <li>Request the correction of inaccurate data.</li>
                <li>Request the deletion of your data (Right to be Forgotten).</li>
                <li>Object to the processing of your data for marketing purposes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">7. Changes to this Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="bg-stone-50 p-8 rounded-3xl border border-stone-100">
              <h2 className="text-stone-900 font-black uppercase tracking-widest text-xs mb-4 italic">Contact Us</h2>
              <p className="text-stone-500 text-sm leading-relaxed">
                For questions regarding your privacy or to exercise your data rights, please contact our <strong>Data Protection Coordinator</strong> at:<br/>
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
