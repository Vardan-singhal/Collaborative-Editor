import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ user, children }) {
  // ✅ Only redirect if we've checked auth and found no user
  if (user === null) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
