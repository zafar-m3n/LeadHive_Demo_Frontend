import instance from "@/lib/axios";

/* ========================== */
/* Auth Functions             */
/* ========================== */

const registerUser = async (data) => {
  return await instance.apiClient.post("/api/v1/auth/register", data, {
    headers: instance.publicHeaders(),
  });
};

const loginUser = async (data) => {
  return await instance.apiClient.post("/api/v1/auth/login", data, {
    headers: instance.publicHeaders(),
  });
};

const getProfile = async () => {
  return await instance.apiClient.get("/api/v1/auth/profile", {
    headers: instance.defaultHeaders(),
  });
};

const updatePassword = async (data) => {
  return await instance.apiClient.patch("/api/v1/auth/password/update", data, {
    headers: instance.defaultHeaders(),
  });
};

/* ========================== */
/* User Functions             */
/* ========================== */

const createUser = async (data) => {
  return await instance.apiClient.post("/api/v1/users", data, {
    headers: instance.defaultHeaders(),
  });
};

const getUsers = async (params = {}) => {
  return await instance.apiClient.get("/api/v1/users", {
    headers: instance.defaultHeaders(),
    params,
  });
};

const getUserById = async (id) => {
  return await instance.apiClient.get(`/api/v1/users/${id}`, {
    headers: instance.defaultHeaders(),
  });
};

const updateUser = async (id, data) => {
  return await instance.apiClient.put(`/api/v1/users/${id}`, data, {
    headers: instance.defaultHeaders(),
  });
};

const deleteUser = async (id) => {
  return await instance.apiClient.delete(`/api/v1/users/${id}`, {
    headers: instance.defaultHeaders(),
  });
};

/* ========================== */
/* Supporting Data Functions  */
/* ========================== */

const getRoles = async () => {
  return await instance.apiClient.get("/api/v1/supports/roles", {
    headers: instance.defaultHeaders(),
  });
};

const getLeadStatuses = async () => {
  return await instance.apiClient.get("/api/v1/supports/leads/statuses", {
    headers: instance.defaultHeaders(),
  });
};

const getLeadSources = async () => {
  return await instance.apiClient.get("/api/v1/supports/leads/sources", {
    headers: instance.defaultHeaders(),
  });
};

const getLeadCampaigns = async () => {
  return await instance.apiClient.get("/api/v1/supports/leads/campaigns", {
    headers: instance.defaultHeaders(),
  });
};

const getManagers = async () => {
  return await instance.apiClient.get("/api/v1/supports/users/managers", {
    headers: instance.defaultHeaders(),
  });
};

const getTeamMembers = async (teamId) => {
  return await instance.apiClient.get(`/api/v1/supports/teams/${teamId}/members`, {
    headers: instance.defaultHeaders(),
  });
};

const getUnassignedSalesReps = async () => {
  return await instance.apiClient.get("/api/v1/supports/users/sales/unassigned", {
    headers: instance.defaultHeaders(),
  });
};

const getUnassignedManagers = async () => {
  return await instance.apiClient.get("/api/v1/supports/users/managers/unassigned", {
    headers: instance.defaultHeaders(),
  });
};

const getManagersAndAdmins = async () => {
  return await instance.apiClient.get("/api/v1/supports/users/managers-admins", {
    headers: instance.defaultHeaders(),
  });
};

const getAssignableUsersForManager = async () => {
  return await instance.apiClient.get("/api/v1/supports/users/assignable", {
    headers: instance.defaultHeaders(),
  });
};

const getMyManager = async () => {
  return await instance.apiClient.get("/api/v1/supports/users/manager", {
    headers: instance.defaultHeaders(),
  });
};

const getManagersForTeam = async (teamId) => {
  return await instance.apiClient.get(`/api/v1/supports/teams/${teamId}/managers`, {
    headers: instance.defaultHeaders(),
  });
};

const assignManagerToTeam = async (id, data) => {
  return await instance.apiClient.post(`/api/v1/supports/teams/${id}/managers`, data, {
    headers: instance.defaultHeaders(),
  });
};

const removeManagerFromTeam = async (id, userId, data = {}) => {
  return await instance.apiClient.delete(`/api/v1/supports/teams/${id}/managers/${userId}`, {
    headers: instance.defaultHeaders(),
    data,
  });
};

const getAssignees = async () => {
  return await instance.apiClient.get("/api/v1/supports/users/assignees", {
    headers: instance.defaultHeaders(),
  });
};

