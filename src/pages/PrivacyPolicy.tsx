import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

export const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ background: '#0a1f13', minHeight: '100vh', color: '#faf6ef', fontFamily: 'Outfit, sans-serif' }}>
      {/* Short NavBar for the page */}
      <nav style={{ padding: '24px 48px', borderBottom: '1px solid rgba(201,160,66,0.1)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#c9a042' }}>
            <ArrowLeft size={16} />
            <span style={{ fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>Back to Home</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.png" alt="Elite Physio Clinics" style={{ width: 32, height: 32, opacity: 0.9, borderRadius: '50%', boxShadow: '0 0 0 1.5px rgba(201,160,66,0.3)' }} />
          </div>
        </div>
      </nav>

      <main style={{ padding: '64px 24px', maxWidth: 860, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ fontSize: 11, color: '#c9a042', letterSpacing: '0.35em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>
            ── LEGAL INFORMATION
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 300, marginBottom: 48, lineHeight: 1.1 }}>
            Privacy <em style={{ color: '#c9a042' }}>Policy</em>
          </h1>

          <div style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(250,246,239,0.85)', display: 'flex', flexDirection: 'column', gap: 32 }}>
            <p><strong>Last Updated:</strong> March 2026</p>

            <p>
              At Elite Physio Clinics, we are committed to protecting and respecting your privacy. This policy explains when and why we collect personal information about people who visit our website or use our services, how we use it, the conditions under which we may disclose it to others, and how we keep it secure. This policy complies with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
            </p>

            <section>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, color: '#c9a042', marginBottom: 16, fontWeight: 500 }}>1. Who We Are</h2>
              <p>We are Elite Physio Clinics. You can contact us regarding your data at:</p>
              <ul style={{ listStyleType: 'disc', paddingLeft: 24, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li><strong>Email:</strong> elitephysioclinics@gmail.com</li>
                <li><strong>Phone:</strong> +44 333 577 9553</li>
                <li><strong>Address:</strong> Mare Fair, Sol Central, Ground Floor, Unit 3, Northampton NN1 1SR</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, color: '#c9a042', marginBottom: 16, fontWeight: 500 }}>2. What Information We Collect</h2>
              <p>We collect different types of information depending on how you interact with us:</p>
              <ul style={{ listStyleType: 'disc', paddingLeft: 24, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li><strong>Standard Personal Data:</strong> Name, email address, phone number, and billing address.</li>
                <li><strong>Special Category Data (Health Data):</strong> Medical history, GP details, treatment records, and notes from your physiotherapy sessions.</li>
                <li><strong>Technical Data:</strong> IP address, browser type, and information about how you use our website (via cookies).</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, color: '#c9a042', marginBottom: 16, fontWeight: 500 }}>3. How We Collect Your Information</h2>
              <p>We collect information when you:</p>
              <ul style={{ listStyleType: 'disc', paddingLeft: 24, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Book an appointment online, over the phone, or in person.</li>
                <li>Provide medical history forms before or during your consultation.</li>
                <li>Interact with our website.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, color: '#c9a042', marginBottom: 16, fontWeight: 500 }}>4. Why We Collect Your Data & Our Legal Basis</h2>
              <p>Under UK GDPR, we must have a valid legal reason to process your data. We rely on the following:</p>
              <ul style={{ listStyleType: 'disc', paddingLeft: 24, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li><strong>Contract/Provision of Health Care:</strong> We need your health and contact data to assess your condition, provide physiotherapy treatments, and fulfill our contract with you.</li>
                <li><strong>Legitimate Interests:</strong> To run our business smoothly, send appointment reminders, and improve our services.</li>
                <li><strong>Legal Obligation:</strong> To keep financial and medical records for the time periods required by UK law.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, color: '#c9a042', marginBottom: 16, fontWeight: 500 }}>5. Who We Share Your Information With</h2>
              <p>We will never sell your personal data. We only share it when necessary to provide your care:</p>
              <ul style={{ listStyleType: 'disc', paddingLeft: 24, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li><strong>Medical Professionals:</strong> Your GP or other specialists (only with your explicit permission).</li>
                <li><strong>Insurance Companies:</strong> If your treatment is covered by a health insurance provider.</li>
                <li><strong>Service Providers:</strong> Companies that help us run our business safely, such as secure booking systems, payment processors, and our website hosting provider.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, color: '#c9a042', marginBottom: 16, fontWeight: 500 }}>6. How We Store and Protect Your Data</h2>
              <p>
                We take data security seriously. All patient records and personal data are stored securely in encrypted, password-protected practice management software. We keep your personal data only for as long as necessary. By law, medical records in the UK must generally be retained for <strong>8 years</strong> after your last treatment (or until age 25 for treating children).
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, color: '#c9a042', marginBottom: 16, fontWeight: 500 }}>7. Your Rights</h2>
              <p>Under UK data protection law, you have the right to:</p>
              <ul style={{ listStyleType: 'disc', paddingLeft: 24, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li><strong>Request access</strong> to the personal data we hold about you.</li>
                <li><strong>Ask us to correct</strong> any inaccurate or incomplete information.</li>
                <li><strong>Request deletion</strong> of your personal information (Note: this is limited for medical records due to legal retention requirements).</li>
              </ul>
              <p style={{ marginTop: 12 }}>If you wish to exercise any of these rights, please contact us at <strong>elitephysioclinics@gmail.com</strong>.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, color: '#c9a042', marginBottom: 16, fontWeight: 500 }}>8. How to Complain</h2>
              <p>If you have any concerns about our use of your personal information, you can make a complaint to us at <strong>elitephysioclinics@gmail.com</strong>.</p>
              <p style={{ marginTop: 12 }}>You can also complain to the Information Commissioner’s Office (ICO) if you are unhappy with how we have used your data.</p>
              <ul style={{ listStyleType: 'none', paddingLeft: 0, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li><strong>ICO website:</strong> <a href="https://www.ico.org.uk" target="_blank" rel="noopener noreferrer" style={{ color: '#c9a042', textDecoration: 'underline' }}>https://www.ico.org.uk</a></li>
                <li><strong>ICO Helpline:</strong> 0303 123 1113</li>
              </ul>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
