import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/Navbar";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";

function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  if (!authChecked) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 text-muted">
        Loading...
      </div>
    );
  }

  return (
    <>
      <Navbar user={user} />
      <div className="container my-3">
        <Routes>
  {/* Landing page with redirect for logged-in users */}
  <Route
    path="/"
    element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />}
  />

  {/* Protected routes */}
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute user={user}>
        <Dashboard user={user} />
      </ProtectedRoute>
    }
  />
  <Route
    path="/editor/:id"
    element={
      <ProtectedRoute user={user}>
        <Editor user={user} />
      </ProtectedRoute>
    }
  />

  {/* Auth routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />

  {/* Catch-all */}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>

      </div>
    </>
  );
}

export default App;
