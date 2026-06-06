export const STATUS_COLOR_MAP = {
  new: "blue",
  call_back: "yellow",
  follow_up: "indigo",
  language_barrier: "purple",
  no_answer: "orange",
  not_interested: "red",
  wrong_number: "pink",
  user_busy: "teal",
  not_reachable: "gray",
  registered: "emerald",
  converted: "green",
  retired: "slate",
};

export const SOURCE_COLOR_MAP = {
  facebook: "blue",
  google: "red",
  outsource: "green",
};

export const RANDOM_SOURCE_COLORS = [
  "blue",
  "red",
  "green",
  "yellow",
  "indigo",
  "purple",
  "orange",
  "pink",
  "teal",
  "emerald",
  "cyan",
  "lime",
  "amber",
  "rose",
  "violet",
  "fuchsia",
  "sky",
  "slate",
];

export const CAMPAIGN_COLOR_MAP = {};

export const RANDOM_CAMPAIGN_COLORS = [
  "emerald",
  "cyan",
  "amber",
  "rose",
  "violet",
  "fuchsia",
  "sky",
  "lime",
  "indigo",
  "purple",
  "teal",
  "orange",
  "blue",
  "green",
  "pink",
  "yellow",
  "slate",
  "gray",
];

export const normalizeColorValue = (value = "") => {
  return String(value).trim().toLowerCase().replace(/\s+/g, "_").replace(/-+/g, "_");
};

export const getDeterministicColorIndex = (value = "", colors = RANDOM_SOURCE_COLORS) => {
  const normalized = normalizeColorValue(value);

  if (!normalized) {
    return 0;
  }

  let hash = 0;

  for (let i = 0; i < normalized.length; i += 1) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }

  return Math.abs(hash) % colors.length;
};

export const getStatusColor = (statusValue = "") => {
  const v = normalizeColorValue(statusValue);

  return STATUS_COLOR_MAP[v] || "gray";
};

export const getSourceColor = (sourceValue = "") => {
  const v = normalizeColorValue(sourceValue);

  if (SOURCE_COLOR_MAP[v]) {
    return SOURCE_COLOR_MAP[v];
  }

  const colorIndex = getDeterministicColorIndex(v, RANDOM_SOURCE_COLORS);

  return RANDOM_SOURCE_COLORS[colorIndex] || "gray";
};

export const getCampaignColor = (campaignValue = "") => {
  const v = normalizeColorValue(campaignValue);

  if (CAMPAIGN_COLOR_MAP[v]) {
    return CAMPAIGN_COLOR_MAP[v];
  }

  const colorIndex = getDeterministicColorIndex(v, RANDOM_CAMPAIGN_COLORS);

  return RANDOM_CAMPAIGN_COLORS[colorIndex] || "gray";
};
