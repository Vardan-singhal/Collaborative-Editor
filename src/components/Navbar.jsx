import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Moon, Sun } from 'lucide-react';

export default function Navbar({ user }) {
  const nav = useNavigate();

  const logout = async () => {
    await signOut(auth);
    nav('landing');
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
        <div className="d-flex align-items-center gap-2 ms-auto">
          {user ? (
            <>
              <span className="nav-link">{user.email}</span>
              <button className="btn btn-outline-secondary btn-sm" onClick={logout}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-outline-primary btn-sm" to="/login">
                Login
              </Link>
              <Link className="btn btn-primary btn-sm" to="/signup">
                Sign Up
              </Link>
            </>
          )}
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={toggleTheme}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