/* ========================== */
/* Team Functions             */
/* ========================== */

const createTeam = async (data) => {
  return await instance.apiClient.post("/api/v1/teams", data, {
    headers: instance.defaultHeaders(),
  });
};

const getTeams = async (page = 1, limit = 10) => {
  return await instance.apiClient.get(`/api/v1/teams?page=${page}&limit=${limit}`, {
    headers: instance.defaultHeaders(),
  });
};

const getTeamById = async (id) => {
  return await instance.apiClient.get(`/api/v1/teams/${id}`, {
    headers: instance.defaultHeaders(),
  });
};

const updateTeam = async (id, data) => {
  return await instance.apiClient.put(`/api/v1/teams/${id}`, data, {
    headers: instance.defaultHeaders(),
  });
};

const deleteTeam = async (id) => {
  return await instance.apiClient.delete(`/api/v1/teams/${id}`, {
    headers: instance.defaultHeaders(),
  });
};

const addMemberToTeam = async (id, data) => {
  return await instance.apiClient.post(`/api/v1/teams/${id}/members`, data, {
    headers: instance.defaultHeaders(),
  });
};

const removeMemberFromTeam = async (id, userId) => {
  return await instance.apiClient.delete(`/api/v1/teams/${id}/members/${userId}`, {
    headers: instance.defaultHeaders(),
  });
};

const getMyTeam = async () => {
  return await instance.apiClient.get("/api/v1/teams/my", {
    headers: instance.defaultHeaders(),
  });
};

const removeMemberFromMyTeam = async (userId) => {
  return await instance.apiClient.delete(`/api/v1/teams/my/members/${userId}`, {
    headers: instance.defaultHeaders(),
  });
};

/* ========================== */
/* Lead Functions             */
/* ========================== */

const createLead = async (data) => {
  return await instance.apiClient.post("/api/v1/leads", data, {
    headers: instance.defaultHeaders(),
  });
};

const getLeads = async (params = {}) => {
  return await instance.apiClient.get("/api/v1/leads", {
    headers: instance.defaultHeaders(),
    params,
  });
};

const getLeadById = async (id) => {
  return await instance.apiClient.get(`/api/v1/leads/${id}`, {
    headers: instance.defaultHeaders(),
  });
};

const updateLead = async (id, data) => {
  return await instance.apiClient.put(`/api/v1/leads/${id}`, data, {
    headers: instance.defaultHeaders(),
  });
};

const deleteLead = async (id) => {
  return await instance.apiClient.delete(`/api/v1/leads/${id}`, {
    headers: instance.defaultHeaders(),
  });
};

const assignLead = async (id, data) => {
  return await instance.apiClient.post(`/api/v1/leads/${id}/assign`, data, {
    headers: instance.defaultHeaders(),
  });
};

const getLeadAssignments = async (id) => {
  return await instance.apiClient.get(`/api/v1/leads/${id}/assignments`, {
    headers: instance.defaultHeaders(),
  });
};

const updateLeadNote = async (leadId, noteId, data) => {
  return await instance.apiClient.put(`/api/v1/leads/${leadId}/notes/${noteId}`, data, {
    headers: instance.defaultHeaders(),
  });
};

const deleteLeadNote = async (leadId, noteId) => {
  return await instance.apiClient.delete(`/api/v1/leads/${leadId}/notes/${noteId}`, {
    headers: instance.defaultHeaders(),
  });
};

/* ========================== */
/* Lead Upload Functions      */
/* ========================== */

const getLeadTemplateSchema = async () => {
  return await instance.apiClient.get("/api/v1/leads/upload/template", {
    headers: instance.defaultHeaders(),
  });
};

const importLeads = async (data) => {
  return await instance.apiClient.post("/api/v1/leads/upload/import", data, {
    headers: instance.defaultHeaders(),
  });
};

/* ========================== */
/* Dashboard Functions        */
/* ========================== */

const getAdminDashboardSummary = async (params = {}) => {
  return await instance.apiClient.get("/api/v1/dashboard/summary/admin", {
    headers: instance.defaultHeaders(),
    params,
  });
};

const getManagerDashboardSummary = async (params = {}) => {
  return await instance.apiClient.get("/api/v1/dashboard/summary/manager", {
    headers: instance.defaultHeaders(),
    params,
  });
};

