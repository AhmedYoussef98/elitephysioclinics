import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route } from 'react-router';
import { Player } from '@remotion/player';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { HeroComposition } from './remotion/HeroComposition';
import {
  Phone, Mail, MapPin, Clock, ChevronDown, ArrowRight,
  CheckCircle, Menu, X, Star, Shield, Heart, Award, MessageCircle,
} from 'lucide-react';
import { BookingForm } from './components/booking/BookingForm';
import { useClinicHours } from './context/ClinicHoursContext';
import { LoginForm } from './components/admin/LoginForm';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { Dashboard } from './components/admin/Dashboard';
import { AppointmentList } from './components/admin/AppointmentList';
import { CreateAppointment } from './components/admin/CreateAppointment';
import { AvailabilityManager } from './components/admin/AvailabilityManager';
import { WorkingHours } from './components/admin/WorkingHours';
import { PrivacyPolicy } from './pages/PrivacyPolicy';

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

const WHATSAPP_URL = 'https://wa.me/447405825954?text=Hello%2C%20I%27d%20like%20to%20book%20an%20appointment%20at%20Elite%20Physio%20Clinics.';

const SERVICES = [
  { title: 'Back Pain & Sciatica', desc: 'Expert treatment for lumbar disc conditions, spinal stenosis, and sciatic nerve pain along the full nerve pathway.' },
  { title: 'Neck Pain & Whiplash', desc: 'Comprehensive cervical spine assessment and mobilisation for acute and chronic neck conditions.' },
  { title: 'Sports Injuries', desc: 'From acute ligament sprains to chronic overuse conditions — treatment for athletes at every level.' },
  { title: 'Arthritis Management', desc: 'Evidence-based strategies to reduce pain, improve joint mobility, and maintain quality of life.' },
  { title: 'Post-Surgical Rehab', desc: 'Structured progressive rehabilitation programs following orthopaedic and spinal surgery.' },
  { title: 'Frozen Shoulder', desc: 'Specialised capsular mobilisation and graded stretching for adhesive capsulitis at all stages.' },
  { title: 'Tendon Injuries', desc: 'Targeted loading therapy for tennis elbow, golfer\'s elbow, and tendinopathy conditions.' },
  { title: 'Knee & Ankle', desc: 'Biomechanical assessment and targeted rehabilitation for lower limb conditions and instability.' },
];

const PEDIATRIC_SERVICES = [
  { title: 'Head Turning Preference & Torticollis', desc: 'Assessment and treatment for infant neck tightness, head turning preference, and associated movement asymmetry.' },
  { title: 'Flat Head Syndrome', desc: 'Management of Brachycephaly and Plagiocephaly through positioning guidance, physiotherapy, and developmental support.' },
  { title: 'Delayed Developmental Milestones', desc: 'Support for infants and children experiencing delays in motor skills such as rolling, sitting, crawling, and walking.' },
  { title: 'Cerebral Palsy & Birth-Related Conditions', desc: 'Individualized therapy programs to improve movement control, strength, and functional independence.' },
  { title: 'Balance & Coordination Difficulties', desc: 'Targeted rehabilitation for Developmental Coordination Disorder (DCD) and other motor coordination challenges.' },
  { title: 'Chromosomal, Genetic & Neurological Conditions', desc: 'Specialist physiotherapy care supporting movement, posture, and development in complex conditions.' },
  { title: 'Positional Talipes (Clubfoot)', desc: 'Early intervention and therapeutic management to improve foot positioning and mobility.' },
  { title: 'Gait Disorders', desc: 'Assessment and treatment for walking abnormalities including flat feet, intoeing, and out-toeing.' },
  { title: 'Musculoskeletal Conditions in Children', desc: 'Management of growth-related and orthopaedic conditions affecting bones, joints, and muscles.' },
  { title: 'Osgood-Schlatter Disease', desc: 'Treatment for activity-related knee pain common in growing adolescents.' },
  { title: 'Sever\'s Disease', desc: 'Rehabilitation strategies to relieve heel pain associated with growth plate irritation.' },
  { title: 'Osteochondritis Dissecans', desc: 'Specialised care for joint cartilage and bone conditions affecting young athletes.' },
];

const STATS = [
  { value: 20, suffix: '+', label: 'Years Experience', sub: 'NHS & Private Practice' },
  { value: 9, suffix: '+', label: 'Insurance Partners', sub: 'AXA, Aviva, WPA & more' },
  { value: 100, suffix: '%', label: 'Personalised Care', sub: 'Tailored to every patient' },
];

const INSURANCE = [
  { name: 'AXA Health', logo: '/insurance/AXA_Health.webp' },
  { name: 'Aviva', logo: '/insurance/Aviva.svg' },
  { name: 'Vitality', logo: '/insurance/Vitality.svg' },
  { name: 'WPA', logo: '/insurance/WPA.svg' },
  { name: 'IPRS Health', logo: '/insurance/IPRS_Health.png' },
  { name: 'Cigna', logo: '/insurance/Cigna.svg' },
  { name: 'HCML', logo: '/insurance/HCML.png' },
  { name: 'Treatment Network', logo: '/insurance/Treatment_Network.svg' },
  { name: 'Speed Medical', logo: '/insurance/Speed_Medical.png' },
];

const CREDENTIALS = [
  { label: 'Doctor of Physiotherapy (DPT)', highlight: true },
  { label: 'MSc Physiotherapy — Coventry University', highlight: false },
  { label: 'Chartered Physiotherapist (MCSP)', highlight: false },
  { label: '20+ Years Musculoskeletal Specialist', highlight: true },
  { label: 'Post-Graduate Musculoskeletal Training', highlight: false },
  { label: "Specialist — Children's Physiotherapy", highlight: false },
];

