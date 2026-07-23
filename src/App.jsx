import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronDown,
  Plus,
  Clock,
  Link2,
  AlertCircle,
  CircleCheck,
  ArrowLeft,
  RotateCcw,
  Trash2,
  FileStack,
  Copy,
  Download,
  Save,
  Eye,
  RefreshCw,
  Check,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Palette / type tokens — blueprint / drafting-table theme
// ---------------------------------------------------------------------------
const C = {
  bg: "#C7D5EC",
  panel: "#FFFFFF",
  panelAlt: "#BCCCE7",
  gridLine: "rgba(30,64,175,0.14)",
  border: "#9FB4D6",
  borderSoft: "#AFC1DE",
  text: "#0F1A2E",
  textDim: "#2E3F5C",
  textFaint: "#5A6E90",
  teal: "#0D9488",
  stamp: "#DC2626",
  amber: "#D97706",
  violet: "#7C3AED",
  green: "#15803D",
  steel: "#2563EB",
  onAccent: "#FFFFFF",
};

const FONT_DISPLAY = "'Space Grotesk', sans-serif";
const FONT_MONO = "'IBM Plex Mono', monospace";
const FONT_BODY = "'Inter', sans-serif";

const INDUSTRIES = [
  { id: "construction", label: "Construction", color: C.amber },
  { id: "manufacturing", label: "Manufacturing", color: C.steel },
  { id: "software", label: "Software / IT", color: C.teal },
  { id: "pharmacy", label: "Pharmacy", color: C.violet },
];

