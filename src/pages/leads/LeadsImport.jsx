// src/pages/admin/leads/LeadsImport.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "@/layouts/DefaultLayout";
import API from "@/services/index";
import Notification from "@/components/ui/Notification";
import AccentButton from "@/components/ui/AccentButton";
import GrayButton from "@/components/ui/GrayButton";
import Icon from "@/components/ui/Icon";
import Heading from "@/components/ui/Heading";
import Select from "@/components/form/Select";
import TextInput from "@/components/form/TextInput";
import ConfirmUploadModal from "./components/ConfirmUploadModal";
import Papa from "papaparse";

const OTHER_SOURCE_VALUE = "__other__";
const OTHER_CAMPAIGN_VALUE = "__other_campaign__";

const IMPORT_NOTE_LABELS = {
  empty_row: "Empty row skipped",
  missing_contact_method: "Missing phone or email",
  missing_name: "Missing first name or last name",
  invalid_email_format: "Invalid email format",
  duplicate_email_in_file: "Duplicate email in CSV",
  duplicate_phone_in_file: "Duplicate phone in CSV",
  duplicate_email_in_db: "Email already exists",
  duplicate_phone_in_db: "Phone already exists",
};

function getImportNoteLabel(note) {
  return IMPORT_NOTE_LABELS[note] || note;
}