const NAV_LINKS = ['Services', 'About', 'Insurance', 'Contact'];

// ─────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────

const useBreakpoint = () => {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  useEffect(() => {
    const h = () => setWidth(window.innerWidth);
    window.addEventListener('resize', h, { passive: true });
    return () => window.removeEventListener('resize', h);
  }, []);
  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    width,
  };
};

const useCounter = (target: number, inView: boolean) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / 1800, 1);
      setCount(Math.floor((1 - Math.pow(1 - progress, 3)) * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);
  return count;
};

const useScrolled = (threshold = 60) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, [threshold]);
  return scrolled;
};

// ─────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────

const NavBar = () => {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const { isMobile } = useBreakpoint();

  // Close menu on resize to desktop
  useEffect(() => { if (!isMobile) setOpen(false); }, [isMobile]);

  return (
    <>
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          padding: isMobile ? '14px 20px' : scrolled ? '16px 48px' : '24px 48px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: scrolled || open ? 'rgba(8,18,11,0.96)' : 'transparent',
          backdropFilter: scrolled || open ? 'blur(24px)' : 'none',
          borderBottom: scrolled && !open ? '1px solid rgba(201,160,66,0.12)' : 'none',
          transition: 'all 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
        }}
      >
        {/* Logo */}
        <a href="#" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo.png" alt="Elite Physio Clinics" style={{ width: 44, height: 44, flexShrink: 0, borderRadius: '50%', boxShadow: '0 0 0 2px rgba(201,160,66,0.4), 0 0 12px rgba(201,160,66,0.15)', transition: 'filter 0.3s ease' }} />
          <div>
            <div style={{ fontSize: isMobile ? 13 : 15, fontWeight: 600, color: '#faf6ef', letterSpacing: '0.14em', fontFamily: 'Cormorant Garamond, serif', lineHeight: 1.1 }}>
              ELITE PHYSIO
            </div>
            {!isMobile && (
              <div style={{ fontSize: 9, color: 'rgba(201,160,66,0.75)', letterSpacing: '0.3em', fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase' }}>
                CLINICS · NORTHAMPTON
              </div>
            )}
          </div>
        </a>

        {/* Desktop nav */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
            {NAV_LINKS.map(link => (
              <a key={link} href={`#${link.toLowerCase()}`} className="nav-link"
                style={{ fontSize: 12, color: 'rgba(250,246,239,0.75)', textDecoration: 'none', letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}
              >{link}</a>
            ))}
            <a href="#contact" className="btn-primary"
              style={{ fontSize: 11, color: '#0a1f13', background: '#c9a042', padding: '11px 26px', borderRadius: 2, textDecoration: 'none', letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}
            >Book Now</a>
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button
            onClick={() => setOpen(o => !o)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#faf6ef', display: 'flex', alignItems: 'center' }}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} color="#faf6ef" /> : <Menu size={22} color="#faf6ef" />}
          </button>
        )}
      </nav>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {open && isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: 'fixed', inset: 0, top: 56, zIndex: 999,
              background: 'rgba(6,14,9,0.98)', backdropFilter: 'blur(24px)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {/* Decorative line */}
            <div style={{ width: 1, height: 40, background: 'rgba(201,160,66,0.3)', marginBottom: 16 }} />

            {NAV_LINKS.map((link, i) => (
              <motion.a
                key={link}
                href={`#${link.toLowerCase()}`}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{
                  fontFamily: 'Cormorant Garamond, serif', fontSize: 38, fontWeight: 300,
                  color: '#faf6ef', textDecoration: 'none', letterSpacing: '0.08em',
                  padding: '10px 0', display: 'block',
                }}
              >{link}</motion.a>
            ))}

            <div style={{ width: 40, height: 1, background: 'rgba(201,160,66,0.3)', margin: '20px 0' }} />

            <motion.a
              href="#contact"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: '#c9a042', color: '#0a1f13',
                padding: '14px 36px', borderRadius: 2, textDecoration: 'none',
                fontSize: 13, letterSpacing: '0.16em', textTransform: 'uppercase',
                fontFamily: 'Outfit, sans-serif', fontWeight: 700,
              }}
            >
              <Phone size={14} /> Book Now
            </motion.a>

            <div style={{ marginTop: 24, fontSize: 11, color: 'rgba(250,246,239,0.25)', letterSpacing: '0.12em', fontFamily: 'Outfit, sans-serif' }}>
              +44 333 577 9553
            </div>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 11, color: 'rgba(37,211,102,0.7)', letterSpacing: '0.12em', fontFamily: 'Outfit, sans-serif', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#25D366')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(37,211,102,0.7)')}
            >
              <MessageCircle size={12} /> WhatsApp
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ─────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────

const HeroSection = () => {
  const { isMobile, isTablet } = useBreakpoint();
  const letters = 'ELITE'.split('');

  return (
    <section style={{ height: '100svh', minHeight: 560, position: 'relative', overflow: 'hidden' }}>
      {/* Remotion Player */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'max(100%, calc(100vh * 16 / 9))',
          height: 'max(100vh, calc(100vw * 9 / 16))',
          minWidth: '100%', minHeight: '100%',
        }}>
          <Player
            component={HeroComposition}
            durationInFrames={180}
            compositionWidth={1920}
            compositionHeight={1080}
            fps={30}
            autoPlay loop
            controls={false}
            clickToPlay={false}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>

      {/* Vignette */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 35%, rgba(6,14,9,0.65) 100%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(6,14,9,0.3) 0%, transparent 28%, transparent 62%, rgba(6,14,9,0.88) 100%)', pointerEvents: 'none' }} />

      {/* Content */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px 120px' }}>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, letterSpacing: '0.5em' }}
          animate={{ opacity: 1, letterSpacing: isMobile ? '0.2em' : '0.35em' }}
          transition={{ delay: 0.4, duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            fontSize: isMobile ? 10 : 11, color: 'rgba(201,160,66,0.8)',
            letterSpacing: isMobile ? '0.2em' : '0.35em',
            textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif', fontWeight: 500,
            marginBottom: isMobile ? 18 : 24, textAlign: 'center',
          }}
        >
          {isMobile ? 'Chartered Physiotherapy' : 'Chartered Physiotherapy · Northampton'}
        </motion.div>

        {/* ELITE letters */}
        <div style={{ display: 'flex', gap: isMobile ? 2 : 6, justifyContent: 'center', overflow: 'hidden' }}>
          {letters.map((l, i) => (
            <motion.span
              key={i}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.08, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'inline-block',
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: isMobile ? 'clamp(44px, 14vw, 68px)' : isTablet ? 'clamp(68px, 10vw, 96px)' : 'clamp(72px, 10vw, 130px)',
                fontWeight: 300,
                color: '#faf6ef',
                letterSpacing: isMobile ? '0.08em' : '0.22em',
                lineHeight: 1,
                textShadow: '0 0 80px rgba(201,160,66,0.15)',
              }}
            >{l}</motion.span>
          ))}
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.3, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            width: isMobile ? 160 : 260, height: 1, margin: isMobile ? '16px 0' : '20px 0',
            background: 'linear-gradient(90deg, transparent, #c9a042 20%, #e8c96d 50%, #c9a042 80%, transparent)',
            transformOrigin: 'center',
          }}
        />

        {/* PHYSIO CLINICS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: isMobile ? 13 : isTablet ? 18 : 'clamp(16px, 2.5vw, 26px)',
            fontWeight: 400, color: '#c9a042',
            letterSpacing: isMobile ? '0.3em' : '0.62em',
            textTransform: 'uppercase',
            marginBottom: isMobile ? 20 : 28,
          }}
        >
          PHYSIO CLINICS
        </motion.div>

        {/* Tagline — hidden on very small screens */}
        {!isMobile && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.9, duration: 1 }}
            style={{
              fontSize: isTablet ? 13 : 15, color: 'rgba(250,246,239,0.55)',
              fontFamily: 'Outfit, sans-serif', fontWeight: 300,
              letterSpacing: '0.04em', lineHeight: 1.8,
              textAlign: 'center', maxWidth: 460, marginBottom: 40,
            }}
          >
            Personalised physiotherapy to help you recover from injuries, manage pain, and enhance your well-being.
          </motion.p>
        )}

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: isMobile ? 1.7 : 2.1, duration: 0.7 }}
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 12 : 16,
            alignItems: 'center',
            width: isMobile ? '100%' : 'auto',
            maxWidth: isMobile ? 300 : 'none',
          }}
        >
          <a href="#contact" className="btn-primary"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
              background: '#c9a042', color: '#0a1f13',
              padding: isMobile ? '13px 0' : '14px 32px',
              width: isMobile ? '100%' : 'auto',
              borderRadius: 2, textDecoration: 'none',
              fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase',
              fontFamily: 'Outfit, sans-serif', fontWeight: 700,
            }}
          >
            <Phone size={14} /> Book Now
          </a>
          <a href="#services" className="btn-ghost"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
              background: 'transparent', color: '#faf6ef',
              padding: isMobile ? '13px 0' : '14px 32px',
              width: isMobile ? '100%' : 'auto',
              borderRadius: 2, textDecoration: 'none',
              fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase',
              fontFamily: 'Outfit, sans-serif', fontWeight: 500,
              border: '1px solid rgba(250,246,239,0.3)',
            }}
          >
            Explore Services <ArrowRight size={13} />
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6 }}
        style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}
      >
        <span style={{ fontSize: 9, color: 'rgba(201,160,66,0.45)', letterSpacing: '0.25em', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif' }}>Scroll</span>
        <div style={{ animation: 'bounce-down 2s ease-in-out infinite' }}>
          <ChevronDown size={13} color="rgba(201,160,66,0.45)" />
        </div>
      </motion.div>

      {/* Bottom-right tag — desktop only */}
      {!isMobile && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }}
          style={{ position: 'absolute', bottom: 28, right: 40, display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <div style={{ width: 24, height: 1, background: 'rgba(201,160,66,0.35)' }} />
          <span style={{ fontSize: 10, color: 'rgba(201,160,66,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif' }}>
            Led by Wafaa Ibrahim · DPT · MSc
          </span>
        </motion.div>
      )}
    </section>
  );
};

