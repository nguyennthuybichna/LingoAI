import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  LayoutGrid,
  LogIn,
  LogOut,
  Settings,
  Sparkles,
  User,
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { user, logoutUser } = useAuth();

  const isWorkspace = location.pathname === '/workspace';
  const isGlossary = location.pathname === '/glossary';
  const isHistory = location.pathname === '/history';
  const isProfile = location.pathname === '/profile';

  const handleLogout = (e) => {
    e.preventDefault();
    logoutUser();
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <Logo size="sm" />
      </div>

      <nav className="sidebar__nav">
        <Link
          to="/workspace"
          className={`sidebar__link ${isWorkspace ? 'sidebar__link--active' : ''}`}
        >
          <LayoutGrid size={18} />
          <span>Workspace</span>
        </Link>
        <Link
          to="/glossary"
          className={`sidebar__link ${isGlossary ? 'sidebar__link--active' : ''}`}
        >
          <BookOpen size={18} />
          <span>Glossary</span>
        </Link>
        <Link
          to="/history"
          className={`sidebar__link ${isHistory ? 'sidebar__link--active' : ''}`}
        >
          <Clock size={18} />
          <span>History</span>
        </Link>
        {user && (
          <Link
            to="/profile"
            className={`sidebar__link ${isProfile ? 'sidebar__link--active' : ''}`}
          >
            <User size={18} />
            <span>Profile</span>
          </Link>
        )}
      </nav>

      <div className="sidebar__bottom">
        {isHistory ? (
          <Link
            to="/workspace"
            className="btn btn--primary btn--block btn--sm"
            style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.4rem', textDecoration: 'none' }}
          >
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              border: '1.5px solid #fff',
              fontSize: '9px',
              fontWeight: '900',
              lineHeight: 1
            }}>+</span>
            <span>New Translation</span>
          </Link>
        ) : (
          <button type="button" className="sidebar__link sidebar__link--ghost" style={{ border: 'none', width: '100%', background: 'none', display: 'flex', alignItems: 'center' }}>
            <Settings size={18} />
            <span>Settings</span>
          </button>
        )}
        {user ? (
          <button
            onClick={handleLogout}
            className="sidebar__logout"
            style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center' }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        ) : (
          <Link
            to="/login"
            className="sidebar__login"
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}
          >
            <LogIn size={18} />
            <span>Login / Register</span>
          </Link>
        )}
      </div>

    </aside>
  );
}

