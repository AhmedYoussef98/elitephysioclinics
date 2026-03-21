import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import { Calendar, CheckCircle, XCircle, Clock, Users, ArrowRight, TrendingUp } from 'lucide-react';

interface Appointment {
  id: string;
  booking_reference: string;
  patient_name: string;
  patient_phone: string;
  condition_title: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
}

interface Stats {
  todayTotal: number;
  todayConfirmed: number;
  todayCompleted: number;
  todayCancelled: number;
  weekTotal: number;
  weekConfirmed: number;
}

const STATUS_DOT: Record<string, string> = {
  confirmed: '#22c55e',
  cancelled: '#ef4444',
  completed: '#3b82f6',
  rescheduled: '#f59e0b',
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [recentBookings, setRecentBookings] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<Stats>({ todayTotal: 0, todayConfirmed: 0, todayCompleted: 0, todayCancelled: 0, weekTotal: 0, weekConfirmed: 0 });
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndStr = weekEnd.toISOString().split('T')[0];

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      const [todayRes, upcomingRes, recentRes] = await Promise.all([
        supabase.from('appointments').select('*').eq('date', todayStr).order('start_time'),
        supabase.from('appointments').select('*').gt('date', todayStr).lte('date', weekEndStr).eq('status', 'confirmed').order('date').order('start_time').limit(8),
        supabase.from('appointments').select('*').order('created_at', { ascending: false }).limit(5),
      ]);

      const today = todayRes.data || [];
      setTodayAppointments(today);
      setUpcomingAppointments(upcomingRes.data || []);
      setRecentBookings(recentRes.data || []);

      setStats({
        todayTotal: today.length,
        todayConfirmed: today.filter(a => a.status === 'confirmed').length,
        todayCompleted: today.filter(a => a.status === 'completed').length,
        todayCancelled: today.filter(a => a.status === 'cancelled').length,
        weekTotal: (upcomingRes.data || []).length,
        weekConfirmed: (upcomingRes.data || []).filter(a => a.status === 'confirmed').length,
      });

      setLoading(false);
    };
    fetchAll();
  }, []);

  const formatTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const p = h >= 12 ? 'PM' : 'AM';
    return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} ${p}`;
  };

  const formatDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const todayDate = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  if (loading) {
    return <div className="dash-loading"><div className="admin-spinner" /><p>Loading dashboard...</p></div>;
  }

  return (
    <div className="dash">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h2 className="dash-title">Dashboard</h2>
          <p className="dash-date">{todayDate}</p>
        </div>
        <button className="admin-btn-gold" onClick={() => navigate('/clinic-portal/new')}>
          <span className="btn-icon">+</span> New Appointment
        </button>
      </div>

      {/* Stat Cards */}
      <div className="dash-stats">
        <div className="dash-stat-card dash-stat-primary">
          <div className="dash-stat-icon"><Calendar size={20} /></div>
          <div className="dash-stat-body">
            <span className="dash-stat-value">{stats.todayTotal}</span>
            <span className="dash-stat-label">Today's Appointments</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon dash-stat-icon-green"><CheckCircle size={20} /></div>
          <div className="dash-stat-body">
            <span className="dash-stat-value">{stats.todayConfirmed}</span>
            <span className="dash-stat-label">Confirmed Today</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon dash-stat-icon-blue"><TrendingUp size={20} /></div>
          <div className="dash-stat-body">
            <span className="dash-stat-value">{stats.todayCompleted}</span>
            <span className="dash-stat-label">Completed Today</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon dash-stat-icon-amber"><Users size={20} /></div>
          <div className="dash-stat-body">
            <span className="dash-stat-value">{stats.weekTotal}</span>
            <span className="dash-stat-label">This Week</span>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        {/* Today's Schedule */}
        <div className="dash-card dash-card-wide">
          <div className="dash-card-header">
            <h3><Clock size={16} /> Today's Schedule</h3>
            <button className="dash-card-link" onClick={() => navigate('/clinic-portal/appointments')}>View all <ArrowRight size={13} /></button>
          </div>
          {todayAppointments.length === 0 ? (
            <div className="dash-card-empty">
              <Calendar size={32} strokeWidth={1} />
              <p>No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="dash-timeline">
              {todayAppointments.map(apt => (
                <div key={apt.id} className="dash-timeline-item">
                  <div className="dash-timeline-time">
                    <span className="dash-time-primary">{formatTime(apt.start_time)}</span>
                    <span className="dash-time-end">{formatTime(apt.end_time)}</span>
                  </div>
                  <div className="dash-timeline-dot" style={{ background: STATUS_DOT[apt.status] || '#64748b' }} />
                  <div className="dash-timeline-content">
                    <span className="dash-timeline-name">{apt.patient_name}</span>
                    <span className="dash-timeline-condition">{apt.condition_title}</span>
                  </div>
                  <span className={`dash-badge dash-badge-${apt.status}`}>{apt.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="dash-sidebar">
          {/* Upcoming */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h3><Calendar size={16} /> Upcoming</h3>
            </div>
            {upcomingAppointments.length === 0 ? (
              <p className="dash-card-empty-sm">No upcoming appointments this week</p>
            ) : (
              <div className="dash-upcoming-list">
                {upcomingAppointments.map(apt => (
                  <div key={apt.id} className="dash-upcoming-item">
                    <div className="dash-upcoming-date">{formatDate(apt.date)}</div>
                    <div className="dash-upcoming-detail">
                      <span className="dash-upcoming-name">{apt.patient_name}</span>
                      <span className="dash-upcoming-time">{formatTime(apt.start_time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Bookings */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h3><TrendingUp size={16} /> Recent Bookings</h3>
            </div>
            {recentBookings.length === 0 ? (
              <p className="dash-card-empty-sm">No recent bookings</p>
            ) : (
              <div className="dash-recent-list">
                {recentBookings.map(apt => (
                  <div key={apt.id} className="dash-recent-item">
                    <div className="dash-recent-left">
                      <span className="dash-recent-ref">{apt.booking_reference}</span>
                      <span className="dash-recent-name">{apt.patient_name}</span>
                    </div>
                    <span className="dash-recent-time">{timeAgo(apt.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
