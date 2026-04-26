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
            <h1 className="text-4xl font-black text-stone-900 mb-4 tracking-tight uppercase italic text-red-600">Master Service Agreement</h1>
            <p className="text-stone-400 text-sm font-medium italic">Revised: April 26, 2026</p>
          </div>
          
          <div className="prose prose-stone max-w-none space-y-10 text-stone-600">
            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">1. Binding Legal Agreement</h2>
              <p className="leading-relaxed text-sm">
                This Master Service Agreement (the "Agreement") constitutes a legally binding contract between <strong>The Palace, Inc.</strong> ("The Company") and the individual or entity accessing the platform ("The Member"). By utilizing the Ndangira infrastructure, systems, or services, you acknowledge that you have read, understood, and consented to these terms in their entirety.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">2. Account Integrity & Fiduciary Responsibility</h2>
              <p className="leading-relaxed mb-4 text-sm">
                Access to restricted systemic features requires the establishment of a verified account. The Member warrants:
              </p>
              <ul className="list-disc ml-6 space-y-3 text-sm">
                <li><strong className="text-stone-900">Information Accuracy:</strong> All data provided must be legally accurate and subject to verification at the Company's discretion.</li>
                <li><strong className="text-stone-900">Credential Security:</strong> The Member maintains absolute liability for the security of their cryptographic access credentials.</li>
                <li><strong className="text-stone-900">Incident Reporting:</strong> Immediate mandatory notification to the Company of any suspected unauthorized access or systemic breach.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">3. Intellectual Property & Digital Assets</h2>
              <p className="leading-relaxed text-sm">
                Ndangira's proprietary layout, source code, algorithmic structures, and brand identifiers are the exclusive intellectual property of <strong>The Palace, Inc.</strong> Unauthorized replication, reverse engineering, or redistribution of these assets is strictly prohibited and subject to litigation under Rwandan and International Intellectual Property Laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">4. Conduct & Prohibited Activities</h2>
              <p className="leading-relaxed mb-4 text-sm">
                Members are strictly prohibited from:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-sm italic font-medium">
                <li>Automated scraping or indexing of Ndangira datasets without written authorization.</li>
                <li>Submission of fraudulent business enterprises or deceptive review metrics.</li>
                <li>Interfering with the systemic stability or cryptographic security of the platform.</li>
                <li>Engaging in harassment or extra-legal communications via the internal messaging system.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">5. Financial Obligations & Fiscal Policy</h2>
              <p className="leading-relaxed mb-4 text-sm">
                Premium services are subject to the following fiscal governance:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-sm">
                <li>All fees are denominated in Rwandan Francs (RWF).</li>
                <li>Subscriptions operate on a non-refundable basis once service activation is complete.</li>
                <li>Failure to settle outstanding balances within 72 hours of the billing cycle will result in immediate suspension of premium visibility.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">6. Indemnification & Limitation of Liability</h2>
              <p className="leading-relaxed text-sm">
                The Palace, Inc. provides a discovery infrastructure only. We are not responsible for the commercial conduct, service quality, or legal compliance of listed businesses. To the maximal extent permitted by Law, The Company shall not be held liable for any direct or indirect fiscal loss arising from platform usage.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">7. Governing Jurisdiction</h2>
              <p className="leading-relaxed text-sm">
                This Agreement is governed by the laws of <strong>The Republic of Rwanda</strong>. Any legal proceedings arising from this contract shall be adjudicated exclusively within the Courts of Rubavu or Kigali, Rwanda.
              </p>
            </section>

            <section className="bg-stone-50 p-8 rounded-3xl border border-stone-100">
              <h2 className="text-stone-900 font-black uppercase tracking-widest text-xs mb-4 italic">Executive Contact</h2>
              <p className="text-stone-500 text-sm leading-relaxed">
                Address all legal notices to the <strong>Office of General Counsel</strong>:<br/>
                <span className="text-emerald-600 font-bold">legal@ndangira.rw</span><br/>
                Corporate HQ: Gisenyi, Rubavu District, Rwanda.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
