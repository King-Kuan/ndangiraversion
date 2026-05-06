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
            <h1 className="text-4xl font-black text-stone-900 mb-4 tracking-tight uppercase italic">Privacy & Data Governance</h1>
            <p className="text-stone-400 text-sm font-medium italic">Legal Revision: April 26, 2026</p>
          </div>

          <div className="prose prose-stone max-w-none space-y-10 text-stone-600">
            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">1. Institutional Commitment to Privacy</h2>
              <p className="leading-relaxed text-sm">
                Ndangira, a platform proprietary to <strong>The Palace, Inc.</strong> (hereafter "The Company"), operates under a rigorous framework of data protection. We recognize that privacy is a fundamental right. This Governance Policy outlines our protocols for the acquisition, retention, and secure processing of personal information, strictly adhering to <strong>Law No. 058/2021</strong> of the Republic of Rwanda.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">2. Scope of Data Acquisition & Verification Metrics</h2>
              <p className="leading-relaxed mb-4 text-sm">
                The Company executes data collection only when essential for service delivery and trust verification. Such data includes:
              </p>
              <ul className="list-disc ml-6 space-y-3 text-sm font-medium">
                <li><strong className="text-stone-900">Identity Credentials:</strong> Legal names, verified email distributions, and telephonic identifiers.</li>
                <li><strong className="text-stone-900">Business Enterprise Data:</strong> Corporate nomenclature, geographic coordinates, and professional assets.</li>
                <li><strong className="text-stone-900">Verification Metrics:</strong> We track unique views and review authenticity to calculate verification milestones. This includes "Eligible Views" which exclude traffic generated during paid Featured periods to ensure purely organic trust growth.</li>
                <li><strong className="text-stone-900">Technical Metadata:</strong> IP addresses and cryptographic session tokens managed via Google Cloud and Firebase.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">3. Jurisdictional Basis for Processing</h2>
              <p className="leading-relaxed mb-4 text-sm">
                Information processing is conducted solely for the following corporate objectives:
              </p>
              <ul className="list-disc ml-6 space-y-3 text-sm">
                <li>Execution of contractual obligations to platform participants.</li>
                <li>Facilitation of business visibility and "Verified Trust" status within Rwanda.</li>
                <li>Integrity Monitoring: Using metadata to prevent fraud, identity spoofing, and review manipulation.</li>
                <li>Management of fiscal transactions for the Featured Growth tier.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">4. Trust Integrity & The "Strike" System</h2>
              <p className="leading-relaxed text-sm italic">
                Ndangira operates a strict zero-tolerance policy for privacy breaches. Any business owner found attempting to scrape user data, manipulate review metrics, or engage in extra-legal communication will be subject to our internal "Strike Logic." 
                The first major breach of user privacy results in immediate revocation of "Verified Trust" status. Subsequent violations lead to permanent system banishment.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">4. Third-Party Protocols & Data Transmission</h2>
              <p className="leading-relaxed text-sm">
                The Company prohibits the commercial sale of user data. Information transmission is limited to:
              </p>
              <ul className="list-disc ml-6 mt-4 space-y-2 text-sm italic">
                <li><strong>Infrastructure Providers:</strong> Google Cloud Platform (Core Infrastructure), Firebase (Real-time Database), and Resend (Institutional Communications).</li>
                <li><strong>Public Dissemination:</strong> Data explicitly categorized as "Business Profile" information is disseminated publicly as per the platform's primary function.</li>
                <li><strong>Judicial Mandates:</strong> Disclosure required by valid legal process or to protect the corporate rights and safety of The Palace, Inc.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">5. Cryptographic Protection & Retention</h2>
              <p className="leading-relaxed text-sm">
                We utilize AES-256 encryption for data at rest and TLS 1.3 for data in transit. 
                Information is retained only for the duration necessary to satisfy the objectives stated in Section 3, or as mandated by Rwandan fiscal and corporate law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-stone-900 mb-4 uppercase tracking-widest text-[10px]">6. Statutory Rights of the Data Subject</h2>
              <p className="leading-relaxed mb-4 text-sm">
                Participants maintain the following rights under Rwandan jurisdiction:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-sm">
                <li>Right of Access and Portability.</li>
                <li>Right to Rectification of inaccurate records.</li>
                <li>Right to Erasure (as permitted by statutory retention requirements).</li>
                <li>Right to Restriction of Processing regarding specific marketing datasets.</li>
              </ul>
            </section>

            <section className="bg-stone-50 p-8 rounded-3xl border border-stone-100">
              <h2 className="text-stone-900 font-black uppercase tracking-widest text-xs mb-4 italic leading-tight">Institutional Inquiry</h2>
              <p className="text-stone-500 text-sm leading-relaxed">
                Address all formal privacy inquiries and statutory requests to the <strong>Office of Data Governance</strong>:<br/>
                <span className="text-emerald-600 font-bold">legal@ndangira.rw</span><br/>
                Headquarters: Gisenyi, Rubavu District, Western Province, Rwanda.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
