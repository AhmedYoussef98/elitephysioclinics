import React from 'react';
import { motion } from 'framer-motion';

interface PatientDetailsProps {
  name: string;
  phone: string;
  email: string;
  consent: boolean;
  onChange: (field: string, value: string | boolean) => void;
  errors: Record<string, string>;
  isMobile: boolean;
}

const inputStyle = (hasError: boolean) => ({
  width: '100%',
  background: 'rgba(255,255,255,0.03)',
  border: `1px solid ${hasError ? 'rgba(220,60,60,0.6)' : 'rgba(201,160,66,0.13)'}`,
  padding: '15px 18px',
  color: '#faf6ef',
  fontSize: 14,
  fontFamily: 'Outfit, sans-serif',
  outline: 'none',
  transition: 'border-color 0.3s',
});

export const PatientDetails: React.FC<PatientDetailsProps> = ({ name, phone, email, consent, onChange, errors, isMobile }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <h3 style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: isMobile ? 26 : 32,
        fontWeight: 300,
        color: '#faf6ef',
        marginBottom: 8,
        lineHeight: 1.1,
      }}>
        Your <em style={{ color: '#c9a042' }}>Details</em>
      </h3>
      <p style={{
        fontSize: 13,
        color: 'rgba(250,246,239,0.45)',
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 300,
        marginBottom: 24,
        lineHeight: 1.6,
      }}>
        Please provide your contact information to complete the booking.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Name */}
        <div>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={e => onChange('patientName', e.target.value)}
            maxLength={100}
            style={inputStyle(!!errors.patientName)}
          />
          {errors.patientName && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 12, color: '#e55', fontFamily: 'Outfit, sans-serif', marginTop: 4 }}>
              {errors.patientName}
            </motion.p>
          )}
        </div>

        {/* Phone */}
        <div>
          <input
            type="tel"
            placeholder="+44 7700 900123"
            value={phone}
            onChange={e => onChange('patientPhone', e.target.value)}
            style={inputStyle(!!errors.patientPhone)}
          />
          {errors.patientPhone && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 12, color: '#e55', fontFamily: 'Outfit, sans-serif', marginTop: 4 }}>
              {errors.patientPhone}
            </motion.p>
          )}
        </div>

        {/* Email */}
        <div>
          <input
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={e => onChange('patientEmail', e.target.value)}
            style={inputStyle(!!errors.patientEmail)}
          />
          {errors.patientEmail && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 12, color: '#e55', fontFamily: 'Outfit, sans-serif', marginTop: 4 }}>
              {errors.patientEmail}
            </motion.p>
          )}
        </div>

        {/* Consent */}
        <div style={{ marginTop: 4 }}>
          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={consent}
              onChange={e => onChange('consent', e.target.checked)}
              style={{
                marginTop: 3,
                accentColor: '#c9a042',
                width: 16,
                height: 16,
                flexShrink: 0,
              }}
            />
            <span style={{
              fontSize: 12,
              color: 'rgba(250,246,239,0.55)',
              fontFamily: 'Outfit, sans-serif',
              lineHeight: 1.6,
            }}>
              I consent to Elite Physio Clinics processing my personal data for the purpose of booking this appointment.{' '}
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#c9a042', textDecoration: 'underline' }}
              >
                Privacy Policy
              </a>
            </span>
          </label>
          {errors.consent && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 12, color: '#e55', fontFamily: 'Outfit, sans-serif', marginTop: 4, marginLeft: 26 }}>
              {errors.consent}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