const TEMPLATES = [
  {
    id: "software",
    industry: "software",
    label: "Software Release Note",
    color: C.teal,
    fields: [
      { id: "projectName", label: "Project Name", type: "text", required: true },
      { id: "version", label: "Release Version", type: "text", required: true },
      { id: "releaseDate", label: "Release Date", type: "date", required: true },
      { id: "summary", label: "Summary of Changes", type: "textarea", required: true },
      { id: "knownIssues", label: "Known Issues", type: "textarea", required: false },
      {
        id: "risk",
        label: "Risk Level",
        type: "select",
        required: true,
        options: ["Low", "Medium", "High"],
      },
      { id: "owner", label: "Owner", type: "text", required: true },
    ],
  },
  {
    id: "sprint",
    industry: "software",
    label: "Sprint Status Report",
    color: C.amber,
    fields: [
      { id: "projectName", label: "Project Name", type: "text", required: true },
      { id: "sprintNumber", label: "Sprint Number", type: "text", required: true },
      { id: "sprintDates", label: "Sprint Dates", type: "text", required: true },
      { id: "sprintGoal", label: "Sprint Goal", type: "textarea", required: true },
      { id: "completedWork", label: "Completed Tasks / Story Points", type: "textarea", required: true },
      { id: "blockers", label: "Blockers / Risks", type: "textarea", required: false },
      { id: "velocity", label: "Velocity", type: "number", required: false },
      {
        id: "status",
        label: "Status",
        type: "select",
        required: true,
        options: ["On Track", "At Risk", "Delayed"],
      },
    ],
  },
  {
    id: "design",
    industry: "software",
    label: "Technical Design Document",
    color: C.violet,
    fields: [
      { id: "projectName", label: "System / Feature Name", type: "text", required: true },
      { id: "author", label: "Author", type: "text", required: true },
      { id: "overview", label: "Overview / Problem Statement", type: "textarea", required: true },
      { id: "architecture", label: "Proposed Architecture", type: "textarea", required: true },
      { id: "alternatives", label: "Alternatives Considered", type: "textarea", required: false },
      { id: "risks", label: "Risks & Mitigations", type: "textarea", required: false },
      {
        id: "status",
        label: "Status",
        type: "select",
        required: true,
        options: ["Draft", "In Review", "Approved"],
      },
    ],
  },
  {
    id: "incident",
    industry: "software",
    label: "Incident / Bug Report",
    color: C.stamp,
    fields: [
      { id: "projectName", label: "System Name", type: "text", required: true },
      {
        id: "severity",
        label: "Severity",
        type: "select",
        required: true,
        options: ["Critical", "High", "Medium", "Low"],
      },
      { id: "reportedDate", label: "Reported Date", type: "date", required: true },
      { id: "description", label: "Description", type: "textarea", required: true },
      { id: "rootCause", label: "Root Cause", type: "textarea", required: false },
      { id: "resolution", label: "Resolution", type: "textarea", required: true },
      {
        id: "status",
        label: "Status",
        type: "select",
        required: true,
        options: ["Open", "In Progress", "Resolved", "Closed"],
      },
    ],
  },
  {
    id: "sow",
    industry: "software",
    label: "Statement of Work (SOW)",
    color: C.steel,
    fields: [
      { id: "projectName", label: "Engagement Name", type: "text", required: true },
      { id: "clientName", label: "Client Name", type: "text", required: true },
      { id: "scope", label: "Scope of Work", type: "textarea", required: true },
      { id: "deliverables", label: "Deliverables", type: "textarea", required: true },
      { id: "startDate", label: "Effective Date", type: "date", required: true },
      { id: "duration", label: "Duration / Timeline", type: "text", required: true },
      { id: "paymentTerms", label: "Payment Terms", type: "text", required: true },
      { id: "exclusions", label: "Assumptions & Exclusions", type: "textarea", required: false },
      { id: "pointOfContact", label: "Point of Contact", type: "text", required: true },
      {
        id: "approvalStatus",
        label: "Approval Status",
        type: "select",
        required: true,
        options: ["Draft", "Pending Signature", "Signed", "Amended"],
      },
    ],
  },
  {
    id: "constructionProgress",
    industry: "construction",
    label: "Construction Progress Report",
    color: C.amber,
    fields: [
      { id: "projectName", label: "Project Name", type: "text", required: true },
      {
        id: "phase",
        label: "Phase",
        type: "select",
        required: true,
        options: ["Site Prep", "Foundation", "Framing", "MEP", "Finishing", "Closeout"],
      },
      { id: "completion", label: "Completion %", type: "number", required: true },
      { id: "budgetUsed", label: "Budget Used (USD)", type: "number", required: true },
      { id: "incidents", label: "Safety Incidents", type: "number", required: false },
      { id: "milestone", label: "Next Milestone", type: "text", required: true },
    ],
  },
  {
    id: "siteSafety",
    industry: "construction",
    label: "Site Safety Report",
    color: C.stamp,
    fields: [
      { id: "projectName", label: "Project Name", type: "text", required: true },
      { id: "inspectionDate", label: "Inspection Date", type: "date", required: true },
      { id: "inspector", label: "Inspector", type: "text", required: true },
      { id: "incidentsReported", label: "Incidents Reported", type: "textarea", required: true },
      { id: "correctiveActions", label: "Corrective Actions", type: "textarea", required: false },
      {
        id: "complianceStatus",
        label: "Compliance Status",
        type: "select",
        required: true,
        options: ["Compliant", "Non-Compliant", "Under Review"],
      },
    ],
  },
  {
    id: "productionRun",
    industry: "manufacturing",
    label: "Production Run Report",
    color: C.steel,
    fields: [
      { id: "projectName", label: "Line / Product Name", type: "text", required: true },
      { id: "runDate", label: "Run Date", type: "date", required: true },
      { id: "unitsProduced", label: "Units Produced", type: "number", required: true },
      { id: "defectRate", label: "Defect Rate (%)", type: "number", required: true },
      { id: "downtime", label: "Downtime (hrs)", type: "number", required: false },
      { id: "supervisor", label: "Shift Supervisor", type: "text", required: true },
      {
        id: "status",
        label: "Status",
        type: "select",
        required: true,
        options: ["Completed", "In Progress", "Delayed"],
      },
    ],
  },
  {
    id: "qualityInspection",
    industry: "manufacturing",
    label: "Quality Inspection Report",
    color: C.violet,
    fields: [
      { id: "projectName", label: "Product / Batch", type: "text", required: true },
      { id: "inspectionDate", label: "Inspection Date", type: "date", required: true },
      { id: "inspector", label: "Inspector", type: "text", required: true },
      { id: "sampleSize", label: "Sample Size", type: "number", required: true },
      { id: "defectsFound", label: "Defects Found", type: "textarea", required: false },
      {
        id: "result",
        label: "Result",
        type: "select",
        required: true,
        options: ["Pass", "Fail", "Conditional Pass"],
      },
    ],
  },
  {
    id: "batchRecord",
    industry: "pharmacy",
    label: "Batch Manufacturing Record",
    color: C.violet,
    fields: [
      { id: "projectName", label: "Product Name", type: "text", required: true },
      { id: "batchNumber", label: "Batch Number", type: "text", required: true },
      { id: "manufacturingDate", label: "Manufacturing Date", type: "date", required: true },
      { id: "quantityProduced", label: "Quantity Produced", type: "number", required: true },
      { id: "qaReviewer", label: "QA Reviewer", type: "text", required: true },
      { id: "deviationNotes", label: "Deviation Notes", type: "textarea", required: false },
      {
        id: "status",
        label: "Status",
        type: "select",
        required: true,
        options: ["In Process", "Released", "Rejected", "On Hold"],
      },
    ],
  },
  {
    id: "regulatoryCompliance",
    industry: "pharmacy",
    label: "Regulatory Compliance Report",
    color: C.stamp,
    fields: [
      { id: "projectName", label: "Product / Site", type: "text", required: true },
      { id: "regulationRef", label: "Regulation Reference", type: "text", required: true },
      { id: "auditDate", label: "Audit Date", type: "date", required: true },
      { id: "findings", label: "Findings", type: "textarea", required: true },
      { id: "correctiveActionPlan", label: "Corrective Action Plan", type: "textarea", required: false },
      {
        id: "complianceStatus",
        label: "Compliance Status",
        type: "select",
        required: true,
        options: ["Compliant", "Minor Findings", "Major Findings", "Non-Compliant"],
      },
    ],
  },
];

const templateOf = (id) => TEMPLATES.find((t) => t.id === id);
const STORAGE_KEY = "pm-artifacts";
const DRAFT_KEY = "pm-draft";

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function artifactPlainText(artifact, template) {
  const lines = [
    template.label.toUpperCase(),
    artifact.projectName,
    `REV ${String(artifact.rev).padStart(2, "0")} — ${new Date(artifact.createdAt).toLocaleDateString()}`,
    "",
  ];
  template.fields.forEach((f) => {
    const v = artifact.data[f.id];
    if (v || v === 0) lines.push(`${f.label}: ${v}`);
  });
  return lines.join("\n");
}

