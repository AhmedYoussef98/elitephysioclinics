import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AppointmentActions } from './AppointmentActions';
import { Search, Filter, Calendar } from 'lucide-react';

interface Appointment {
  id: string;
  booking_reference: string;
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  condition_slug: string;
  condition_title: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#22c55e',
  cancelled: '#ef4444',
  completed: '#3b82f6',
  rescheduled: '#f59e0b',
};

export const AppointmentList: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    let query = supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: false })
      .order('start_time', { ascending: true });

    if (statusFilter !== 'all') query = query.eq('status', statusFilter);
    if (dateFrom) query = query.gte('date', dateFrom);
    if (dateTo) query = query.lte('date', dateTo);

    const { data, error } = await query;
    if (!error && data) setAppointments(data);
    setLoading(false);
  };

  useEffect(() => { fetchAppointments(); }, [statusFilter, dateFrom, dateTo]);

  const filtered = search
    ? appointments.filter(a =>
        a.patient_name.toLowerCase().includes(search.toLowerCase()) ||
        a.booking_reference.toLowerCase().includes(search.toLowerCase()) ||
        a.patient_phone.includes(search) ||
        a.condition_title.toLowerCase().includes(search.toLowerCase())
      )
    : appointments;

  const formatTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const p = h >= 12 ? 'PM' : 'AM';
    return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} ${p}`;
  };

  const formatDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });

  const statusCounts = {
    all: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    rescheduled: appointments.filter(a => a.status === 'rescheduled').length,
  };

  return (
    <div className="apt-page">
      <div className="apt-header">
        <h2 className="admin-page-title">Appointments</h2>
        <span className="apt-count">{filtered.length} total</span>
      </div>

      {/* Status filter tabs */}
      <div className="apt-status-tabs">
        {(['all', 'confirmed', 'completed', 'cancelled', 'rescheduled'] as const).map(status => (
          <button
            key={status}
            className={`apt-status-tab ${statusFilter === status ? 'active' : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            {status !== 'all' && <span className="apt-tab-dot" style={{ background: STATUS_COLORS[status] }} />}
            <span className="apt-tab-label">{status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}</span>
            <span className="apt-tab-count">{statusCounts[status]}</span>
          </button>
        ))}
      </div>

      {/* Search and date filters */}
      <div className="apt-toolbar">
        <div className="apt-search">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search by name, reference, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="apt-date-filters">
          <div className="apt-date-field">
            <Calendar size={13} />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <span className="apt-date-sep">to</span>
          <div className="apt-date-field">
            <Calendar size={13} />
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          {(dateFrom || dateTo) && (
            <button className="apt-clear-dates" onClick={() => { setDateFrom(''); setDateTo(''); }}>Clear</button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="apt-loading"><div className="admin-spinner" /> Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="apt-empty">
          <Filter size={36} strokeWidth={1} />
          <p>No appointments match your filters</p>
        </div>
      ) : (
        <div className="apt-table-container">
          <table className="apt-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Date</th>
                <th>Time</th>
                <th>Patient</th>
                <th>Phone</th>
                <th>Condition</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(apt => (
                <tr key={apt.id}>
                  <td><code className="apt-ref">{apt.booking_reference}</code></td>
                  <td className="apt-date-cell">{formatDate(apt.date)}</td>
                  <td className="apt-time-cell">{formatTime(apt.start_time)} <span className="apt-time-dim">- {formatTime(apt.end_time)}</span></td>
                  <td className="apt-name-cell">
                    <span className="apt-patient-name">{apt.patient_name}</span>
                    <span className="apt-patient-email">{apt.patient_email}</span>
                  </td>
                  <td>{apt.patient_phone}</td>
                  <td><span className="apt-condition">{apt.condition_title}</span></td>
                  <td>
                    <span className="apt-status" style={{ '--status-color': STATUS_COLORS[apt.status] || '#666' } as React.CSSProperties}>
                      <span className="apt-status-dot" />
                      {apt.status}
                    </span>
                  </td>
                  <td>
                    <AppointmentActions appointment={apt} onUpdate={fetchAppointments} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