// ─────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────

const StatCard = ({ value, suffix, label, sub, delay }: any) => {
  const { isMobile } = useBreakpoint();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const count = useCounter(value, inView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay }}
      viewport={{ once: true }}
      style={{ textAlign: 'center', padding: isMobile ? '36px 16px' : '48px 24px' }}
    >
      <div className="shimmer-text" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: isMobile ? 64 : 'clamp(60px, 7vw, 88px)', fontWeight: 300, lineHeight: 1, marginBottom: 10 }}>
        {count}{suffix}
      </div>
      <div style={{ fontSize: isMobile ? 13 : 15, fontWeight: 600, color: '#faf6ef', letterSpacing: '0.06em', marginBottom: 5, fontFamily: 'Outfit, sans-serif' }}>
        {label}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(250,246,239,0.38)', letterSpacing: '0.12em', fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase' }}>
        {sub}
      </div>
    </motion.div>
  );
};

const StatsSection = () => {
  const { isMobile } = useBreakpoint();
  return (
    <section style={{ background: '#070d0e', borderTop: '1px solid rgba(201,160,66,0.12)', borderBottom: '1px solid rgba(201,160,66,0.12)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)' }}>
        {STATS.map((s, i) => (
          <div key={i} style={{
            borderRight: !isMobile && i < 2 ? '1px solid rgba(201,160,66,0.1)' : 'none',
            borderBottom: isMobile && i < 2 ? '1px solid rgba(201,160,66,0.1)' : 'none',
          }}>
            <StatCard {...s} delay={i * 0.12} />
          </div>
        ))}
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────

const ConditionCard = ({ title, desc, index, isMobile, delay }: { title: string; desc: string; index: number; isMobile: boolean; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="service-card"
    style={{
      padding: isMobile ? '24px 20px' : '32px 28px',
      background: 'rgba(6,14,9,0.55)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(201,160,66,0.1)',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, #e8c96d, rgba(201,160,66,0))' }} />
    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 300, color: 'rgba(201,160,66,0.2)', marginBottom: 12, lineHeight: 1 }}>
      {String(index).padStart(2, '0')}
    </div>
    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: isMobile ? 18 : 20, fontWeight: 500, color: '#faf6ef', margin: '0 0 10px', lineHeight: 1.25 }}>{title}</h3>
    <p style={{ fontSize: 13, color: 'rgba(250,246,239,0.55)', lineHeight: 1.75, margin: 0, fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>{desc}</p>
  </motion.div>
);

const TABS = [
  { key: 'adult' as const, label: 'Adult Conditions' },
  { key: 'paediatric' as const, label: "Children's Conditions" },
];

const ServicesSection = () => {
  const { isMobile, isTablet } = useBreakpoint();
  const [activeTab, setActiveTab] = useState<'adult' | 'paediatric'>('adult');
  const [direction, setDirection] = useState(1);
  const [showHint, setShowHint] = useState(true);
  const px = isMobile ? '20px' : '48px';
  const py = isMobile ? '64px' : '120px';
  const cols = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)';
  const items = activeTab === 'adult' ? SERVICES : PEDIATRIC_SERVICES;

  const switchTab = (tab: 'adult' | 'paediatric') => {
    if (tab === activeTab) return;
    setDirection(tab === 'paediatric' ? 1 : -1);
    setActiveTab(tab);
    setShowHint(false);
  };

  useEffect(() => {
    if (!isMobile) return;
    const t = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(t);
  }, [isMobile]);

  return (
    <section id="services" style={{ position: 'relative', overflow: 'hidden', padding: `${py} ${px}` }}>
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>
      {/* Dark overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(6,14,9,0.88) 0%, rgba(10,31,19,0.78) 50%, rgba(6,14,9,0.92) 100%)',
        zIndex: 1,
      }} />

      <div style={{ maxWidth: 1240, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{
            display: 'flex', flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-end',
            gap: isMobile ? 20 : 40, marginBottom: isMobile ? 36 : 56,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: 'rgba(250,246,239,0.7)', letterSpacing: '0.35em', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif', fontWeight: 600, marginBottom: 14 }}>
              ── SPECIALIST CARE
            </div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: isMobile ? 48 : 'clamp(48px, 6vw, 72px)', fontWeight: 300, color: '#faf6ef', lineHeight: 1.05, margin: 0 }}>
              Conditions<br /><em style={{ fontStyle: 'italic', color: '#e8c96d' }}>We Treat</em>
            </h2>
          </div>
          <div style={{ maxWidth: isMobile ? '100%' : 360, fontSize: 14, lineHeight: 1.85, color: 'rgba(250,246,239,0.7)', fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
            Evidence-based physiotherapy for a comprehensive range of musculoskeletal and neurological conditions, delivered with genuine personal care.
          </div>
        </motion.div>

        {/* Tab bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{ display: 'flex', gap: 0, marginBottom: isMobile ? 8 : 12, borderBottom: '1px solid rgba(201,160,66,0.12)' }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => switchTab(tab.key)}
              style={{
                flex: 1,
                position: 'relative',
                padding: isMobile ? '14px 12px' : '16px 24px',
                background: 'transparent',
                border: 'none',
                color: activeTab === tab.key ? '#faf6ef' : 'rgba(250,246,239,0.35)',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'color 0.3s',
              }}
            >
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="tab-underline"
                  style={{
                    position: 'absolute',
                    bottom: -1,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: '#c9a042',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* Swipe hint (mobile) */}
        <AnimatePresence>
          {isMobile && showHint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: 'center', padding: '6px 0', fontSize: 11, color: 'rgba(250,246,239,0.25)', fontFamily: 'Outfit, sans-serif', letterSpacing: '0.1em' }}
            >
              Swipe to switch
            </motion.div>
          )}
        </AnimatePresence>

        {/* Panel area */}
        <div style={{ overflow: 'hidden', marginTop: isMobile ? 20 : 32 }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeTab}
              custom={direction}
              initial={{ opacity: 0, x: direction * 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -80 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              drag={isMobile ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) switchTab('paediatric');
                if (info.offset.x > 60) switchTab('adult');
              }}
              style={{ touchAction: 'pan-y' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 3 }}>
                {items.map((s, i) => (
                  <ConditionCard key={`${activeTab}-${i}`} title={s.title} desc={s.desc} index={i + 1} isMobile={isMobile} delay={isMobile ? i * 0.03 : i * 0.04} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────
// PHILOSOPHY STRIP
// ─────────────────────────────────────────────

const PhilosophySection = () => {
  const { isMobile } = useBreakpoint();
  return (
    <section style={{ background: '#0a1f13', padding: isMobile ? '60px 20px' : '80px 48px', overflow: 'hidden' }}>
      <motion.div
        initial={{ x: isMobile ? 0 : 80, opacity: 0, y: isMobile ? 20 : 0 }}
        whileInView={{ x: 0, opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
        style={{
          maxWidth: 1240, margin: '0 auto',
          display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'center' : 'center',
          gap: isMobile ? 28 : 60,
          textAlign: isMobile ? 'center' : 'left',
        }}
      >
        {/* Icon */}
        <div style={{ flexShrink: 0 }}>
          <img src="/logo.png" alt="Elite Physio Clinics" style={{ width: isMobile ? 52 : 72, height: isMobile ? 52 : 72, opacity: 0.9, borderRadius: '50%', boxShadow: '0 0 0 2.5px rgba(201,160,66,0.45), 0 0 18px rgba(201,160,66,0.2)', filter: 'drop-shadow(0 0 8px rgba(201,160,66,0.25))' }} />
        </div>
        <blockquote style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: isMobile ? 20 : 'clamp(22px, 3vw, 34px)', fontWeight: 300, fontStyle: 'italic', color: 'rgba(250,246,239,0.88)', lineHeight: 1.55, margin: 0 }}>
          "We believe outstanding physiotherapy is built on clinical precision, genuine human connection, and a relentless commitment to getting you back to what you love."
        </blockquote>
        {!isMobile && (
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#c9a042', letterSpacing: '0.15em', fontFamily: 'Outfit, sans-serif' }}>Wafaa Ibrahim</div>
            <div style={{ fontSize: 11, color: 'rgba(250,246,239,0.35)', letterSpacing: '0.1em', fontFamily: 'Outfit, sans-serif', marginTop: 4 }}>Founder & Lead Physiotherapist</div>
          </div>
        )}
        {isMobile && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#c9a042', letterSpacing: '0.15em', fontFamily: 'Outfit, sans-serif' }}>Wafaa Ibrahim</div>
            <div style={{ fontSize: 11, color: 'rgba(250,246,239,0.35)', letterSpacing: '0.1em', fontFamily: 'Outfit, sans-serif', marginTop: 4 }}>Founder & Lead Physiotherapist</div>
          </div>
        )}
      </motion.div>
    </section>
  );
};

// ─────────────────────────────────────────────
// ABOUT
// ─────────────────────────────────────────────

const AboutSection = () => {
  const { isMobile, isTablet } = useBreakpoint();
  const px = isMobile ? '20px' : '48px';
  const py = isMobile ? '64px' : '120px';

  return (
    <section id="about" style={{ background: '#f5f0e8', padding: `${py} ${px}` }}>
      <div style={{
        maxWidth: 1240, margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: isMobile || isTablet ? '1fr' : '5fr 7fr',
        gap: isMobile ? 48 : 80,
        alignItems: 'center',
      }}>

        {/* Portrait card */}
        <motion.div
          initial={{ opacity: 0, x: isMobile ? 0 : -40, y: isMobile ? 20 : 0 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          style={{ position: 'relative', maxWidth: isMobile ? 320 : 'none', margin: isMobile ? '0 auto' : 0 }}
        >
          <div style={{ aspectRatio: '3/4', position: 'relative', overflow: 'hidden' }}>
            <img src="/dr-wafaa.webp" alt="Wafaa Ibrahim" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
            <div style={{ position: 'absolute', top: -1, right: -1, width: 44, height: 44, borderTop: '2px solid #c9a042', borderRight: '2px solid #c9a042' }} />
            <div style={{ position: 'absolute', bottom: -1, left: -1, width: 44, height: 44, borderBottom: '2px solid #c9a042', borderLeft: '2px solid #c9a042' }} />
          </div>

          {/* Floating badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            viewport={{ once: true }}
            style={{
              position: 'absolute',
              bottom: isMobile ? -16 : -24,
              right: isMobile ? -10 : -24,
              background: '#c9a042', padding: '18px 22px', borderRadius: 2,
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: isMobile ? 28 : 36, fontWeight: 600, color: '#0a1f13', lineHeight: 1 }}>20+</div>
            <div style={{ fontSize: 9, color: 'rgba(10,31,19,0.7)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif', marginTop: 4 }}>Years Experience</div>
          </motion.div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: isMobile ? 0 : 40, y: isMobile ? 20 : 0 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          style={{ paddingTop: isMobile ? 24 : 0 }}
        >
          <div style={{ fontSize: 11, color: '#c9a042', letterSpacing: '0.35em', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif', fontWeight: 600, marginBottom: 18 }}>
            ── MEET YOUR THERAPIST
          </div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: isMobile ? 40 : 'clamp(40px, 5vw, 60px)', fontWeight: 300, color: '#0a1f13', lineHeight: 1.05, margin: '0 0 24px' }}>
            The Expert<br />Behind <em style={{ fontStyle: 'italic' }}>Your Recovery</em>
          </h2>
          <div style={{ width: 44, height: 1, background: '#c9a042', marginBottom: 24 }} />
          <p style={{ fontSize: 14, lineHeight: 1.9, color: '#3d5a50', fontFamily: 'Outfit, sans-serif', fontWeight: 300, marginBottom: 32 }}>
            Wafaa Ibrahim is a Chartered Physiotherapist with over 20 years of experience as a Musculoskeletal specialist. Holding both a Doctor of Physiotherapy and a Master's degree from Coventry University, she brings world-class clinical expertise to every patient encounter.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
            {CREDENTIALS.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 * i, duration: 0.5 }}
                viewport={{ once: true }}
                style={{ display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <CheckCircle size={13} color={c.highlight ? '#c9a042' : 'rgba(45,106,79,0.6)'} />
                <span style={{ fontSize: 13, color: c.highlight ? '#0a1f13' : '#3d5a50', fontFamily: 'Outfit, sans-serif', fontWeight: c.highlight ? 500 : 400 }}>{c.label}</span>
              </motion.div>
            ))}
          </div>

          <a href="#contact" className="btn-primary"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: '#0a1f13', color: '#faf6ef',
              padding: '15px 32px', borderRadius: 2, textDecoration: 'none',
              fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase',
              fontFamily: 'Outfit, sans-serif', fontWeight: 600,
            }}
          >
            <Phone size={13} /> Book a Consultation
          </a>
        </motion.div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────
// CLINIC GALLERY
// ─────────────────────────────────────────────

const CLINIC_IMAGES = [
  { src: '/clinic/treatment-room-1.jpg', label: 'Treatment Room' },
  { src: '/clinic/waiting-room.jpg', label: 'Waiting Area' },
  { src: '/clinic/hallway.jpg', label: 'Our Clinic' },
  { src: '/clinic/reception.jpg', label: 'Reception' },
  { src: '/clinic/treatment-room-2.jpg', label: 'Treatment Suite' },
];

const ClinicGallerySection = () => {
  const { isMobile } = useBreakpoint();
  const imgW = isMobile ? 220 : 320;
  const imgH = isMobile ? 160 : 220;
  const gap = 20;
  const images = [...CLINIC_IMAGES, ...CLINIC_IMAGES]; // duplicate for seamless loop

  return (
    <section style={{
      background: '#0a1f13',
      padding: isMobile ? '48px 0' : '80px 0',
      borderTop: '1px solid rgba(201,160,66,0.1)',
      borderBottom: '1px solid rgba(201,160,66,0.1)',
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        style={{ textAlign: 'center', marginBottom: isMobile ? 32 : 52, padding: '0 20px' }}
      >
        <div style={{ fontSize: 11, color: '#c9a042', letterSpacing: '0.35em', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif', fontWeight: 600, marginBottom: 16 }}>
          ── OUR CLINIC
        </div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: isMobile ? 36 : 'clamp(40px, 5vw, 56px)', fontWeight: 300, color: '#faf6ef', margin: 0, lineHeight: 1.1 }}>
          Your <em style={{ color: '#c9a042' }}>Environment</em>
        </h2>
      </motion.div>

      {/* Marquee container */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Left fade mask */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: 0, width: isMobile ? 40 : 80,
          background: 'linear-gradient(to right, #0a1f13, transparent)',
          zIndex: 2, pointerEvents: 'none',
        }} />
        {/* Right fade mask */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0, right: 0, width: isMobile ? 40 : 80,
          background: 'linear-gradient(to left, #0a1f13, transparent)',
          zIndex: 2, pointerEvents: 'none',
        }} />

        {/* Scrolling track */}
        <div style={{
          display: 'flex',
          gap,
          animation: 'marquee 35s linear infinite',
          width: 'fit-content',
        }}>
          {images.map((img, i) => (
            <div key={i} style={{
              position: 'relative',
              width: imgW, height: imgH,
              flexShrink: 0,
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid rgba(201,160,66,0.15)',
            }}>
              <img
                src={img.src}
                alt={img.label}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────
// WHY CHOOSE US
// ─────────────────────────────────────────────

const WhySection = () => {
  const { isMobile, isTablet } = useBreakpoint();
  const cols = isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)';
  const px = isMobile ? '20px' : '48px';
  const py = isMobile ? '64px' : '120px';

  const pillars = [
    { icon: Shield, title: 'NHS-Trained Expertise', desc: 'Over five years within the National Health Service — clinical precision you can trust.' },
    { icon: Heart, title: 'Truly Personal Care', desc: 'No generic protocols. Every plan is crafted around your specific condition and goals.' },
    { icon: Award, title: 'Recognised Qualifications', desc: 'DPT-qualified, MCSP registered, and accepted by 9 major insurance providers.' },
    { icon: Star, title: 'Flexible Hours', desc: 'Evening and Saturday appointments — because your recovery shouldn\'t wait.' },
  ];

  return (
    <section style={{ background: '#0f2a1a', padding: `${py} ${px}` }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 72 }}
        >
          <div style={{ fontSize: 11, color: '#c9a042', letterSpacing: '0.35em', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif', fontWeight: 600, marginBottom: 16 }}>
            ── OUR DIFFERENCE
          </div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: isMobile ? 38 : 'clamp(40px, 5vw, 60px)', fontWeight: 300, color: '#faf6ef', margin: 0 }}>
            Why Patients Choose <em>Elite</em>
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: cols, gap: isMobile ? 3 : 2 }}>
          {pillars.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: isMobile ? 0 : i * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              style={{
                padding: isMobile ? '28px 20px' : '44px 32px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(201,160,66,0.1)',
                position: 'relative',
              }}
            >
              <div style={{ width: 40, height: 40, border: '1px solid rgba(201,160,66,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: isMobile ? 16 : 24 }}>
                <p.icon size={16} color="#c9a042" />
              </div>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: isMobile ? 17 : 20, fontWeight: 500, color: '#faf6ef', margin: '0 0 10px', lineHeight: 1.2 }}>
                {p.title}
              </h3>
              <p style={{ fontSize: 12, color: 'rgba(250,246,239,0.4)', lineHeight: 1.7, margin: 0, fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                {p.desc}
              </p>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 28, height: 2, background: '#c9a042' }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────
// INSURANCE
// ─────────────────────────────────────────────

const InsuranceSection = () => {
  const { isMobile } = useBreakpoint();
  return (
    <section id="insurance" style={{ background: '#070d0e', padding: isMobile ? '60px 20px' : '100px 48px', borderTop: '1px solid rgba(201,160,66,0.1)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          style={{ marginBottom: 40 }}
        >
          <div style={{ fontSize: 11, color: '#c9a042', letterSpacing: '0.35em', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif', fontWeight: 600, marginBottom: 16 }}>
            ── REGISTERED PROVIDER
          </div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: isMobile ? 32 : 'clamp(32px, 4vw, 48px)', fontWeight: 300, color: '#faf6ef', margin: 0 }}>
            Accepted Insurance Partners
          </h2>
        </motion.div>
        <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,160,66,0.3) 20%, rgba(201,160,66,0.3) 80%, transparent)', marginBottom: 48 }} />
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: isMobile ? 12 : 16,
          maxWidth: 900,
          margin: '0 auto',
        }}>
          {INSURANCE.map((ins, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: isMobile ? 0 : i * 0.05, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ borderColor: 'rgba(201,160,66,0.45)', background: 'rgba(255,255,255,0.06)' }}
              style={{
                padding: isMobile ? '20px 16px' : '28px 24px',
                border: '1px solid rgba(201,160,66,0.12)',
                background: 'rgba(255,255,255,0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                cursor: 'default',
                minHeight: isMobile ? 70 : 80,
              }}
            >
              <img
                src={ins.logo}
                alt={ins.name}
                style={{
                  maxWidth: isMobile ? 100 : 130,
                  maxHeight: isMobile ? 36 : 44,
                  objectFit: 'contain',
                  filter: (ins as any).noInvert ? 'none' : 'brightness(0) invert(1)',
                  opacity: (ins as any).noInvert ? 0.85 : 0.6,
                  transition: 'opacity 0.3s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.opacity = (ins as any).noInvert ? '1' : '0.9'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.opacity = (ins as any).noInvert ? '0.85' : '0.6'; }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────
// CONTACT
// ─────────────────────────────────────────────

const ContactSection = () => {
  const { isMobile, isTablet } = useBreakpoint();
  const { hours: clinicHours } = useClinicHours();
  const px = isMobile ? '20px' : '48px';
  const py = isMobile ? '64px' : '120px';

  const formatHoursDisplay = () => {
    const fmt = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      const p = h >= 12 ? 'PM' : 'AM';
      return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} ${p}`;
    };
    const lines: string[] = [];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    // Group consecutive days with same hours
    let i = 0;
    while (i < days.length) {
      const h = clinicHours[days[i]];
      if (!h) { i++; continue; }
      let j = i;
      while (j + 1 < days.length) {
        const next = clinicHours[days[j + 1]];
        if (next && next.start === h.start && next.end === h.end) j++;
        else break;
      }
      const label = i === j ? days[i].substring(0, 3) : `${days[i].substring(0, 3)} – ${days[j].substring(0, 3)}`;
      lines.push(`${label} · ${fmt(h.start)} – ${fmt(h.end)}`);
      i = j + 1;
    }
    return lines.join('\n') || 'Contact us for hours';
  };

  const details = [
    { icon: MapPin, label: 'Location', value: 'Mare Fair, Sol Central\nGround Floor, Unit 3\nNorthampton NN1 1SR' },
    { icon: Phone, label: 'Phone', value: '+44 333 577 9553', href: 'tel:+443335779553' },
    { icon: MessageCircle, label: 'WhatsApp', value: '+44 7405 825954', href: WHATSAPP_URL },
    { icon: Mail, label: 'Email', value: 'elitephysioclinics@gmail.com', href: 'mailto:elitephysioclinics@gmail.com' },
    { icon: Clock, label: 'Hours', value: formatHoursDisplay() },
  ];

  return (
    <section id="contact" style={{ background: '#0a1f13', padding: `${py} ${px}` }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{ marginBottom: isMobile ? 40 : 72 }}
        >
          <div style={{ fontSize: 11, color: '#c9a042', letterSpacing: '0.35em', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif', fontWeight: 600, marginBottom: 16 }}>
            ── GET IN TOUCH
          </div>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-end', gap: 20 }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: isMobile ? 44 : 'clamp(48px, 6vw, 72px)', fontWeight: 300, color: '#faf6ef', margin: 0, lineHeight: 1 }}>
              Begin Your<br /><em style={{ color: '#c9a042' }}>Recovery</em>
            </h2>
            {!isMobile && (
              <div style={{ maxWidth: 360, fontSize: 14, color: 'rgba(250,246,239,0.45)', fontFamily: 'Outfit, sans-serif', fontWeight: 300, lineHeight: 1.8 }}>
                Ready to take the first step? Reach out to book your initial assessment with Wafaa Ibrahim.
              </div>
            )}
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 1.4fr', gap: isMobile ? 48 : 80 }}>

          {/* Contact details */}
          <motion.div
            initial={{ opacity: 0, x: isMobile ? 0 : -30, y: isMobile ? 16 : 0 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 24 : 32 }}>
              {details.map(({ icon: Icon, label, value, href }, i) => {
                const content = (
                  <>
                    <div style={{ width: 40, height: 40, border: '1px solid rgba(201,160,66,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'border-color 0.2s' }}>
                      <Icon size={14} color="#c9a042" />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'rgba(201,160,66,0.55)', letterSpacing: '0.25em', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 13, color: 'rgba(250,246,239,0.72)', fontFamily: 'Outfit, sans-serif', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{value}</div>
                    </div>
                  </>
                );
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * i, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    {href ? (
                      <a
                        href={href}
                        target={label === 'WhatsApp' ? '_blank' : undefined}
                        rel={label === 'WhatsApp' ? 'noopener noreferrer' : undefined}
                        style={{ display: 'flex', gap: 16, alignItems: 'flex-start', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '0.8'; const box = e.currentTarget.querySelector('div') as HTMLElement; if (box) box.style.borderColor = 'rgba(201,160,66,0.5)'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; const box = e.currentTarget.querySelector('div') as HTMLElement; if (box) box.style.borderColor = 'rgba(201,160,66,0.2)'; }}
                      >
                        {content}
                      </a>
                    ) : (
                      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                        {content}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Google Map */}
            <a
              href="https://maps.app.goo.gl/WhAb8a7Bya6Tz5K38"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                marginTop: isMobile ? 24 : 32,
                position: 'relative',
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid rgba(201,160,66,0.15)',
                aspectRatio: isMobile ? '3/2' : '2/1',
                cursor: 'pointer',
              }}
            >
              <iframe
                title="Elite Physio Clinics Location"
                src="https://maps.google.com/maps?q=Mare+Fair,+Sol+Central+Ground+Floor,+Unit+3+Northampton+NN1+1SR&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{
                  border: 0,
                  filter: 'invert(90%) hue-rotate(180deg)',
                  display: 'block',
                  pointerEvents: 'none',
                }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              {/* "Open in Maps" overlay */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: '16px 12px 8px',
                background: 'linear-gradient(to top, rgba(10,31,19,0.85), transparent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <MapPin size={12} color="rgba(201,160,66,0.8)" />
                <span style={{ fontSize: 10, color: 'rgba(201,160,66,0.8)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}>
                  Open in Maps
                </span>
              </div>
              {/* Gold corner accents */}
              <div style={{ position: 'absolute', top: -1, right: -1, width: 28, height: 28, borderTop: '2px solid rgba(201,160,66,0.4)', borderRight: '2px solid rgba(201,160,66,0.4)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -1, left: -1, width: 28, height: 28, borderBottom: '2px solid rgba(201,160,66,0.4)', borderLeft: '2px solid rgba(201,160,66,0.4)', pointerEvents: 'none' }} />
            </a>
          </motion.div>

          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: isMobile ? 0 : 30, y: isMobile ? 16 : 0 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: isMobile ? 0 : 0.15 }}
            viewport={{ once: true }}
          >
            <BookingForm isMobile={isMobile} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────

const Footer = () => {
  const { isMobile } = useBreakpoint();
  return (
    <footer style={{ background: '#070d0e', borderTop: '1px solid rgba(201,160,66,0.1)', padding: isMobile ? '32px 20px' : '40px 48px' }}>
      <div style={{
        maxWidth: 1240, margin: '0 auto',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: isMobile ? 16 : 0,
        textAlign: isMobile ? 'center' : 'left',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="Elite Physio Clinics" style={{ width: 28, height: 28, opacity: 0.7, borderRadius: '50%', boxShadow: '0 0 0 1.5px rgba(201,160,66,0.3), 0 0 8px rgba(201,160,66,0.1)' }} />
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 13, color: 'rgba(250,246,239,0.35)', letterSpacing: '0.12em' }}>
            ELITE PHYSIO CLINICS
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(250,246,239,0.18)', fontFamily: 'Outfit, sans-serif', letterSpacing: '0.08em' }}>
          © {new Date().getFullYear()} Elite Physio Clinics · Northampton, UK
        </div>
        <div style={{ display: 'flex', gap: isMobile ? 20 : 28, flexWrap: 'wrap', justifyContent: 'center' }}>
          {NAV_LINKS.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`}
              style={{ fontSize: 11, color: 'rgba(250,246,239,0.28)', textDecoration: 'none', letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif', transition: 'color 0.3s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(201,160,66,0.7)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,246,239,0.28)')}
            >{l}</a>
          ))}
          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 11, color: 'rgba(250,246,239,0.28)', textDecoration: 'none', letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif', transition: 'color 0.3s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(201,160,66,0.7)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,246,239,0.28)')}
          >Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};

// ─────────────────────────────────────────────
// WHATSAPP FLOATING BUTTON
// ─────────────────────────────────────────────

const WhatsAppButton = () => (
  <motion.a
    href={WHATSAPP_URL}
    target="_blank"
    rel="noopener noreferrer"
    title="Chat on WhatsApp"
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 1.5, duration: 0.4, type: 'spring', stiffness: 260, damping: 20 }}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    className="whatsapp-float"
    style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: '#25D366',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 14px rgba(37,211,102,0.4)',
      zIndex: 9999,
      cursor: 'pointer',
      textDecoration: 'none',
    }}
  >
    <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  </motion.a>
);

// ─────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────

function Website() {
  return (
    <div style={{ fontFamily: 'Outfit, sans-serif', background: '#0a1f13' }}>
      <NavBar />
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <PhilosophySection />
      <AboutSection />
      <ClinicGallerySection />
      <WhySection />
      <InsuranceSection />
      <ContactSection />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/*" element={<Website />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/clinic-portal/login" element={<LoginForm />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/clinic-portal" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="appointments" element={<AppointmentList />} />
          <Route path="new" element={<CreateAppointment />} />
          <Route path="availability" element={<AvailabilityManager />} />
          <Route path="hours" element={<WorkingHours />} />
        </Route>
      </Route>
    </Routes>
  );
}
