import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaGithub } from "react-icons/fa";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const nav = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      nav("/");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      nav("/");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGithubSignup = async () => {
    const provider = new GithubAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      nav("/");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-lg p-4 rounded-4" style={{ maxWidth: "420px", width: "100%" }}>
        <h3 className="text-center mb-4 fw-bold text-primary">Create an Account 🚀</h3>

        <form onSubmit={handleSignup}>
          {/* Email Input */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <FaEnvelope />
              </span>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <FaLock />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="input-group-text bg-white"
                style={{ cursor: "pointer" }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {/* Signup Button */}
          <button type="submit" className="btn btn-primary w-100 fw-semibold mb-3">
            Sign Up
          </button>
        </form>

        {/* Divider */}
        {/* <div className="text-center my-3 text-muted">— or sign up with —</div> */}

        {/* OAuth Buttons */}
        {/* <div className="d-flex gap-2">
          <button
            onClick={handleGoogleSignup}
            className="btn btn-outline-danger w-50 d-flex align-items-center justify-content-center gap-2"
          >
            <FaGoogle /> Google
          </button>
          <button
            onClick={handleGithubSignup}
            className="btn btn-outline-dark w-50 d-flex align-items-center justify-content-center gap-2"
          >
            <FaGithub /> GitHub
          </button>
        </div> */}

        {/* Login Redirect */}
        <p className="mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-decoration-none fw-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