function artifactDocumentHtml(artifact, template) {
  const rows = template.fields
    .map((f) => {
      const v = artifact.data[f.id];
      if (!v && v !== 0) return "";
      return `<tr><td style="padding:6px 14px;font-weight:600;vertical-align:top;white-space:nowrap;color:#444;border-bottom:1px solid #e2e2e2;">${escapeHtml(
        f.label
      )}</td><td style="padding:6px 14px;border-bottom:1px solid #e2e2e2;">${escapeHtml(String(v)).replace(
        /\n/g,
        "<br/>"
      )}</td></tr>`;
    })
    .join("");
  return `<div style="font-family:Arial,Helvetica,sans-serif;color:#111;">
    <h2 style="margin:0 0 4px;">${escapeHtml(artifact.projectName)}</h2>
    <div style="color:#666;font-size:12px;margin-bottom:16px;">${escapeHtml(
      template.label
    )} &middot; REV ${String(artifact.rev).padStart(2, "0")} &middot; ${new Date(
    artifact.createdAt
  ).toLocaleDateString()}</div>
    <table style="border-collapse:collapse;width:100%;">${rows}</table>
  </div>`;
}

function downloadArtifactDocx(artifact, template) {
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
  <head><meta charset="utf-8"><title>${escapeHtml(artifact.projectName)}</title></head>
  <body>${artifactDocumentHtml(artifact, template)}</body></html>`;
  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${artifact.projectName.replace(/\s+/g, "-")}-REV${String(artifact.rev).padStart(2, "0")}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadArtifactPdf(artifact, template) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`<html><head><meta charset="utf-8"><title>${escapeHtml(
    artifact.projectName
  )}</title></head><body>${artifactDocumentHtml(artifact, template)}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 250);
}

