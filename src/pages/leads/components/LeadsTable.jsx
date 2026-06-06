import React, { useState, useEffect, useMemo, useCallback } from "react";
import ReactDOM from "react-dom";
import Badge from "@/components/ui/Badge";
import IconComponent from "@/components/ui/Icon";
import Tooltip from "@/components/ui/Tooltip";
import { getStatusColor, getSourceColor, getCampaignColor } from "@/utils/leadColors";
import { formatDate } from "@/utils/formatDate";

const MENU_WIDTH = 260;
const BASE_MAX_HEIGHT = 288;
const MARGIN = 8;

const ROLE = {
  ADMIN: 1,
  MANAGER: 2,
  SALES_REP: 3,
};

const LeadsTable = ({
  leads,
  onEdit,
  onDelete,
  managers = [],
  onAssignOptionClick,
  mode = "manager",
  selfId = null,

  // Inline status edit
  statuses = [],
  onStatusUpdate, // (lead, statusOption) => Promise | void

  // Bulk selection
  showSelection = false,
  selectedIds = [],
  onToggleSelect = () => {},
  onToggleSelectAll = () => {},

  // Sorting from parent
  orderBy = "",
  orderDir = "ASC",
  onSortClick = () => {},
}) => {
  // -------------------------
  // Assignee dropdown state
  // -------------------------
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [openLead, setOpenLead] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({
    top: 0,
    left: 0,
    placeAbove: false,
    alignRight: false,
    maxHeight: BASE_MAX_HEIGHT,
  });
  const [assigneeQuery, setAssigneeQuery] = useState("");

  // -------------------------
  // Status dropdown state
  // -------------------------
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(null);
  const [openLeadStatus, setOpenLeadStatus] = useState(null);
  const [statusDropdownPos, setStatusDropdownPos] = useState({
    top: 0,
    left: 0,
    placeAbove: false,
    alignRight: false,
    maxHeight: BASE_MAX_HEIGHT,
  });

  // =========================
  // Helpers
  // =========================
  const normStatus = useCallback((s) => {
    if (!s) return null;

    return {
      id: s.id ?? s.value,
      value: s.value,
      label: s.label ?? String(s.id ?? s.value ?? ""),
      _raw: s,
    };
  }, []);

  const sameStatusById = useCallback((lead, s) => {
    const sid = s?.id;

    if (!lead || !sid) return false;

    const currentId = lead?.LeadStatus?.id ?? lead?.status_id;

    return Number(currentId) === Number(sid);
  }, []);

  const isSortedBy = useCallback((field) => String(orderBy || "") === String(field || ""), [orderBy]);

  const renderSortIcon = useCallback(
    (field) => {
      if (!isSortedBy(field)) {
        return <IconComponent icon="mdi:swap-vertical" width={16} className="text-gray-400" />;
      }

      return orderDir === "DESC" ? (
        <IconComponent icon="mdi:arrow-down" width={16} className="text-indigo-600" />
      ) : (
        <IconComponent icon="mdi:arrow-up" width={16} className="text-indigo-600" />
      );
    },
    [isSortedBy, orderDir],
  );

  const closeAssigneeDropdown = useCallback(() => {
    setDropdownOpen(null);
    setOpenLead(null);
    setAssigneeQuery("");
  }, []);

  const closeStatusDropdown = useCallback(() => {
    setStatusDropdownOpen(null);
    setOpenLeadStatus(null);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const isAssignee = e.target.closest(".assignee-trigger") || e.target.closest(".assignee-portal-dropdown");
      const isStatus = e.target.closest(".status-trigger") || e.target.closest(".status-portal-dropdown");

      if (!isAssignee) closeAssigneeDropdown();
      if (!isStatus) closeStatusDropdown();
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        closeAssigneeDropdown();
        closeStatusDropdown();
      }
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [closeAssigneeDropdown, closeStatusDropdown]);

  useEffect(() => {
    if (dropdownOpen && !leads.some((l) => l.id === dropdownOpen)) closeAssigneeDropdown();
    if (statusDropdownOpen && !leads.some((l) => l.id === statusDropdownOpen)) closeStatusDropdown();
  }, [leads, dropdownOpen, statusDropdownOpen, closeAssigneeDropdown, closeStatusDropdown]);

  useEffect(() => {
    if (!dropdownOpen) return;

    const updatePos = () => {
      const trigger = document.querySelector(`[data-assignee-trigger="${dropdownOpen}"]`);

      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      computeAndSetPosition(rect, setDropdownPos);
    };

    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);

    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    if (!statusDropdownOpen) return;

    const updatePos = () => {
      const trigger = document.querySelector(`[data-status-trigger="${statusDropdownOpen}"]`);

      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      computeAndSetPosition(rect, setStatusDropdownPos);
    };

    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);

    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [statusDropdownOpen]);

  const computeAndSetPosition = (rect, setter) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const spaceBelow = vh - rect.bottom - MARGIN;
    const spaceAbove = rect.top - MARGIN;
    const placeAbove = spaceBelow < 200 && spaceAbove > spaceBelow;

    let left = rect.left + window.scrollX;
    const overflowRight = left + MENU_WIDTH > window.scrollX + vw - MARGIN;

    if (overflowRight) {
      left = rect.right + window.scrollX - MENU_WIDTH;

      if (left < MARGIN) {
        left = MARGIN;
      }
    }

    let top;
    let maxAvailable;

    if (placeAbove) {
      top = rect.top + window.scrollY;
      maxAvailable = Math.max(160, Math.min(BASE_MAX_HEIGHT, spaceAbove));
    } else {
      top = rect.bottom + window.scrollY + 4;
      maxAvailable = Math.max(160, Math.min(BASE_MAX_HEIGHT, spaceBelow));
    }

    setter({
      top,
      left,
      placeAbove,
      alignRight: overflowRight,
      maxHeight: maxAvailable,
    });
  };

  const getLatestAssignment = (lead) => {
    const arr = lead?.LeadAssignments || [];

    if (!arr.length) return null;

    const latest = [...arr].sort((a, b) => new Date(b.assigned_at) - new Date(a.assigned_at))[0];

    return latest || null;
  };

  const getCurrentAssignee = (lead) => getLatestAssignment(lead)?.assignee || null;

  const getCurrentAssigneeName = (lead) => getCurrentAssignee(lead)?.full_name || "-";

  const toggleAssigneeDropdown = (lead, e) => {
    const rect = e.currentTarget.getBoundingClientRect();

    closeStatusDropdown();

    if (dropdownOpen === lead.id) {
      closeAssigneeDropdown();
    } else {
      computeAndSetPosition(rect, setDropdownPos);
      setDropdownOpen(lead.id);
      setOpenLead(lead);
      setAssigneeQuery("");
    }
  };

  const toggleStatusDropdown = (lead, e) => {
    const rect = e.currentTarget.getBoundingClientRect();

    closeAssigneeDropdown();

    if (statusDropdownOpen === lead.id) {
      closeStatusDropdown();
    } else {
      computeAndSetPosition(rect, setStatusDropdownPos);
      setStatusDropdownOpen(lead.id);
      setOpenLeadStatus(lead);
    }
  };

  // =========================
  // Assignment targets
  // =========================
  const teamSet = useMemo(
    () => new Set((managers || []).filter((u) => Number(u.role_id) !== ROLE.ADMIN).map((u) => u.id)),
    [managers],
  );

  const dropdownTargets = useMemo(() => managers || [], [managers]);

  // =========================
  // Permissions
  // =========================
  const canReassign = (lead) => {
    if (mode === "admin") return true;

    const current = getCurrentAssignee(lead);

    if (!current) return false;

    if (mode === "manager") {
      return teamSet.has(current.id);
    }

    if (mode === "sales") {
      if (!selfId) return false;

      return Number(current.role_id) === ROLE.SALES_REP && Number(current.id) === Number(selfId);
    }

    return false;
  };

  const canEditStatus = () => true;

  const filteredAssigneeTargets = useMemo(() => {
    const q = assigneeQuery.trim().toLowerCase();

    if (!q) return dropdownTargets;

    return dropdownTargets.filter(
      (m) => (m.full_name && m.full_name.toLowerCase().includes(q)) || (m.email && m.email.toLowerCase().includes(q)),
    );
  }, [assigneeQuery, dropdownTargets]);

  // Fixed widths
  const W_SELECT = "w-[46px]";
  const W_LEAD = "w-[175px]";
  const W_COMPANY = "w-[120px]";
  const W_PHONE = "w-[100px]";
  const W_DETAILS = "w-[230px]";
  const W_ASSIGNEE = "w-[175px]";
  const W_DATE = "w-[170px]";

  const allOnPageChecked = showSelection && leads.length > 0 && leads.every((l) => selectedIds.includes(l.id));

  const someOnPageChecked =
    showSelection && leads.length > 0 && leads.some((l) => selectedIds.includes(l.id)) && !allOnPageChecked;

  const showAssigneeCol = mode !== "sales";
  const showActionsCol = mode === "admin" || mode === "manager";

  const colsCount =
    (showSelection ? 1 : 0) + 1 + 1 + 1 + 1 + 1 + 1 + (showAssigneeCol ? 1 : 0) + (showActionsCol ? 1 : 0);

  return (
    <div className="relative w-full overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full table-auto text-sm leading-[1.25rem]">
        <thead className="bg-accent/20 uppercase tracking-wider">
          <tr className="text-[11px] font-semibold text-gray-800">
            {showSelection && (
              <th className={`px-2 py-2 text-left font-semibold ${W_SELECT}`}>
                <label className="inline-flex cursor-pointer select-none items-center gap-2">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={allOnPageChecked}
                    ref={(el) => el && (el.indeterminate = someOnPageChecked)}
                    onChange={(e) => onToggleSelectAll(e.target.checked)}
                    aria-label="Select all rows on page"
                  />

                  <span
                    data-indeterminate={someOnPageChecked ? "true" : undefined}
                    className="relative inline-flex h-4 w-4 items-center justify-center rounded border border-gray-300 bg-white shadow-sm
                      transition-colors duration-200 ease-in-out
                      after:absolute after:left-1/2 after:top-1/2 after:h-0.5 after:w-2 after:-translate-x-1/2 after:-translate-y-1/2
                      after:rounded-sm after:bg-white after:opacity-0
                      peer-checked:border-indigo-500 peer-checked:bg-indigo-500
                      peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-300
                      data-[indeterminate=true]:after:opacity-100"
                  >
                    <svg
                      className="pointer-events-none h-3 w-3 text-white opacity-0 transition-opacity duration-200 ease-in-out peer-checked:opacity-100"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                </label>
              </th>
            )}

            <th className={`px-3 py-2 text-left font-semibold ${W_LEAD}`}>Lead</th>
            <th className={`px-3 py-2 text-left font-semibold ${W_COMPANY}`}>Company</th>
            <th className={`hidden px-3 py-2 text-left font-semibold md:table-cell ${W_PHONE}`}>Phone</th>
            <th className={`px-3 py-2 text-left font-semibold ${W_DETAILS}`}>Lead Details</th>
            <th className={`px-3 py-2 text-left font-semibold ${W_DATE}`}>Created</th>

            <th className={`px-3 py-2 text-left font-semibold ${W_DATE}`}>
              <button
                type="button"
                onClick={() => onSortClick("updated_at")}
                className="inline-flex items-center gap-1 text-left uppercase tracking-wider transition hover:text-indigo-700"
                aria-label={`Sort by Last Contacted ${isSortedBy("updated_at") ? `currently ${orderDir}` : ""}`}
              >
                <span>Last Contacted</span>
                {renderSortIcon("updated_at")}
              </button>
            </th>

            {showAssigneeCol && <th className={`px-3 py-2 text-left font-semibold ${W_ASSIGNEE}`}>Assignee</th>}
            {showActionsCol && <th className="px-3 py-2 text-left font-semibold">Actions</th>}
          </tr>
        </thead>

        <tbody>
          {leads.length === 0 ? (
            <tr>
              <td colSpan={colsCount} className="px-3 py-6 text-center text-gray-500">
                No leads found.
              </td>
            </tr>
          ) : (
            leads.map((row) => {
              const fullName = `${row.first_name || ""} ${row.last_name || ""}`.trim() || "-";
              const statusLabel = row.LeadStatus?.label || "-";
              const statusValue = row.LeadStatus?.value || "";
              const sourceLabel = row.LeadSource?.label || "-";
              const sourceValue = row.LeadSource?.value || "";
              const campaignLabel = row.Campaign?.label || row.Campaign?.value || row.campaign_id || "-";
              const campaignValue = row.Campaign?.value || row.Campaign?.label || row.campaign_id || "";
              const phone = row.phone && row.phone.length > 4 ? row.phone : "N/A";
              const assigneeName = getCurrentAssigneeName(row);
              const created = formatDate(row.created_at);
              const lastContacted =
                row.created_at &&
                row.updated_at &&
                new Date(row.created_at).getTime() === new Date(row.updated_at).getTime()
                  ? "Not contacted yet"
                  : formatDate(row.updated_at);

              const reassignable = canReassign(row);
              const isChecked = selectedIds.includes(row.id);
              const canEditThisStatus = canEditStatus(row) && Array.isArray(statuses) && statuses.length > 0;

              return (
                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/70">
                  {showSelection && (
                    <td className={`px-2 py-2 align-top ${W_SELECT}`}>
                      <label className="inline-flex cursor-pointer select-none items-center gap-2">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={isChecked}
                          onChange={() => onToggleSelect(row.id)}
                          aria-label={`Select lead ${row.id}`}
                        />

                        <span
                          className="relative inline-flex h-4 w-4 items-center justify-center rounded border border-gray-300 bg-white shadow-sm
                            transition-colors duration-200 ease-in-out peer-checked:border-indigo-500 peer-checked:bg-indigo-500
                            peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-300"
                        >
                          <svg
                            className="pointer-events-none h-3 w-3 text-white opacity-0 transition-opacity duration-200 ease-in-out peer-checked:opacity-100"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                      </label>
                    </td>
                  )}

                  <td className="px-3 py-2 align-top">
                    <button
                      type="button"
                      onClick={() => onEdit && onEdit(row)}
                      className={`group flex flex-col overflow-hidden text-left ${W_LEAD}`}
                      aria-label={`Open details for ${fullName}`}
                    >
                      <span className="truncate font-medium text-gray-900 group-hover:underline">{fullName}</span>
                      <span className="truncate text-xs text-gray-600 group-hover:underline">{row.email || "-"}</span>
                    </button>
                  </td>

                  <td className="px-3 py-2 align-top">
                    <div className={`overflow-hidden ${W_COMPANY}`}>
                      <span className="block truncate">{row.company || "-"}</span>
                    </div>
                  </td>

                  <td className={`hidden whitespace-nowrap px-3 py-2 align-top md:table-cell ${W_PHONE}`}>
                    <div className="overflow-hidden">
                      <span className="block truncate">{phone}</span>
                    </div>
                  </td>

                  <td className={`px-3 py-2 align-top ${W_DETAILS}`}>
                    <div className="flex flex-col items-start gap-1.5">
                      {canEditThisStatus ? (
                        <Tooltip content="Change status" placement="top" theme="light">
                          <button
                            data-status-trigger={row.id}
                            onClick={(e) => toggleStatusDropdown(row, e)}
                            className="status-trigger inline-flex items-center gap-1 text-gray-800 hover:text-black"
                            aria-label="Change status"
                          >
                            <Badge text={statusLabel} color={getStatusColor(statusValue)} size="sm" rounded="rounded" />

                            <IconComponent
                              icon="mdi:chevron-down"
                              width={18}
                              className={`shrink-0 transition-transform duration-200 ${
                                statusDropdownOpen === row.id ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        </Tooltip>
                      ) : (
                        <Badge text={statusLabel} color={getStatusColor(statusValue)} size="sm" rounded="rounded" />
                      )}

                      <div className="flex max-w-full flex-wrap items-center gap-1.5">
                        <Badge text={sourceLabel} color={getSourceColor(sourceValue)} size="sm" rounded="rounded" />

                        <Badge
                          text={campaignLabel}
                          color={getCampaignColor(campaignValue)}
                          size="sm"
                          rounded="rounded"
                        />
                      </div>
                    </div>
                  </td>

                  <td className={`px-3 py-2 align-top ${W_DATE}`}>
                    <span className="text-gray-800">{created}</span>
                  </td>

                  <td className={`px-3 py-2 align-top ${W_DATE}`}>
                    <span className="text-gray-800">{lastContacted}</span>
                  </td>

                  {showAssigneeCol && (
                    <td className={`px-3 py-2 align-top ${W_ASSIGNEE}`}>
                      {reassignable ? (
                        <Tooltip content="Change assignee" placement="top" theme="light">
                          <button
                            data-assignee-trigger={row.id}
                            onClick={(e) => toggleAssigneeDropdown(row, e)}
                            className="assignee-trigger flex items-center gap-1 overflow-hidden text-gray-800 hover:text-black"
                            aria-label="Change assignee"
                          >
                            <span className="truncate">{assigneeName}</span>

                            <IconComponent
                              icon="mdi:chevron-down"
                              width={18}
                              className={`shrink-0 transition-transform duration-200 ${
                                dropdownOpen === row.id ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        </Tooltip>
                      ) : (
                        <div className="flex items-center gap-1 overflow-hidden text-gray-500">
                          <span className="truncate">{assigneeName}</span>
                        </div>
                      )}
                    </td>
                  )}

                  {showActionsCol && (
                    <td className="px-3 py-2 align-top">
                      <div className="flex items-center gap-1.5">
                        {onDelete && (
                          <Tooltip content="Delete lead" placement="top" theme="light">
                            <button
                              onClick={() => onDelete(row)}
                              className="inline-flex items-center rounded border border-gray-300 px-2 py-1 hover:bg-gray-100"
                              aria-label="Delete lead"
                            >
                              <IconComponent icon="mdi:delete" width={18} className="text-gray-800" />
                            </button>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {statusDropdownOpen &&
        ReactDOM.createPortal(
          <div
            className={`status-portal-dropdown fixed z-[9999] transform rounded-lg border border-gray-200 bg-white font-dm-sans shadow-xl transition-all duration-200 ${
              statusDropdownOpen
                ? "visible scale-100 opacity-100 pointer-events-auto"
                : "invisible scale-95 opacity-0 pointer-events-none"
            } ${statusDropdownPos.placeAbove ? "origin-bottom -translate-y-full" : "origin-top"}`}
            style={{ top: statusDropdownPos.top, left: statusDropdownPos.left, width: `${MENU_WIDTH}px` }}
            role="listbox"
            aria-hidden={!statusDropdownOpen}
          >
            <div className="app-scrollbar overflow-y-auto" style={{ maxHeight: `${statusDropdownPos.maxHeight}px` }}>
              {(() => {
                const all = (Array.isArray(statuses) ? statuses : []).map(normStatus).filter(Boolean);
                const list = all.filter((s) => !sameStatusById(openLeadStatus, s));

                if (!list.length) {
                  return <div className="px-3 py-2 text-xs text-gray-500">No other statuses</div>;
                }

                return list.map((s) => (
                  <div
                    key={s.id}
                    onClick={async () => {
                      const lead = openLeadStatus;

                      closeStatusDropdown();

                      if (lead && onStatusUpdate) {
                        await onStatusUpdate(lead, { id: s.id, label: s.label, value: s.value });
                      }
                    }}
                    className="cursor-pointer px-3 py-2 text-xs text-gray-800 hover:bg-indigo-50"
                    role="option"
                    aria-selected={false}
                    title={s.label}
                  >
                    <span className="block truncate">{s.label}</span>
                  </div>
                ));
              })()}
            </div>
          </div>,
          document.body,
        )}

      {showAssigneeCol &&
        ReactDOM.createPortal(
          <div
            className={`assignee-portal-dropdown fixed z-[9999] transform rounded-lg border border-gray-200 bg-white font-dm-sans shadow-xl transition-all duration-200 ${
              dropdownOpen
                ? "visible scale-100 opacity-100 pointer-events-auto"
                : "invisible scale-95 opacity-0 pointer-events-none"
            } ${dropdownPos.placeAbove ? "origin-bottom -translate-y-full" : "origin-top"}`}
            style={{ top: dropdownPos.top, left: dropdownPos.left, width: `${MENU_WIDTH}px` }}
            role="listbox"
            aria-hidden={!dropdownOpen}
          >
            <div className="sticky top-0 border-b border-gray-200 bg-white p-2">
              <div className="relative">
                <input
                  type="text"
                  value={assigneeQuery}
                  onChange={(e) => setAssigneeQuery(e.target.value)}
                  placeholder="Search assignee…"
                  className="w-full rounded-md border border-gray-300 px-8 py-1.5 text-xs text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />

                <IconComponent
                  icon="mdi:magnify"
                  width={16}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500"
                />

                {assigneeQuery && (
                  <button
                    onClick={() => setAssigneeQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label="Clear assignee search"
                  >
                    <IconComponent icon="mdi:close-circle" width={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="app-scrollbar overflow-y-auto" style={{ maxHeight: `${dropdownPos.maxHeight - 44}px` }}>
              {(() => {
                const list = (filteredAssigneeTargets || []).map((m) => {
                  const currentAssigneeId = openLead ? (getCurrentAssignee(openLead)?.id ?? null) : null;
                  const isCurrent = m.id === currentAssigneeId;

                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        const lead = openLead;

                        closeAssigneeDropdown();

                        if (lead) {
                          onAssignOptionClick(lead, m);
                        }
                      }}
                      className={`flex cursor-pointer items-start justify-between px-3 py-2 text-xs hover:bg-indigo-50 ${
                        isCurrent ? "bg-indigo-50" : ""
                      }`}
                      role="option"
                      aria-selected={isCurrent}
                    >
                      <div className="min-w-0">
                        <span className="block truncate font-medium text-black">{m.full_name}</span>
                        <div className="truncate text-[11px] text-gray-500">{m.email}</div>
                      </div>

                      {isCurrent && (
                        <IconComponent icon="mdi:check-circle" width={16} className="mt-0.5 shrink-0 text-indigo-600" />
                      )}
                    </div>
                  );
                });

                return list.length ? list : <div className="px-3 py-2 text-xs text-gray-500">No users found</div>;
              })()}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default LeadsTable;
