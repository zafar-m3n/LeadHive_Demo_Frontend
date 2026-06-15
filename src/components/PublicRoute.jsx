import React from "react";
import { Navigate } from "react-router-dom";
import token from "@/lib/utilities";

const PAYMENT_MADE = import.meta.env.VITE_LEADHIVE_PAYMENT_MADE === "true";
const SUSPENSION_DATE = new Date("2026-06-20T00:00:00");

function isSystemSuspended() {
  if (PAYMENT_MADE) return false;

  const now = new Date();

  return now >= SUSPENSION_DATE;
}

function PublicRoute({ children }) {
  if (isSystemSuspended()) {
    token.logout();
    return <Navigate to="/suspended" replace />;
  }

  if (token.isAuthenticated()) {
    const user = token.getUserData();
    const role = user?.role?.value;

    if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (role === "manager") return <Navigate to="/manager/dashboard" replace />;
    if (role === "sales_rep") return <Navigate to="/sales/dashboard" replace />;
    if (role === "retention") return <Navigate to="/retention/dashboard" replace />;

    return <Navigate to="/login" replace />;
  }

  return children;
}

export default PublicRoute;
