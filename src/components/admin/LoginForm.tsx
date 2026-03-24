import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/clinic-portal';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background decoration */}
      <div className="login-bg-pattern" />
      <div className="login-bg-glow" />

      <div className="login-container">
        {/* Brand */}
        <div className="login-brand">
          <img src="/logo.png" alt="Elite Physio Clinics" className="login-logo-img" />
          <h1 className="login-title">Elite Physio Clinics</h1>
          <div className="login-divider" />
          <p className="login-subtitle">Administration Portal</p>
        </div>

        {/* Form card */}
        <div className="login-card">
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="email">
                <Mail size={14} />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@elitephysioclinics.co.uk"
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">
                <Lock size={14} />
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="login-error">
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (
                <><div className="admin-spinner" style={{ width: 16, height: 16, borderWidth: 2, marginBottom: 0 }} /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>

        <p className="login-footer">Secure access for authorised personnel only</p>
      </div>
    </div>
  );
};
