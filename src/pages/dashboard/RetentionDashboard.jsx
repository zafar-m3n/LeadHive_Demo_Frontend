// src/pages/dashboard/RetentionDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import DefaultLayout from "@/layouts/DefaultLayout";
import API from "@/services/index";
import Notification from "@/components/ui/Notification";
import Heading from "@/components/ui/Heading";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import { getStatusColor, getSourceColor } from "@/utils/leadColors";

import { ResponsiveContainer, CartesianGrid, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";

const RetentionDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await API.private.getRetentionDashboardSummary({ recentLimit: 8 });
      const code = res?.data?.code;
      const payload = res?.data?.data;
      if (code === "OK" && payload) {
        setSummary(payload);
      } else {
        Notification.error(res?.data?.error || "Failed to load retention dashboard");
      }
    } catch (err) {
      console.error("[RetentionDashboard] getRetentionDashboardSummary error:", err);
      Notification.error(err?.response?.data?.error || "Failed to load retention dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const statusChartData = useMemo(() => {
    if (!summary?.byStatus) return [];
    return summary.byStatus.map((row, idx) => ({
      name: row?.LeadStatus?.label || row?.LeadStatus?.value || `Status #${row?.status_id ?? idx + 1}`,
      count: Number(row?.count || 0),
    }));
  }, [summary]);

  const campaignChartData = useMemo(() => {
    if (!summary?.byCampaign) return [];
    return summary.byCampaign.map((row, idx) => ({
      name: row?.Campaign?.label || row?.Campaign?.value || `Campaign #${row?.campaign_id ?? idx + 1}`,
      count: Number(row?.count || 0),
    }));
  }, [summary]);

  const intakeChartData = useMemo(() => {
    const rows = summary?.dailyIntakeLast14 || [];
    const map = new Map(rows.map((r) => [r.day, Number(r.count || 0)]));
    const out = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push({ day: key, count: map.get(key) ?? 0 });
    }
    return out;
  }, [summary]);

  const assignedColumns = [
    { key: "lead_name", label: "Lead" },
    { key: "email", label: "Email" },
    { key: "company", label: "Company" },
    { key: "status", label: "Status" },
    { key: "source", label: "Source" },
    { key: "campaign", label: "Campaign" },
    { key: "assigned_at", label: "Assigned" },
  ];

  const recentAssignedRows = (summary?.recentAssigned || []).map((a) => ({
    id: a.id,
    lead_name: [a?.Lead?.first_name, a?.Lead?.last_name].filter(Boolean).join(" ") || "-",
    email: a?.Lead?.email || "-",
    company: a?.Lead?.company || "-",
    status: a?.Lead?.LeadStatus?.label || a?.Lead?.LeadStatus?.value || "-",
    source: a?.Lead?.LeadSource?.label || a?.Lead?.LeadSource?.value || "-",
    campaign: a?.Lead?.Campaign?.label || a?.Lead?.Campaign?.value || "-",
    assigned_at: a?.assigned_at,
  }));

  const renderCell = (row, col) => {
    switch (col.key) {
      case "status":
        return <Badge text={row.status} color={getStatusColor(row.status)} size="sm" rounded="rounded" />;
      case "source":
        return <Badge text={row.source} color={getSourceColor(row.source)} size="sm" rounded="rounded" />;
      case "assigned_at":
        return row.assigned_at ? new Date(row.assigned_at).toLocaleString() : "-";
      default:
        return row[col.key] || "-";
    }
  };

  const totals = summary?.totals || {};
  const assigned = loading ? "—" : (totals.assigned ?? 0);
  const inboxNew = loading ? "—" : (totals.inboxNew ?? 0);
  const newThisWeek = loading ? "—" : (totals.newThisWeek ?? 0);
  const avgAgeDays = loading ? "—" : Math.round((totals.avgAgeDays ?? 0) * 10) / 10;

  return (
    <DefaultLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Heading>Retention Dashboard</Heading>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-gray-200 p-4 bg-white">
            <div className="text-sm text-gray-500">Assigned Leads</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">{assigned}</div>
          </div>
          <div className="rounded-xl border border-gray-200 p-4 bg-white">
            <div className="text-sm text-gray-500">Inbox (New)</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">{inboxNew}</div>
          </div>
          <div className="rounded-xl border border-gray-200 p-4 bg-white">
            <div className="text-sm text-gray-500">New This Week</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">{newThisWeek}</div>
          </div>
          <div className="rounded-xl border border-gray-200 p-4 bg-white">
            <div className="text-sm text-gray-500">Avg Lead Age (days)</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">{avgAgeDays}</div>
          </div>
        </div>

        <section className="rounded-xl border border-gray-200 p-5 bg-white">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Leads by Status</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Leads" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 p-5 bg-white">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Leads by Campaign</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Leads" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 p-5 bg-white">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Intake (Last 14 Days)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={intakeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Leads" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 p-5 bg-white">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recently Assigned To Me</h2>
          <Table
            columns={assignedColumns}
            data={recentAssignedRows}
            emptyMessage={loading ? "Loading..." : "No recent assignments found."}
            renderCell={renderCell}
          />
        </section>
      </div>
    </DefaultLayout>
  );
};

export default RetentionDashboard;
