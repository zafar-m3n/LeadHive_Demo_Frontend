import React, { useEffect, useMemo, useState } from "react";
import DefaultLayout from "@/layouts/DefaultLayout";
import API from "@/services/index";
import Notification from "@/components/ui/Notification";
import Heading from "@/components/ui/Heading";
import Spinner from "@/components/ui/Spinner";
import Icon from "@/components/ui/Icon";
import {
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#A3E635", "#FB7185"];

const PAYMENT_MADE = import.meta.env.VITE_LEADHIVE_PAYMENT_MADE === "true";
const SUSPENSION_DATE = new Date("2026-06-20T00:00:00");

const PAYMENT_DAYS_REMAINING = Math.max(0, Math.ceil((SUSPENSION_DATE.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  async function fetchSummary() {
    try {
      setLoading(true);

      const res = await API.private.getAdminDashboardSummary({
        recentLimit: 5,
      });

      setSummary(res.data?.data || null);
    } catch (err) {
      Notification.error(err.response?.data?.error || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSummary();
  }, []);

  const retiredLeadsTotal = useMemo(() => {
    return Number(summary?.retiredLeads?.total || 0);
  }, [summary]);

  const retiredLeadsThisMonth = useMemo(() => {
    return Number(summary?.retiredLeads?.thisMonth || 0);
  }, [summary]);

  const leadsBySourceData = useMemo(() => {
    if (!summary?.leadsBySource) {
      return [];
    }

    return summary.leadsBySource.map((row) => ({
      label: row["LeadSource.label"] || row?.LeadSource?.label || "Unknown",
      count: Number(row.count || 0),
    }));
  }, [summary]);

  const leadsByCampaignData = useMemo(() => {
    if (!summary?.leadsByCampaign) {
      return [];
    }

    return summary.leadsByCampaign.map((row) => ({
      label: row["Campaign.label"] || row?.Campaign?.label || "Unknown",
      count: Number(row.count || 0),
    }));
  }, [summary]);

  const leadsByStatusPie = useMemo(() => {
    if (!summary?.leadsByStatus) {
      return [];
    }

    return summary.leadsByStatus.map((row) => ({
      name: row["LeadStatus.label"] || row?.LeadStatus?.label || "Unknown",
      value: Number(row.count || 0),
    }));
  }, [summary]);

  return (
    <DefaultLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <Heading>Admin Dashboard</Heading>

          {!PAYMENT_MADE && (
            <div className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 shadow-sm xl:max-w-2xl">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  <Icon icon="mdi:alert-outline" width={22} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold">Payment has not been settled</p>
                  <p className="mt-1 text-sm leading-5">
                    Please settle the pending payment within{" "}
                    <span className="font-semibold">{PAYMENT_DAYS_REMAINING} days</span>. Services may be interrupted if
                    the payment is not completed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center">
            <Spinner message="Loading dashboard..." />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">Total Leads</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900">{summary?.totalLeads ?? 0}</div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">New This Week</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900">{summary?.newThisWeek ?? 0}</div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">Unassigned Leads</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900">{summary?.unassignedLeads ?? 0}</div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">Retired Leads</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900">{retiredLeadsTotal}</div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">Retired This Month</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900">{retiredLeadsThisMonth}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <section className="rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Leads per Status</h2>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />

                      <Pie
                        data={leadsByStatusPie}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius="50%"
                        outerRadius="80%"
                      >
                        {leadsByStatusPie.map((entry, idx) => (
                          <Cell key={`status-cell-${entry.name}-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Leads per Source</h2>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leadsBySourceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-2">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Leads per Campaign</h2>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leadsByCampaignData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </DefaultLayout>
  );
}

export default AdminDashboard;