const getSalesRepDashboardSummary = async (params = {}) => {
  return await instance.apiClient.get("/api/v1/dashboard/summary/sales_rep", {
    headers: instance.defaultHeaders(),
    params,
  });
};

const getRetentionDashboardSummary = async (params = {}) => {
  return await instance.apiClient.get("/api/v1/dashboard/summary/retention", {
    headers: instance.defaultHeaders(),
    params,
  });
};

const getMyDashboardAssignments = async () => {
  return await instance.apiClient.get("/api/v1/dashboard/assignments", {
    headers: instance.defaultHeaders(),
  });
};

/* ========================== */
/* Bulk Lead Functions        */
/* ========================== */

const getBulkAssignableTargets = async () => {
  return await instance.apiClient.get("/api/v1/bulk/targets", {
    headers: instance.defaultHeaders(),
  });
};

const bulkAssignLeads = async ({ lead_ids = [], assignee_id, overwrite = false, status_id = null }) => {
  const payload = { lead_ids, assignee_id, overwrite };
  if (status_id !== undefined && status_id !== null) payload.status_id = status_id;

  return await instance.apiClient.post("/api/v1/bulk/assign", payload, {
    headers: instance.defaultHeaders(),
  });
};

const bulkDeleteLeads = async (lead_ids = []) => {
  return await instance.apiClient.delete("/api/v1/bulk/delete", {
    headers: instance.defaultHeaders(),
    data: { lead_ids },
  });
};

const bulkUpdateLeadStatus = async ({ lead_ids = [], status_id }) => {
  return await instance.apiClient.post(
    "/api/v1/bulk/status",
    { lead_ids, status_id },
    { headers: instance.defaultHeaders() },
  );
};

const bulkUpdateLeadSource = async ({ lead_ids = [], source_id }) => {
  return await instance.apiClient.post(
    "/api/v1/bulk/source",
    { lead_ids, source_id },
    { headers: instance.defaultHeaders() },
  );
};

const bulkUpdateLeadCampaign = async ({ lead_ids = [], campaign_id }) => {
  return await instance.apiClient.post(
    "/api/v1/bulk/campaign",
    { lead_ids, campaign_id },
    { headers: instance.defaultHeaders() },
  );
};

/* ========================== */
/* Admin Lead Sources CRUD    */
/* ========================== */

export const listAdminLeadSources = async (params = {}) => {
  return await instance.apiClient.get("/api/v1/lead/lead/sources", {
    headers: instance.defaultHeaders(),
    params,
  });
};

export const getAdminLeadSourceById = async (id) => {
  return await instance.apiClient.get(`/api/v1/lead/lead/sources/${id}`, {
    headers: instance.defaultHeaders(),
  });
};

export const createAdminLeadSource = async ({ label }) => {
  return await instance.apiClient.post("/api/v1/lead/lead/sources", { label }, { headers: instance.defaultHeaders() });
};

export const updateAdminLeadSource = async (id, { label }) => {
  return await instance.apiClient.put(
    `/api/v1/lead/lead/sources/${id}`,
    { label },
    { headers: instance.defaultHeaders() },
  );
};

export const deleteAdminLeadSource = async (id) => {
  return await instance.apiClient.delete(`/api/v1/lead/lead/sources/${id}`, {
    headers: instance.defaultHeaders(),
  });
};

/* ========================== */
/* Admin Lead Statuses CRUD   */
/* ========================== */

export const listAdminLeadStatuses = async (params = {}) => {
  return await instance.apiClient.get("/api/v1/lead/lead/statuses", {
    headers: instance.defaultHeaders(),
    params,
  });
};

export const getAdminLeadStatusById = async (id) => {
  return await instance.apiClient.get(`/api/v1/lead/lead/statuses/${id}`, {
    headers: instance.defaultHeaders(),
  });
};

export const createAdminLeadStatus = async ({ label }) => {
  return await instance.apiClient.post("/api/v1/lead/lead/statuses", { label }, { headers: instance.defaultHeaders() });
};

export const updateAdminLeadStatus = async (id, { label }) => {
  return await instance.apiClient.put(
    `/api/v1/lead/lead/statuses/${id}`,
    { label },
    { headers: instance.defaultHeaders() },
  );
};

export const deleteAdminLeadStatus = async (id) => {
  return await instance.apiClient.delete(`/api/v1/lead/lead/statuses/${id}`, {
    headers: instance.defaultHeaders(),
  });
};

