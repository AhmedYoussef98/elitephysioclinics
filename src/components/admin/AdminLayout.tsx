import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { LogOut, LayoutDashboard, Calendar, Clock, PlusCircle, Menu, X, Settings } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/clinic-portal/login');
  };

  const navItems = [
    { to: '/clinic-portal', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/clinic-portal/appointments', icon: Calendar, label: 'Appointments', end: false },
    { to: '/clinic-portal/new', icon: PlusCircle, label: 'New Booking', end: false },
    { to: '/clinic-portal/availability', icon: Clock, label: 'Availability', end: false },
    { to: '/clinic-portal/hours', icon: Settings, label: 'Working Hours', end: false },
  ];

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo">
            <span className="admin-logo-mark">EP</span>
          </div>
          <div className="admin-sidebar-brand-text">
            <span className="admin-sidebar-title">Elite Physio</span>
            <span className="admin-sidebar-badge">Admin Portal</span>
          </div>
          <button className="admin-sidebar-close" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div className="admin-sidebar-avatar">{user?.email?.[0]?.toUpperCase() || 'A'}</div>
            <div className="admin-sidebar-user-info">
              <span className="admin-sidebar-user-email">{user?.email}</span>
              <span className="admin-sidebar-user-role">Administrator</span>
            </div>
          </div>
          <button onClick={handleSignOut} className="admin-sidebar-logout" title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="admin-topbar-menu" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="admin-topbar-right">
            <span className="admin-topbar-greeting">Welcome back</span>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
