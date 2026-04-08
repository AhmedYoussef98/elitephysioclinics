import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { CONDITIONS } from '../../lib/constants';

interface ConditionSelectProps {
  value: string;
  onChange: (slug: string) => void;
  onNext: () => void;
  isMobile: boolean;
}

export const ConditionSelect: React.FC<ConditionSelectProps> = ({ value, onChange, onNext, isMobile }) => {
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!value) {
      setError('Please select a condition to continue');
      return;
    }
    setError('');
    onNext();
  };

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
        Select Your <em style={{ color: '#c9a042' }}>Condition</em>
      </h3>
      <p style={{
        fontSize: 13,
        color: 'rgba(250,246,239,0.45)',
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 300,
        marginBottom: 24,
        lineHeight: 1.6,
      }}>
        Choose the condition you'd like to be treated for.
      </p>

      <div style={{ position: 'relative', marginBottom: 20 }}>
        <select
          value={value}
          onChange={(e) => { onChange(e.target.value); setError(''); }}
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${error ? 'rgba(220,60,60,0.6)' : 'rgba(201,160,66,0.13)'}`,
            padding: '15px 44px 15px 18px',
            color: value ? '#faf6ef' : 'rgba(250,246,239,0.45)',
            fontSize: 14,
            fontFamily: 'Outfit, sans-serif',
            outline: 'none',
            appearance: 'none',
            cursor: 'pointer',
            transition: 'border-color 0.3s',
          }}
        >
          <option value="" style={{ background: '#0a1f13' }}>Select your condition</option>
          <optgroup label="Adult Conditions" style={{ background: '#0a1f13', color: '#c9a042', fontWeight: 600 }}>
            {CONDITIONS.filter(c => c.category === 'adult').map(c => (
              <option key={c.slug} value={c.slug} style={{ background: '#0a1f13', color: '#faf6ef', fontWeight: 400 }}>
                {c.title}
              </option>
            ))}
          </optgroup>
          <optgroup label="Children's Conditions" style={{ background: '#0a1f13', color: '#c9a042', fontWeight: 600 }}>
            {CONDITIONS.filter(c => c.category === 'paediatric').map(c => (
              <option key={c.slug} value={c.slug} style={{ background: '#0a1f13', color: '#faf6ef', fontWeight: 400 }}>
                {c.title}
              </option>
            ))}
          </optgroup>
          {CONDITIONS.filter(c => !c.category).map(c => (
            <option key={c.slug} value={c.slug} style={{ background: '#0a1f13' }}>
              {c.title}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          color="rgba(250,246,239,0.35)"
          style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        />
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: 12, color: '#e55', fontFamily: 'Outfit, sans-serif', marginBottom: 16 }}
        >
          {error}
        </motion.p>
      )}

      <button
        onClick={handleNext}
        className="btn-primary"
        style={{
          width: isMobile ? '100%' : 'auto',
          background: '#c9a042',
          color: '#0a1f13',
          border: 'none',
          padding: '14px 32px',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase' as const,
          fontFamily: 'Outfit, sans-serif',
          cursor: 'pointer',
          borderRadius: 2,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        Next <ArrowRight size={13} />
      </button>
    </motion.div>
  );
};