function timeAgo(ts) {
  if (!ts) return null;
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min${m === 1 ? "" : "s"} ago`;
  const h = Math.floor(m / 60);
  return `${h} hr${h === 1 ? "" : "s"} ago`;
}

// ---------------------------------------------------------------------------

export default function TitleBlock() {
  const [industryId, setIndustryId] = useState(INDUSTRIES[0].id);
  const [templateId, setTemplateId] = useState(
    TEMPLATES.find((t) => t.industry === INDUSTRIES[0].id).id
  );
  const [formData, setFormData] = useState({});
  const [artifacts, setArtifacts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [storageOk, setStorageOk] = useState(true);
  const [viewingId, setViewingId] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const [industryMenuOpen, setIndustryMenuOpen] = useState(false);
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState(null);
  const [modal, setModal] = useState(null); // { type: 'delete', id } | { type: 'discard', run: fn }
  const [, forceTick] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY, false);
        if (res && res.value) setArtifacts(JSON.parse(res.value));
      } catch (e) {
        // no prior data — fresh workspace
      }
      try {
        const draftRes = await window.storage.get(DRAFT_KEY, false);
        if (draftRes && draftRes.value) {
          const d = JSON.parse(draftRes.value);
          if (d.industryId) setIndustryId(d.industryId);
          if (d.templateId) setTemplateId(d.templateId);
          if (d.formData) setFormData(d.formData);
          if (d.savedAt) setDraftSavedAt(d.savedAt);
        }
      } catch (e) {
        // no draft on file
      }
      setLoaded(true);
    })();
  }, []);

  // tick every 15s so "Saved • Xs ago" stays fresh
  useEffect(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 15000);
    return () => clearInterval(t);
  }, []);

  const persist = useCallback(async (list) => {
    try {
      const result = await window.storage.set(STORAGE_KEY, JSON.stringify(list), false);
      setStorageOk(!!result);
    } catch (e) {
      setStorageOk(false);
    }
  }, []);

  const template = templateOf(templateId);
  const viewingArtifact = artifacts.find((a) => a.id === viewingId) || null;

  const isDirty =
    !viewingArtifact && Object.values(formData).some((v) => String(v || "").trim().length > 0);

  const saveDraft = useCallback(async () => {
    try {
      await window.storage.set(
        DRAFT_KEY,
        JSON.stringify({ industryId, templateId, formData, savedAt: Date.now() }),
        false
      );
      setDraftSavedAt(Date.now());
    } catch (e) {
      // draft save failed silently — non-critical
    }
  }, [industryId, templateId, formData]);

  const clearDraft = useCallback(async () => {
    try {
      await window.storage.delete(DRAFT_KEY, false);
    } catch (e) {
      // nothing to clear
    }
    setDraftSavedAt(null);
  }, []);

  // autosave draft 1.5s after the form goes idle
  useEffect(() => {
    if (viewingArtifact || !isDirty) return;
    const t = setTimeout(() => {
      saveDraft();
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, viewingArtifact]);

  // warn on tab close / navigation if there's unsaved form data
  useEffect(() => {
    function handler(e) {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const missingFields = template.fields.filter(
    (f) => f.required && !String(formData[f.id] || "").trim()
  );

  function updateField(id, value) {
    setFormData((prev) => ({ ...prev, [id]: value }));
  }

  function findLineage(tId, projectName) {
    return artifacts
      .filter(
        (a) =>
          a.templateId === tId &&
          a.projectName.trim().toLowerCase() === projectName.trim().toLowerCase()
      )
      .sort((a, b) => b.rev - a.rev);
  }

  const liveProjectName = formData.projectName || "";
  const liveLineage = liveProjectName.trim() ? findLineage(templateId, liveProjectName) : [];
  const livePrev = liveLineage[0] || null;

  function handleGenerate() {
    if (missingFields.length) {
      setShowErrors(true);
      return;
    }
    const projectName = String(formData.projectName).trim();
    const lineage = findLineage(templateId, projectName);
    const prev = lineage[0] || null;
    const rev = prev ? prev.rev + 1 : 1;
    const changedFields = prev
      ? template.fields
          .filter((f) => String(formData[f.id] || "") !== String(prev.data[f.id] || ""))
          .map((f) => f.id)
      : [];

    const newArtifact = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `art-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      templateId,
      projectName,
      rev,
      data: { ...formData },
      prevId: prev ? prev.id : null,
      changedFields,
      createdAt: new Date().toISOString(),
    };

    const updated = [...artifacts, newArtifact];
    setArtifacts(updated);
    persist(updated);
    setViewingId(newArtifact.id);
    setFormData({});
    setShowErrors(false);
    setPreviewOpen(false);
    clearDraft();
  }

  function resetFormFields() {
    setFormData({});
    setShowErrors(false);
  }

  function requestDiscardOrRun(action) {
    if (isDirty) {
      setModal({ type: "discard", run: action });
    } else {
      action();
    }
  }

  function startNew() {
    requestDiscardOrRun(() => {
      setViewingId(null);
      setFormData({});
      setShowErrors(false);
      setPreviewOpen(false);
    });
  }

  function goToArtifact(id) {
    requestDiscardOrRun(() => setViewingId(id));
  }

  function changeIndustry(id) {
    setIndustryId(id);
    const first = TEMPLATES.find((t) => t.industry === id);
    setTemplateId(first.id);
    setFormData({});
    setShowErrors(false);
  }

  function reviseFrom(artifact) {
    const t = templateOf(artifact.templateId);
    setIndustryId(t.industry);
    setTemplateId(artifact.templateId);
    setFormData({ ...artifact.data });
    setViewingId(null);
    setShowErrors(false);
    setPreviewOpen(false);
  }

  function duplicateFrom(artifact) {
    const t = templateOf(artifact.templateId);
    setIndustryId(t.industry);
    setTemplateId(artifact.templateId);
    setFormData({ ...artifact.data, projectName: `${artifact.data.projectName} (Copy)` });
    setViewingId(null);
    setShowErrors(false);
    setPreviewOpen(false);
  }

  function requestDelete(id) {
    setModal({ type: "delete", id });
  }

  function handleModalConfirm() {
    if (!modal) return;
    if (modal.type === "delete") {
      const updated = artifacts
        .filter((a) => a.id !== modal.id)
        .map((a) => (a.prevId === modal.id ? { ...a, prevId: null, changedFields: [] } : a));
      setArtifacts(updated);
      persist(updated);
      if (viewingId === modal.id) setViewingId(null);
    } else if (modal.type === "discard") {
      clearDraft();
      modal.run();
    }
    setModal(null);
  }

  async function clearAll() {
    setArtifacts([]);
    await persist([]);
    setViewingId(null);
    setConfirmClear(false);
  }

  const sortedLog = [...artifacts].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div
      style={{
        fontFamily: FONT_BODY,
        background: C.bg,
        color: C.text,
        minHeight: "100%",
        backgroundImage: `linear-gradient(${C.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${C.gridLine} 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      }}
      className="w-full min-h-screen flex flex-col"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap');
        ::selection { background: ${C.teal}; color: ${C.onAccent}; }
        .tb-scroll::-webkit-scrollbar { width: 8px; }
        .tb-scroll::-webkit-scrollbar-thumb { background: ${C.borderSoft}; border-radius: 4px; }
        .tb-input:focus { outline: none; border-color: ${C.teal} !important; box-shadow: 0 0 0 3px rgba(13,148,136,0.15); }
        .tb-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        @keyframes stampIn { 0% { transform: scale(1.5) rotate(-14deg); opacity: 0; } 100% { transform: scale(1) rotate(-8deg); opacity: 1; } }
      `}</style>

      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4 shrink-0"
        style={{ borderBottom: `1px solid ${C.border}`, background: C.panelAlt }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 flex items-center justify-center rounded-sm"
            style={{ border: `1.5px solid ${C.teal}`, color: C.teal }}
          >
            <FileStack size={18} />
          </div>
          <div>
            <div
              style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, letterSpacing: "0.06em" }}
              className="text-lg leading-none"
            >
              TITLEBLOCK
            </div>
            <div
              style={{ fontFamily: FONT_MONO, color: C.textFaint, fontSize: 11 }}
              className="tracking-wide"
            >
              multi-industry artifact control
            </div>
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-1">
          <div style={{ fontFamily: FONT_MONO, color: storageOk ? C.textFaint : C.stamp, fontSize: 11 }}>
            {storageOk ? `${artifacts.length} artifact${artifacts.length === 1 ? "" : "s"} on file` : "storage unavailable — changes may not persist"}
          </div>
          {!viewingArtifact && (
            <div className="flex items-center gap-2" style={{ fontFamily: FONT_MONO, fontSize: 10.5, color: C.textFaint }}>
              {draftSavedAt ? (
                <span className="flex items-center gap-1">
                  <Check size={11} color={C.green} /> Saved {timeAgo(draftSavedAt)}
                </span>
              ) : (
                <span>not saved</span>
              )}
              {livePrev && (
                <>
                  <span>·</span>
                  <button onClick={() => goToArtifact(livePrev.id)} style={{ color: C.teal }}>
                    Version History
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
        {/* Sidebar */}
        <aside
          className="lg:w-80 w-full shrink-0 flex flex-col"
          style={{ borderRight: `1px solid ${C.border}`, background: C.panel }}
        >
          <div className="p-5" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
            <button
              onClick={startNew}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm font-medium text-sm transition"
              style={{
                background: C.teal,
                color: C.onAccent,
                fontFamily: FONT_DISPLAY,
                fontWeight: 600,
              }}
            >
              <Plus size={16} /> New Artifact
            </button>
          </div>

          <div className="px-5 pt-4 pb-2 flex items-center gap-2">
            <Clock size={13} color={C.textFaint} />
            <span
              style={{ fontFamily: FONT_MONO, color: C.textFaint, fontSize: 11 }}
              className="uppercase tracking-widest"
            >
              Revision Log
            </span>
          </div>

          <div className="flex-1 overflow-y-auto tb-scroll px-3 pb-4">
            {!loaded ? (
              <div style={{ color: C.textFaint, fontSize: 13 }} className="px-2 py-6 text-center">
                Loading artifacts…
              </div>
            ) : sortedLog.length === 0 ? (
              <div
                style={{ color: C.textFaint, fontSize: 12.5, fontFamily: FONT_BODY }}
                className="px-3 py-6 text-center leading-relaxed"
              >
                Nothing on file yet. Fill in a template and generate your first artifact — it
                becomes revision 01 for that project.
              </div>
            ) : (
              <ul className="flex flex-col gap-1">
                {sortedLog.map((a) => {
                  const t = templateOf(a.templateId);
                  const active = a.id === viewingId;
                  return (
                    <li key={a.id} className="group relative">
                      <button
                        onClick={() => goToArtifact(a.id)}
                        className="w-full text-left pl-3 pr-8 py-2.5 rounded-sm transition"
                        style={{
                          background: active ? C.panelAlt : "transparent",
                          border: `1px solid ${active ? C.borderSoft : "transparent"}`,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: t.color }}
                          />
                          <span
                            className="truncate text-sm"
                            style={{ fontFamily: FONT_BODY, fontWeight: 500 }}
                          >
                            {a.projectName}
                          </span>
                        </div>
                        <div
                          className="flex items-center gap-2 mt-1"
                          style={{ fontFamily: FONT_MONO, fontSize: 10.5, color: C.textFaint }}
                        >
                          <span>REV {String(a.rev).padStart(2, "0")}</span>
                          <span>·</span>
                          <span>{t.label}</span>
                          <span>·</span>
                          <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                        </div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          requestDelete(a.id);
                        }}
                        title="Delete artifact"
                        className="absolute top-2.5 right-2 p-1 rounded-sm opacity-0 group-hover:opacity-100 transition"
                        style={{ color: C.stamp }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {artifacts.length > 0 && (
            <div className="p-4" style={{ borderTop: `1px solid ${C.borderSoft}` }}>
              {!confirmClear ? (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-sm text-xs"
                  style={{ color: C.textFaint, fontFamily: FONT_MONO }}
                >
                  <Trash2 size={13} /> clear all artifacts
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={clearAll}
                    className="flex-1 py-2 rounded-sm text-xs"
                    style={{ background: C.stamp, color: C.onAccent, fontFamily: FONT_MONO }}
                  >
                    confirm clear
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="flex-1 py-2 rounded-sm text-xs"
                    style={{ border: `1px solid ${C.borderSoft}`, color: C.textDim, fontFamily: FONT_MONO }}
                  >
                    cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 overflow-y-auto tb-scroll">
          {viewingArtifact ? (
            <ArtifactView
              artifact={viewingArtifact}
              artifacts={artifacts}
              onBack={startNew}
              onJump={(id) => goToArtifact(id)}
              onRevise={() => reviseFrom(viewingArtifact)}
              onDuplicate={() => duplicateFrom(viewingArtifact)}
              onDelete={() => requestDelete(viewingArtifact.id)}
            />
          ) : (
            <FormView
              industryId={industryId}
              setIndustryId={changeIndustry}
              industryMenuOpen={industryMenuOpen}
              setIndustryMenuOpen={setIndustryMenuOpen}
              template={template}
              templateId={templateId}
              setTemplateId={(id) => {
                setTemplateId(id);
                setFormData({});
                setShowErrors(false);
              }}
              formData={formData}
              updateField={updateField}
              missingFields={missingFields}
              showErrors={showErrors}
              livePrev={livePrev}
              onJumpPrev={() => goToArtifact(livePrev.id)}
              onGenerate={handleGenerate}
              templateMenuOpen={templateMenuOpen}
              setTemplateMenuOpen={setTemplateMenuOpen}
              previewOpen={previewOpen}
              setPreviewOpen={setPreviewOpen}
              onReset={() => requestDiscardOrRun(resetFormFields)}
              onSaveDraft={saveDraft}
            />
          )}
        </main>
      </div>

      <ConfirmModal
        open={!!modal}
        title={modal?.type === "delete" ? "Delete this artifact?" : "Discard unsaved changes?"}
        message={
          modal?.type === "delete"
            ? "This will permanently remove this artifact from the revision log. Newer revisions that reference it will lose that link. This can't be undone."
            : "You have unfilled form changes that haven't been generated. Use Save Draft first if you want to keep them, or discard to continue."
        }
        confirmLabel={modal?.type === "delete" ? "Yes, Delete" : "Discard"}
        danger={modal?.type === "delete"}
        onConfirm={handleModalConfirm}
        onCancel={() => setModal(null)}
      />
    </div>
  );
}

function ConfirmModal({ open, title, message, confirmLabel, onConfirm, onCancel, danger }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,26,46,0.45)" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-sm p-6"
        style={{ background: C.panel, border: `1px solid ${C.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 16, color: C.text }} className="mb-2">
          {title}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 13.5, color: C.textDim }} className="mb-6 leading-relaxed">
          {message}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-sm text-sm"
            style={{
              background: danger ? C.stamp : C.teal,
              color: C.onAccent,
              fontFamily: FONT_DISPLAY,
              fontWeight: 600,
            }}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-sm text-sm"
            style={{ border: `1px solid ${C.border}`, color: C.textDim, fontFamily: FONT_DISPLAY, fontWeight: 500 }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Form (create) view
// ---------------------------------------------------------------------------
function FormView({
  industryId,
  setIndustryId,
  industryMenuOpen,
  setIndustryMenuOpen,
  template,
  templateId,
  setTemplateId,
  formData,
  updateField,
  missingFields,
  showErrors,
  livePrev,
  onJumpPrev,
  onGenerate,
  templateMenuOpen,
  setTemplateMenuOpen,
  previewOpen,
  setPreviewOpen,
  onReset,
  onSaveDraft,
}) {
  const missingIds = new Set(missingFields.map((f) => f.id));
  const industry = INDUSTRIES.find((i) => i.id === industryId);
  const templatesInIndustry = TEMPLATES.filter((t) => t.industry === industryId);

  return (
    <div
      className={
        previewOpen
          ? "max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
          : "max-w-2xl mx-auto px-6 py-10"
      }
    >
      <div>
      <div style={{ fontFamily: FONT_MONO, color: C.textFaint, fontSize: 11 }} className="uppercase tracking-widest mb-2">
        Step 1 — type of industry
      </div>

      {/* Industry dropdown */}
      <div className="relative mb-8">
        <button
          onClick={() => setIndustryMenuOpen(!industryMenuOpen)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-sm"
          style={{ background: C.panel, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: industry.color }} />
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600 }}>{industry.label}</span>
          </div>
          <ChevronDown
            size={16}
            color={C.textFaint}
            style={{ transform: industryMenuOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
          />
        </button>
        {industryMenuOpen && (
          <ul
            className="absolute z-10 w-full mt-1 rounded-sm overflow-hidden"
            style={{ background: C.panel, border: `1px solid ${C.border}` }}
          >
            {INDUSTRIES.map((i) => (
              <li key={i.id}>
                <button
                  onClick={() => {
                    setIndustryId(i.id);
                    setIndustryMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left"
                  style={{
                    background: i.id === industryId ? C.panelAlt : "transparent",
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: i.color }} />
                  <span style={{ fontFamily: FONT_BODY, fontSize: 14 }}>{i.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ fontFamily: FONT_MONO, color: C.textFaint, fontSize: 11 }} className="uppercase tracking-widest mb-2">
        Step 2 — select template
      </div>

      {/* Template dropdown */}
      <div className="relative mb-8">
        <button
          onClick={() => setTemplateMenuOpen(!templateMenuOpen)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-sm"
          style={{ background: C.panel, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: template.color }} />
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600 }}>{template.label}</span>
          </div>
          <ChevronDown
            size={16}
            color={C.textFaint}
            style={{ transform: templateMenuOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
          />
        </button>
        {templateMenuOpen && (
          <ul
            className="absolute z-10 w-full mt-1 rounded-sm overflow-hidden"
            style={{ background: C.panel, border: `1px solid ${C.border}` }}
          >
            {templatesInIndustry.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => {
                    setTemplateId(t.id);
                    setTemplateMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left"
                  style={{
                    background: t.id === templateId ? C.panelAlt : "transparent",
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                  <span style={{ fontFamily: FONT_BODY, fontSize: 14 }}>{t.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {livePrev && (
        <button
          onClick={onJumpPrev}
          className="w-full flex items-center gap-2 px-4 py-2.5 mb-6 rounded-sm text-left"
          style={{ background: "rgba(13,148,136,0.08)", border: `1px dashed ${C.teal}` }}
        >
          <Link2 size={14} color={C.teal} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.teal }}>
            continues REV {String(livePrev.rev).padStart(2, "0")} for "{livePrev.projectName}" — dated{" "}
            {new Date(livePrev.createdAt).toLocaleDateString()}
          </span>
        </button>
      )}

      <div className="flex items-center justify-between mb-4">
        <div style={{ fontFamily: FONT_MONO, color: C.textFaint, fontSize: 11 }} className="uppercase tracking-widest">
          Step 3 — required data
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1"
          style={{ fontFamily: FONT_MONO, fontSize: 10.5, color: C.textFaint }}
        >
          <RefreshCw size={11} /> reset form
        </button>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        {template.fields.map((f) => (
          <div key={f.id}>
            <label
              className="flex items-center gap-1.5 mb-1.5"
              style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 500, color: C.textDim }}
            >
              {f.label}
              {f.required && <span style={{ color: C.stamp }}>*</span>}
            </label>
            <FieldInput field={f} value={formData[f.id] || ""} onChange={(v) => updateField(f.id, v)} />
            {showErrors && missingIds.has(f.id) && (
              <div className="flex items-center gap-1.5 mt-1.5" style={{ color: C.stamp, fontSize: 12 }}>
                <AlertCircle size={12} /> required
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: missingFields.length ? C.textFaint : C.green }}>
          {missingFields.length
            ? `${missingFields.length} mandatory field${missingFields.length === 1 ? "" : "s"} remaining`
            : "all mandatory fields complete"}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSaveDraft}
            className="flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm"
            style={{ border: `1px solid ${C.border}`, color: C.textDim, fontFamily: FONT_DISPLAY, fontWeight: 500 }}
          >
            <Save size={14} /> Save Draft
          </button>
          <button
            onClick={() => setPreviewOpen(!previewOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm"
            style={
              previewOpen
                ? { background: C.panelAlt, border: `1px solid ${C.teal}`, color: C.teal, fontFamily: FONT_DISPLAY, fontWeight: 600 }
                : { border: `1px solid ${C.border}`, color: C.textDim, fontFamily: FONT_DISPLAY, fontWeight: 500 }
            }
          >
            <Eye size={14} /> {previewOpen ? "Hide Preview" : "Preview"}
          </button>
          <button
            onClick={onGenerate}
            className="tb-btn-primary flex items-center gap-2 px-5 py-2.5 rounded-sm"
            style={{
              background: C.teal,
              color: C.onAccent,
              fontFamily: FONT_DISPLAY,
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Generate Artifact
          </button>
        </div>
      </div>
      </div>

      {previewOpen && (
        <div className="lg:sticky lg:top-6">
          <LivePreview template={template} formData={formData} />
        </div>
      )}
    </div>
  );
}

function LivePreview({ template, formData }) {
  return (
    <div className="rounded-sm overflow-hidden" style={{ background: C.panel, border: `1px dashed ${C.border}` }}>
      <div
        className="px-4 py-2 flex items-center justify-between"
        style={{ background: C.panelAlt, borderBottom: `1px solid ${C.borderSoft}` }}
      >
        <span style={{ fontFamily: FONT_MONO, fontSize: 10.5, color: C.textFaint }} className="uppercase tracking-widest">
          Live Preview — not yet saved
        </span>
        <Eye size={13} color={C.textFaint} />
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: template.color }} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.textFaint }} className="uppercase tracking-widest">
            {template.label}
          </span>
        </div>
        <h1
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 22,
            color: formData.projectName ? C.text : C.textFaint,
            fontStyle: formData.projectName ? "normal" : "italic",
          }}
        >
          {formData.projectName || "Untitled project"}
        </h1>
      </div>
      <div style={{ borderTop: `1px solid ${C.borderSoft}` }}>
        {template.fields.map((f) => {
          const v = formData[f.id];
          const has = v || v === 0;
          return (
            <div
              key={f.id}
              className="px-6 py-3 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4"
              style={{ borderBottom: `1px solid ${C.borderSoft}` }}
            >
              <div className="sm:w-40 shrink-0" style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.textFaint }}>
                {f.label}
              </div>
              <div
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 13.5,
                  color: has ? C.text : C.textFaint,
                  fontStyle: has ? "normal" : "italic",
                  whiteSpace: "pre-wrap",
                }}
              >
                {has ? String(v) : "—"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FieldInput({ field, value, onChange }) {
  const base = {
    background: C.panelAlt,
    border: `1px solid ${C.border}`,
    color: C.text,
    fontFamily: FONT_BODY,
    fontSize: 14,
  };
  if (field.type === "textarea") {
    return (
      <textarea
        className="tb-input w-full px-3 py-2.5 rounded-sm resize-none"
        style={{ ...base, minHeight: 84 }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  if (field.type === "select") {
    return (
      <select
        className="tb-input w-full px-3 py-2.5 rounded-sm"
        style={base}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select…</option>
        {field.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }
  return (
    <input
      className="tb-input w-full px-3 py-2.5 rounded-sm"
      style={base}
      type={field.type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

// ---------------------------------------------------------------------------
// Generated artifact / document view
// ---------------------------------------------------------------------------
function ArtifactView({ artifact, artifacts, onBack, onJump, onRevise, onDuplicate, onDelete }) {
  const template = templateOf(artifact.templateId);
  const prev = artifact.prevId ? artifacts.find((a) => a.id === artifact.prevId) : null;
  const nextRevs = artifacts.filter((a) => a.prevId === artifact.id);
  const changed = new Set(artifact.changedFields || []);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(artifactPlainText(artifact, template));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      // clipboard blocked — nothing more we can do client-side
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 mb-6"
        style={{ color: C.textFaint, fontFamily: FONT_MONO, fontSize: 12 }}
      >
        <ArrowLeft size={13} /> new artifact
      </button>

      {prev && (
        <button
          onClick={() => onJump(prev.id)}
          className="w-full flex items-center gap-2 px-4 py-2.5 mb-4 rounded-sm text-left"
          style={{ background: "rgba(13,148,136,0.08)", border: `1px dashed ${C.teal}` }}
        >
          <Link2 size={14} color={C.teal} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.teal }}>
            references REV {String(prev.rev).padStart(2, "0")} — {artifact.changedFields.length} field
            {artifact.changedFields.length === 1 ? "" : "s"} changed since
          </span>
        </button>
      )}

      {/* Document sheet */}
      <div className="relative rounded-sm overflow-hidden" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
        {/* Stamp */}
        <div
          className="absolute top-5 right-5 flex flex-col items-center justify-center w-16 h-16 rounded-full"
          style={{
            border: `2px solid ${C.stamp}`,
            color: C.stamp,
            transform: "rotate(-8deg)",
            animation: "stampIn 0.35s ease-out",
          }}
        >
          <span style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: "0.05em" }}>REV</span>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 20, lineHeight: 1 }}>
            {String(artifact.rev).padStart(2, "0")}
          </span>
        </div>

        <div className="p-6 pr-24">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full" style={{ background: template.color }} />
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.textFaint }} className="uppercase tracking-widest">
              {template.label}
            </span>
          </div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 24 }}>{artifact.projectName}</h1>
        </div>

        <div style={{ borderTop: `1px solid ${C.borderSoft}` }}>
          {template.fields.map((f) => {
            const v = artifact.data[f.id];
            if (!v && v !== 0) return null;
            return (
              <div
                key={f.id}
                className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4"
                style={{ borderBottom: `1px solid ${C.borderSoft}` }}
              >
                <div
                  className="sm:w-44 shrink-0 flex items-center gap-1.5"
                  style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: C.textFaint }}
                >
                  {f.label}
                  {changed.has(f.id) && (
                    <span style={{ color: C.amber, fontFamily: FONT_MONO }} title="changed from previous revision">
                      Δ
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 14, whiteSpace: "pre-wrap" }}>{String(v)}</div>
              </div>
            );
          })}
        </div>

        {/* Title block */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4"
          style={{ borderTop: `1px solid ${C.border}`, background: C.panelAlt }}
        >
          <TitleCell label="REV" value={String(artifact.rev).padStart(2, "0")} mono />
          <TitleCell label="DATE" value={new Date(artifact.createdAt).toLocaleDateString()} mono />
          <TitleCell label="TEMPLATE" value={template.label} />
          <TitleCell
            label="PREV REV"
            value={prev ? String(prev.rev).padStart(2, "0") : "— origin —"}
            mono
            last
          />
        </div>
      </div>

      {/* Export row */}
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <span style={{ fontFamily: FONT_MONO, fontSize: 10.5, color: C.textFaint }} className="uppercase tracking-widest mr-1">
          Export
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3.5 py-2 rounded-sm text-sm"
          style={{ border: `1px solid ${C.border}`, color: copied ? C.green : C.textDim, fontFamily: FONT_BODY, fontWeight: 500 }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
        </button>
        <button
          onClick={() => downloadArtifactDocx(artifact, template)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-sm text-sm"
          style={{ border: `1px solid ${C.border}`, color: C.textDim, fontFamily: FONT_BODY, fontWeight: 500 }}
        >
          <Download size={14} /> Download Word
        </button>
        <button
          onClick={() => downloadArtifactPdf(artifact, template)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-sm text-sm"
          style={{ border: `1px solid ${C.border}`, color: C.textDim, fontFamily: FONT_BODY, fontWeight: 500 }}
        >
          <Download size={14} /> Download PDF
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-5">
        <button
          onClick={onRevise}
          className="flex items-center gap-2 px-4 py-2 rounded-sm text-sm"
          style={{ border: `1px solid ${C.border}`, color: C.textDim, fontFamily: FONT_DISPLAY, fontWeight: 500 }}
        >
          <RotateCcw size={14} /> Revise this artifact
        </button>
        <button
          onClick={onDuplicate}
          className="flex items-center gap-2 px-4 py-2 rounded-sm text-sm"
          style={{ border: `1px solid ${C.border}`, color: C.textDim, fontFamily: FONT_DISPLAY, fontWeight: 500 }}
        >
          <Copy size={14} /> Duplicate
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-2 px-4 py-2 rounded-sm text-sm"
          style={{ border: `1px solid ${C.border}`, color: C.stamp, fontFamily: FONT_DISPLAY, fontWeight: 500 }}
        >
          <Trash2 size={14} /> Delete
        </button>
        {nextRevs.length > 0 && (
          <button
            onClick={() => onJump(nextRevs[0].id)}
            className="flex items-center gap-2 px-4 py-2 rounded-sm text-sm"
            style={{ color: C.teal, fontFamily: FONT_MONO, fontSize: 12 }}
          >
            <CircleCheck size={14} /> newer revision exists — REV{" "}
            {String(nextRevs[0].rev).padStart(2, "0")}
          </button>
        )}
      </div>
    </div>
  );
}

function TitleCell({ label, value, mono, last }) {
  return (
    <div className="px-4 py-3" style={{ borderRight: last ? "none" : `1px solid ${C.borderSoft}` }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: 9.5, color: C.textFaint }} className="uppercase tracking-widest mb-0.5">
        {label}
      </div>
      <div
        style={{
          fontFamily: mono ? FONT_MONO : FONT_BODY,
          fontSize: 13,
          fontWeight: 500,
          color: C.text,
        }}
        className="truncate"
      >
        {value}
      </div>
    </div>
  );
}
