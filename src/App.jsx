import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

// Auth
import RegisterPage from "@/pages/auth/RegisterPage";
import LoginPage from "@/pages/auth/LoginPage";

// Dashboards
import SalesDashboard from "@/pages/dashboard/SalesDashboard";
import AdminDashboard from "@/pages/dashboard/AdminDashboard";
import ManagerDashboard from "@/pages/dashboard/ManagerDashboard";
import RetentionDashboard from "@/pages/dashboard/RetentionDashboard";

// Users
import ManageUsers from "@/pages/users/ManageUsers";

// Teams
import ManageTeams from "@/pages/teams/ManageTeams";
import ViewTeamPage from "@/pages/teams/ViewTeamPage";
import ManagerTeam from "@/pages/teams/ManagerTeam";

// Leads
import AdminLeads from "@/pages/leads/AdminLeads";
import LeadsImport from "@/pages/leads/LeadsImport";
import ManagerLeads from "@/pages/leads/ManagerLeads";
import SalesLeads from "@/pages/leads/SalesLeads";
import RetentionLeads from "@/pages/leads/RetentionLeads";
import LeadExport from "@/pages/leadexport";

// Reports
import AdminReports from "@/pages/reports/AdminReports";

// Profile
import ManagerProfile from "@/pages/profile/ManagerProfile";
import SalesProfile from "@/pages/profile/SalesProfile";
import RetentionProfile from "@/pages/profile/RetentionProfile";

// Settings
import AdminSettings from "@/pages/settings/AdminSettings";

// Shared
import NotFound from "@/pages/NotFound";
import SuspendedPage from "@/pages/SuspendedPage";

// Guards & Utilities
import PrivateRoute from "@/components/PrivateRoute";
import PublicRoute from "@/components/PublicRoute";
import token from "@/lib/utilities";
import Notification from "@/components/ui/Notification";

const PAYMENT_MADE = import.meta.env.VITE_LEADHIVE_PAYMENT_MADE === "true";
const SUSPENSION_DATE = new Date("2026-06-20T00:00:00");

const protectedRoutes = [
  // Dashboards
  { path: "/sales/dashboard", element: SalesDashboard, roles: ["sales_rep"] },
  { path: "/admin/dashboard", element: AdminDashboard, roles: ["admin"] },
  { path: "/manager/dashboard", element: ManagerDashboard, roles: ["manager"] },
  { path: "/retention/dashboard", element: RetentionDashboard, roles: ["retention"] },

  // Users
  { path: "/admin/users", element: ManageUsers, roles: ["admin"] },

  // Teams
  { path: "/admin/teams", element: ManageTeams, roles: ["admin"] },
  { path: "/admin/teams/:id", element: ViewTeamPage, roles: ["admin"] },
  { path: "/manager/team", element: ManagerTeam, roles: ["manager"] },

  // Leads
  { path: "/admin/leads", element: AdminLeads, roles: ["admin"] },
  { path: "/admin/leads/import", element: LeadsImport, roles: ["admin"] },
  { path: "/admin/leads/export", element: LeadExport, roles: ["admin"] },
  { path: "/manager/leads", element: ManagerLeads, roles: ["manager"] },
  { path: "/sales/leads", element: SalesLeads, roles: ["sales_rep"] },
  { path: "/retention/leads", element: RetentionLeads, roles: ["retention"] },

  // Reports
  { path: "/admin/reports", element: AdminReports, roles: ["admin"] },

  // Profile
  { path: "/manager/profile", element: ManagerProfile, roles: ["manager"] },
  { path: "/sales/profile", element: SalesProfile, roles: ["sales_rep"] },
  { path: "/retention/profile", element: RetentionProfile, roles: ["retention"] },

  // Settings
  { path: "/admin/settings", element: AdminSettings, roles: ["admin"] },
];

const publicRoutes = [
  { path: "/register", element: RegisterPage },
  { path: "/login", element: LoginPage },
];

function getPaymentSuspendedStatus() {
  if (PAYMENT_MADE) {
    return false;
  }

  const now = new Date();

  return now >= SUSPENSION_DATE;
}

function AppShell() {
  const navigate = useNavigate();
  const isSuspended = getPaymentSuspendedStatus();

  useEffect(() => {
    if (isSuspended) {
      localStorage.clear();
      sessionStorage.clear();
      navigate("/suspended", { replace: true });
      return;
    }

    token.initAuthSession(() => {
      Notification.error("Your session expired. Please log in again.");
      navigate("/login", { replace: true });
    });
  }, [navigate, isSuspended]);

  const getDashboardRedirect = () => {
    if (isSuspended) return "/suspended";
    if (!token.isAuthenticated() || token.isExpired()) return "/login";

    const user = token.getUserData();
    const role = user?.role?.value;

    if (role === "admin") return "/admin/dashboard";
    if (role === "manager") return "/manager/dashboard";
    if (role === "sales_rep") return "/sales/dashboard";
    if (role === "retention") return "/retention/dashboard";

    return "/login";
  };

  return (
    <>
      <Routes>
        {isSuspended ? (
          <>
            <Route path="/suspended" element={<SuspendedPage />} />
            <Route path="*" element={<Navigate to="/suspended" replace />} />
          </>
        ) : (
          <>
            {/* Root redirect by role */}
            <Route path="/" element={<Navigate to={getDashboardRedirect()} replace />} />

            {/* Protected routes */}
            {protectedRoutes.map((route, idx) => (
              <Route
                key={idx}
                path={route.path}
                element={
                  <PrivateRoute allowedRoles={route.roles}>
                    <route.element />
                  </PrivateRoute>
                }
              />
            ))}

            {/* Public routes */}
            {publicRoutes.map((route, idx) => (
              <Route
                key={idx}
                path={route.path}
                element={
                  <PublicRoute>
                    <route.element />
                  </PublicRoute>
                }
              />
            ))}

            {/* Suspended route available even before suspension */}
            <Route path="/suspended" element={<SuspendedPage />} />

            {/* Not Found */}
            <Route path="*" element={<NotFound />} />
          </>
        )}
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={true}
        closeOnClick={true}
        draggable={false}
        pauseOnHover={true}
        theme="light"
      />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}