/* ========================== */
/* Admin Campaigns CRUD       */
/* ========================== */

export const listAdminCampaigns = async (params = {}) => {
  return await instance.apiClient.get("/api/v1/lead/lead/campaigns", {
    headers: instance.defaultHeaders(),
    params,
  });
};

export const getAdminCampaignById = async (id) => {
  return await instance.apiClient.get(`/api/v1/lead/lead/campaigns/${id}`, {
    headers: instance.defaultHeaders(),
  });
};

export const createAdminCampaign = async ({ label }) => {
  return await instance.apiClient.post(
    "/api/v1/lead/lead/campaigns",
    { label },
    { headers: instance.defaultHeaders() },
  );
};

export const updateAdminCampaign = async (id, { label }) => {
  return await instance.apiClient.put(
    `/api/v1/lead/lead/campaigns/${id}`,
    { label },
    { headers: instance.defaultHeaders() },
  );
};

export const deleteAdminCampaign = async (id) => {
  return await instance.apiClient.delete(`/api/v1/lead/lead/campaigns/${id}`, {
    headers: instance.defaultHeaders(),
  });
};

/* ========================== */
/* Leads Export Functions     */
/* ========================== */

const getLeadsExportCount = async (filters = {}) => {
  return await instance.apiClient.post(
    "/api/v1/leads/export/count",
    { filters },
    { headers: instance.defaultHeaders() },
  );
};

const downloadLeadsExport = async (filters = {}) => {
  return await instance.apiClient.post(
    "/api/v1/leads/export/download",
    { filters },
    { headers: instance.defaultHeaders(), responseType: "blob" },
  );
};

/* ========================== */
/* Reports Functions          */
/* ========================== */

const getReportAgents = async () => {
  return await instance.apiClient.get("/api/v1/reports/agents", {
    headers: instance.defaultHeaders(),
  });
};

const getReports = async (params = {}) => {
  return await instance.apiClient.get("/api/v1/reports", {
    headers: instance.defaultHeaders(),
    params,
  });
};

/* ========================== */
/* Notification Functions     */
/* ========================== */

const getNotifications = async () => {
  return await instance.apiClient.get("/api/v1/notifications", {
    headers: instance.defaultHeaders(),
  });
};

const markNotificationAsRead = async (id) => {
  return await instance.apiClient.patch(
    `/api/v1/notifications/${id}/read`,
    {},
    {
      headers: instance.defaultHeaders(),
    },
  );
};

/* ========================== */
/* Export API                 */
/* ========================== */

const privateAPI = {
  registerUser,
  loginUser,
  getProfile,
  updatePassword,

  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,

  getRoles,
  getLeadStatuses,
  getLeadSources,
  getLeadCampaigns,
  getManagers,
  getTeamMembers,
  getUnassignedSalesReps,
  getUnassignedManagers,
  getManagersAndAdmins,
  getAssignableUsersForManager,
  getMyManager,
  getManagersForTeam,
  assignManagerToTeam,
  removeManagerFromTeam,
  getAssignees,

  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addMemberToTeam,
  removeMemberFromTeam,
  getMyTeam,
  removeMemberFromMyTeam,

  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  assignLead,
  getLeadAssignments,
  updateLeadNote,
  deleteLeadNote,

  getLeadTemplateSchema,
  importLeads,

  getAdminDashboardSummary,
  getManagerDashboardSummary,
  getSalesRepDashboardSummary,
  getRetentionDashboardSummary,
  getMyDashboardAssignments,

  getBulkAssignableTargets,
  bulkAssignLeads,
  bulkDeleteLeads,
  bulkUpdateLeadStatus,
  bulkUpdateLeadSource,
  bulkUpdateLeadCampaign,

  listAdminLeadSources,
  getAdminLeadSourceById,
  createAdminLeadSource,
  updateAdminLeadSource,
  deleteAdminLeadSource,

  listAdminLeadStatuses,
  getAdminLeadStatusById,
  createAdminLeadStatus,
  updateAdminLeadStatus,
  deleteAdminLeadStatus,

  listAdminCampaigns,
  getAdminCampaignById,
  createAdminCampaign,
  updateAdminCampaign,
  deleteAdminCampaign,

  getLeadsExportCount,
  downloadLeadsExport,

  getReportAgents,
  getReports,

  getNotifications,
  markNotificationAsRead,
};

export default privateAPI;
