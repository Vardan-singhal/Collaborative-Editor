import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Moon, Sun } from 'lucide-react';

export default function Navbar({ user }) {
  const nav = useNavigate();
  const [collapsed, setCollapsed] = useState(true); // For toggling collapse

  const logout = async () => {
    await signOut(auth);
    nav('/'); // Redirect to LandingPage
  };

  // Theme toggle logic
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.body.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-4" to="/">
          DocsClone
        </Link>

        {/* Hamburger toggler */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-controls="navbarSupportedContent"
          aria-expanded={!collapsed}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible menu */}
        <div
          className={`collapse navbar-collapse ${collapsed ? '' : 'show'}`}
          id="navbarSupportedContent"
        >
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            {user ? (
              <>
                <li className="nav-item">
                  <span className="nav-link">{user.email}</span>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={logout}
                  >
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="btn btn-outline-primary btn-sm" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-primary btn-sm" to="/signup">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
            <li className="nav-item">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={toggleTheme}
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