function LeadsImport() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [schema, setSchema] = useState(null);
  const [schemaLoading, setSchemaLoading] = useState(false);

  const [sourceOptions, setSourceOptions] = useState([]);
  const [sourcesLoading, setSourcesLoading] = useState(false);

  const [campaignOptions, setCampaignOptions] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);

  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [parseError, setParseError] = useState("");

  const [selectedFallbackSource, setSelectedFallbackSource] = useState("");
  const [otherFallbackSource, setOtherFallbackSource] = useState("");

  const [selectedFallbackCampaign, setSelectedFallbackCampaign] = useState("");
  const [otherFallbackCampaign, setOtherFallbackCampaign] = useState("");

  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isConfirmUploadOpen, setIsConfirmUploadOpen] = useState(false);

  useEffect(() => {
    const fetchSchema = async () => {
      setSchemaLoading(true);

      try {
        const res = await API.private.getLeadTemplateSchema();
        setSchema(res.data);
      } catch {
        Notification.error("Failed to load template");
      } finally {
        setSchemaLoading(false);
      }
    };

    const fetchSources = async () => {
      setSourcesLoading(true);

      try {
        const res = await API.private.getLeadSources();
        const rawSources = res?.data?.data || res?.data?.sources || res?.data || [];

        const mapped = Array.isArray(rawSources)
          ? rawSources
              .map((src) => ({
                value: src.value || src.label || "",
                label: src.label || src.value || "",
              }))
              .filter((src) => src.value && src.label)
          : [];

        const uniqueMap = new Map();

        mapped.forEach((item) => {
          if (!uniqueMap.has(item.value)) {
            uniqueMap.set(item.value, item);
          }
        });

        const finalOptions = [
          ...Array.from(uniqueMap.values()).sort((a, b) => a.label.localeCompare(b.label)),
          { value: OTHER_SOURCE_VALUE, label: "Other" },
        ];

        setSourceOptions(finalOptions);
      } catch {
        Notification.error("Failed to load sources");
        setSourceOptions([{ value: OTHER_SOURCE_VALUE, label: "Other" }]);
      } finally {
        setSourcesLoading(false);
      }
    };

    const fetchCampaigns = async () => {
      setCampaignsLoading(true);

      try {
        const res = await API.private.getLeadCampaigns();
        const rawCampaigns = res?.data?.data || res?.data?.campaigns || res?.data || [];

        const mapped = Array.isArray(rawCampaigns)
          ? rawCampaigns
              .map((campaign) => ({
                value: campaign.value || campaign.label || "",
                label: campaign.label || campaign.value || "",
              }))
              .filter((campaign) => campaign.value && campaign.label)
          : [];

        const uniqueMap = new Map();

        mapped.forEach((item) => {
          if (!uniqueMap.has(item.value)) {
            uniqueMap.set(item.value, item);
          }
        });

        const finalOptions = [
          ...Array.from(uniqueMap.values()).sort((a, b) => a.label.localeCompare(b.label)),
          { value: OTHER_CAMPAIGN_VALUE, label: "Other" },
        ];

        setCampaignOptions(finalOptions);
      } catch {
        Notification.error("Failed to load campaigns");
        setCampaignOptions([{ value: OTHER_CAMPAIGN_VALUE, label: "Other" }]);
      } finally {
        setCampaignsLoading(false);
      }
    };

    fetchSchema();
    fetchSources();
    fetchCampaigns();
  }, []);

  const previewRows = useMemo(() => rows.slice(0, 5), [rows]);

  const previewHeaders = useMemo(() => {
    if (previewRows.length === 0) return [];

    const set = new Set();

    previewRows.forEach((r) => {
      Object.keys(r).forEach((k) => set.add(k));
    });

    const schemaOrder = schema?.fields || [];

    return [...schemaOrder.filter((f) => set.has(f)), ...Array.from(set).filter((k) => !schemaOrder.includes(k))];
  }, [previewRows, schema]);

  const resolvedFallbackSource = useMemo(() => {
    if (selectedFallbackSource === OTHER_SOURCE_VALUE) {
      return otherFallbackSource.trim();
    }

    return selectedFallbackSource.trim();
  }, [selectedFallbackSource, otherFallbackSource]);

  const resolvedFallbackCampaign = useMemo(() => {
    if (selectedFallbackCampaign === OTHER_CAMPAIGN_VALUE) {
      return otherFallbackCampaign.trim();
    }

    return selectedFallbackCampaign.trim();
  }, [selectedFallbackCampaign, otherFallbackCampaign]);

  const fileSizeLabel = useMemo(() => {
    if (!file?.size && file?.size !== 0) return "";

    if (file.size < 1024) {
      return `${file.size} B`;
    }

    if (file.size < 1024 * 1024) {
      return `${(file.size / 1024).toFixed(1)} KB`;
    }

    return `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
  }, [file]);

  const validateBeforeImport = () => {
    if (rows.length === 0) {
      Notification.error("No rows parsed. Upload a valid CSV first.");
      return false;
    }

    if (selectedFallbackSource === OTHER_SOURCE_VALUE && !otherFallbackSource.trim()) {
      Notification.error("Please enter a source name.");
      return false;
    }

    if (selectedFallbackCampaign === OTHER_CAMPAIGN_VALUE && !otherFallbackCampaign.trim()) {
      Notification.error("Please enter a campaign name.");
      return false;
    }

    return true;
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const f = e.dataTransfer.files[0];

      await handleFileSelected(f);
      e.dataTransfer.clearData();
    }
  };

  const handleFilePick = async (e) => {
    const f = e.target.files?.[0];

    if (!f) return;

    await handleFileSelected(f);
  };

  const handleFileSelected = async (f) => {
    setFile(f);
    setParseError("");
    setRows([]);
    setResult(null);

    const name = f.name.toLowerCase();

    if (!name.endsWith(".csv")) {
      setParseError("Only .csv files are supported.");
      return;
    }

    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (res) => {
        const data = res?.data || [];
        setRows(data);
      },
      error: () => {
        setParseError("Failed to parse CSV file.");
      },
    });
  };

  const handleRemoveFile = () => {
    setFile(null);
    setRows([]);
    setParseError("");
    setResult(null);
    setIsConfirmUploadOpen(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRequestImport = () => {
    if (!validateBeforeImport()) return;

    setIsConfirmUploadOpen(true);
  };

  const handleConfirmImport = async () => {
    if (!validateBeforeImport()) return;

    setImporting(true);
    setResult(null);

    try {
      const payload = {
        leads: rows,
        fallback_source: resolvedFallbackSource || undefined,
        fallback_campaign: resolvedFallbackCampaign || undefined,
      };

      const res = await API.private.importLeads(payload);

      if (res.data?.success) {
        Notification.success(res.data.message || "Leads imported successfully");
        setResult(res.data);
        setIsConfirmUploadOpen(false);
      } else {
        Notification.error(res.data?.error || "Import failed");
        setResult(res.data);
      }
    } catch (err) {
      Notification.error(err.response?.data?.error || "Import failed");

      setResult({
        success: false,
        error: err.response?.data?.error || "Import failed",
        details: err.response?.data?.details || null,
      });
    } finally {
      setImporting(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/leads");
  };

  const handleDownloadTemplate = () => {
    if (!schema?.fields) return;

    const headers = schema.fields;

    const sample = headers.map((h) => {
      if (h === "first_name") return "John";
      if (h === "last_name") return "Doe";
      if (h === "email") return "john@example.com";
      if (h === "phone") return "0771234567";
      if (h === "status") return schema.defaults?.status ?? "New";
      if (h === "source") return "";
      if (h === "campaign") return "";
      return "";
    });

    const csv = [headers.join(","), sample.join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "leads_template.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <DefaultLayout>
      <div className="space-y-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0 space-y-2">
              <Heading>Import Leads</Heading>
              <p className="max-w-2xl text-sm text-gray-600">
                Upload your CSV file, review the preview, then import your leads.
              </p>
            </div>
          </div>
        </div>

        {result && (
          <div
            className={`rounded-3xl border p-5 shadow-sm ${
              result.success ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {result.success ? (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  <Icon icon="mdi:check-circle-outline" width={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium">{result.message || "Import completed."}</p>

                  {result.summary && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-green-200 bg-white/80 p-4">
                        <p className="text-xs uppercase tracking-wide text-green-700">Attempted</p>
                        <p className="mt-1 text-xl font-semibold">{result.summary.attempted}</p>
                      </div>

                      <div className="rounded-2xl border border-green-200 bg-white/80 p-4">
                        <p className="text-xs uppercase tracking-wide text-green-700">Imported</p>
                        <p className="mt-1 text-xl font-semibold">{result.summary.inserted}</p>
                      </div>

                      <div className="rounded-2xl border border-green-200 bg-white/80 p-4">
                        <p className="text-xs uppercase tracking-wide text-green-700">Skipped</p>
                        <p className="mt-1 text-xl font-semibold">{result.summary.duplicates_or_skipped}</p>
                      </div>
                    </div>
                  )}

                  {!!(result.notes && result.notes.length) && (
                    <div className="mt-4">
                      <p className="font-medium">Skipped / Import Notes</p>

                      <ul className="mt-2 max-h-64 list-inside list-disc space-y-1 overflow-y-auto rounded-2xl border border-green-200 bg-white/70 p-3 text-sm">
                        {result.notes.map((n, idx) => (
                          <li key={idx} className="break-words">
                            Row {n.index + 1}:{" "}
                            {n.email ? (
                              <>
                                <span className="font-mono">{n.email}</span>
                                <span className="opacity-70"> – </span>
                              </>
                            ) : n.phone ? (
                              <>
                                <span className="font-mono">{n.phone}</span>
                                <span className="opacity-70"> – </span>
                              </>
                            ) : null}
                            {getImportNoteLabel(n.note)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div className="w-fit">
                      <AccentButton text="Go to Leads now" onClick={() => navigate("/admin/leads")} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  <Icon icon="mdi:alert-circle-outline" width={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium">Import failed</p>
                  <p className="mt-1 text-sm">{result.error}</p>

                  {result.details?.notes && result.details.notes.length > 0 && (
                    <div className="mt-4">
                      <p className="font-medium">Details</p>

                      <ul className="mt-2 max-h-64 list-inside list-disc space-y-1 overflow-y-auto rounded-2xl border border-red-200 bg-white/70 p-3 text-sm">
                        {result.details.notes.map((n, idx) => (
                          <li key={idx} className="break-words">
                            Row {n.index + 1}:{" "}
                            {n.email ? (
                              <>
                                <span className="font-mono">{n.email}</span>
                                <span className="opacity-70"> – </span>
                              </>
                            ) : n.phone ? (
                              <>
                                <span className="font-mono">{n.phone}</span>
                                <span className="opacity-70"> – </span>
                              </>
                            ) : null}
                            {getImportNoteLabel(n.note)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,1fr)]">
          <div className="min-w-0 space-y-6">
            <div
              className={`rounded-3xl border-2 border-dashed bg-white p-6 shadow-sm transition md:p-8 ${
                isDragging ? "border-black" : "border-gray-300"
              }`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
            >
              <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFilePick} />

              <div className="flex min-w-0 flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
                  <Icon icon="mdi:file-delimited-outline" width={28} />
                </div>

                <h2 className="text-lg font-semibold text-gray-900">Upload CSV File</h2>

                <p className="mt-2 max-w-md text-sm text-gray-600">
                  Drag and drop your file here or choose it from your device.
                </p>

                <div className="mt-5 w-fit">
                  <AccentButton text="Choose File" onClick={() => fileInputRef.current?.click()} />
                </div>

                {file && (
                  <div className="mt-5 w-full max-w-xl rounded-2xl border border-gray-200 bg-gray-50 p-3 text-left">
                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white">
                          <Icon icon="mdi:file-outline" width={20} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-800" title={file.name}>
                            {file.name}
                          </p>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            <span>CSV file</span>

                            {fileSizeLabel && (
                              <>
                                <span className="h-1 w-1 rounded-full bg-gray-300" />
                                <span>{fileSizeLabel}</span>
                              </>
                            )}

                            {rows.length > 0 && (
                              <>
                                <span className="h-1 w-1 rounded-full bg-gray-300" />
                                <span>{rows.length} rows ready</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {parseError && <p className="mt-3 text-sm text-red-600">{parseError}</p>}
              </div>
            </div>

            {rows.length > 0 && (
              <div className="min-w-0 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-lg font-medium text-gray-900">Preview</h3>
                    <p className="text-sm text-gray-600">First 5 rows from the uploaded file</p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <div className="w-fit">
                      <GrayButton text="Cancel" onClick={handleCancel} />
                    </div>

                    <div className="w-fit">
                      <AccentButton
                        text={importing ? "Importing..." : "Import Leads"}
                        onClick={handleRequestImport}
                        disabled={importing || rows.length === 0}
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full overflow-x-auto">
                  <table className="min-w-[900px] table-fixed text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        {previewHeaders.map((h) => (
                          <th key={h} className="w-44 px-4 py-3 text-left font-medium text-gray-700 first:w-36">
                            <span className="block truncate" title={h}>
                              {h}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {previewRows.map((r, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                          {previewHeaders.map((h) => (
                            <td key={h} className="w-44 px-4 py-3 align-top text-gray-800 first:w-36">
                              <span className="block max-h-20 overflow-hidden break-words">{String(r[h] ?? "")}</span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="min-w-0 space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
                  <Icon icon="mdi:tune-variant" width={20} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg font-medium text-gray-900">Import Settings</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Choose a source and campaign for leads that do not already have them in the file.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Select
                  label="Fallback Source"
                  value={selectedFallbackSource}
                  onChange={(value) => {
                    setSelectedFallbackSource(value);

                    if (value !== OTHER_SOURCE_VALUE) {
                      setOtherFallbackSource("");
                    }
                  }}
                  options={sourceOptions}
                  placeholder={sourcesLoading ? "Loading sources..." : "Select source"}
                  isDisabled={sourcesLoading}
                />

                {selectedFallbackSource === OTHER_SOURCE_VALUE && (
                  <TextInput
                    label="Source Name"
                    placeholder="Enter source name"
                    value={otherFallbackSource}
                    onChange={(e) => setOtherFallbackSource(e.target.value)}
                  />
                )}

                <Select
                  label="Fallback Campaign"
                  value={selectedFallbackCampaign}
                  onChange={(value) => {
                    setSelectedFallbackCampaign(value);

                    if (value !== OTHER_CAMPAIGN_VALUE) {
                      setOtherFallbackCampaign("");
                    }
                  }}
                  options={campaignOptions}
                  placeholder={campaignsLoading ? "Loading campaigns..." : "Select campaign"}
                  isDisabled={campaignsLoading}
                />

                {selectedFallbackCampaign === OTHER_CAMPAIGN_VALUE && (
                  <TextInput
                    label="Campaign Name"
                    placeholder="Enter campaign name"
                    value={otherFallbackCampaign}
                    onChange={(e) => setOtherFallbackCampaign(e.target.value)}
                  />
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
                  <Icon icon="mdi:file-document-outline" width={20} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg font-medium text-gray-900">CSV Template</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Download the template to make sure your file has the expected columns.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-700">
                  Imports are processed in <span className="font-semibold">300-row batches</span>.
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <div className="w-fit">
                  <AccentButton text="Download Template CSV" onClick={handleDownloadTemplate} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <ConfirmUploadModal
          isOpen={isConfirmUploadOpen}
          file={file}
          rowCount={rows.length}
          fallbackSource={resolvedFallbackSource}
          fallbackCampaign={resolvedFallbackCampaign}
          loading={importing}
          onCancel={() => setIsConfirmUploadOpen(false)}
          onConfirm={handleConfirmImport}
        />
      </div>
    </DefaultLayout>
  );
}

export default LeadsImport;
