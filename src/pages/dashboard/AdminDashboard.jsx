import React, { useEffect, useMemo, useState } from "react";
import DefaultLayout from "@/layouts/DefaultLayout";
import API from "@/services/index";
import Notification from "@/components/ui/Notification";
import Heading from "@/components/ui/Heading";
import Spinner from "@/components/ui/Spinner";
import Icon from "@/components/ui/Icon";
import { getStatusColor } from "@/utils/leadColors";
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

const CHART_COLOR_MAP = {
  blue: "#3B82F6",
  yellow: "#EAB308",
  indigo: "#6366F1",
  purple: "#8B5CF6",
  orange: "#F97316",
  red: "#EF4444",
  pink: "#EC4899",
  teal: "#14B8A6",
  gray: "#6B7280",
  emerald: "#10B981",
  green: "#22C55E",
  slate: "#64748B",
  cyan: "#06B6D4",
  lime: "#84CC16",
  amber: "#F59E0B",
  rose: "#F43F5E",
  violet: "#8B5CF6",
  fuchsia: "#D946EF",
  sky: "#0EA5E9",
};

const PAYMENT_MADE = import.meta.env.VITE_LEADHIVE_PAYMENT_MADE === "true";
const SUSPENSION_DATE = new Date("2026-06-20T00:00:00");

const PAYMENT_DAYS_REMAINING = Math.max(0, Math.ceil((SUSPENSION_DATE.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

function hasChartData(data) {
  return Array.isArray(data) && data.some((item) => Number(item.count || item.value || 0) > 0);
}

function EmptyChartState({ icon = "mdi:chart-box-outline", title, message }) {
  return (
    <div className="flex h-80 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-6 text-center">
      <div>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm">
          <Icon icon={icon} width={24} />
        </div>

        <h3 className="mt-4 text-sm font-semibold text-gray-900">{title}</h3>

        <p className="mx-auto mt-1 max-w-sm text-sm leading-5 text-gray-500">{message}</p>
      </div>
    </div>
  );
}

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

    return summary.leadsByStatus.map((row) => {
      const statusLabel = row["LeadStatus.label"] || row?.LeadStatus?.label || "Unknown";

      const statusValue = row["LeadStatus.value"] || row?.LeadStatus?.value || statusLabel;

      const colorName = getStatusColor(statusValue);

      return {
        name: statusLabel,
        statusValue,
        colorName,
        color: CHART_COLOR_MAP[colorName] || CHART_COLOR_MAP.gray,
        value: Number(row.count || 0),
      };
    });
  }, [summary]);

  const hasStatusChartData = useMemo(() => {
    return hasChartData(leadsByStatusPie);
  }, [leadsByStatusPie]);

  const hasSourceChartData = useMemo(() => {
    return hasChartData(leadsBySourceData);
  }, [leadsBySourceData]);

  const hasCampaignChartData = useMemo(() => {
    return hasChartData(leadsByCampaignData);
  }, [leadsByCampaignData]);

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
                    <span className="font-semibold">{PAYMENT_DAYS_REMAINING} days</span>. Services will be interrupted
                    if the payment is not completed.
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

                {hasStatusChartData ? (
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
                            <Cell key={`status-cell-${entry.statusValue}-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyChartState
                    icon="mdi:chart-donut"
                    title="No status data available yet"
                    message="Once leads are created and assigned statuses, the status breakdown chart will appear here."
                  />
                )}
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Leads per Source</h2>

                {hasSourceChartData ? (
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
                ) : (
                  <EmptyChartState
                    icon="mdi:source-branch"
                    title="No sources added yet"
                    message="Lead sources have not been added or linked to leads yet. Once source data is available, this chart will appear here."
                  />
                )}
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-2">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Leads per Campaign</h2>

                {hasCampaignChartData ? (
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
                ) : (
                  <EmptyChartState
                    icon="mdi:bullhorn-outline"
                    title="No campaign data available yet"
                    message="Campaigns have not been added or linked to leads yet. Once campaign data is available, this chart will appear here."
                  />
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </DefaultLayout>
  );
}

export default AdminDashboard;
