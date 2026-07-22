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
} from "lucide-react";

// ---------------------------------------------------------------------------
// Palette / type tokens — blueprint / drafting-table theme
// ---------------------------------------------------------------------------
const C = {
  bg: "#F4F7FC",
  panel: "#FFFFFF",
  panelAlt: "#EEF3FB",
  gridLine: "rgba(59,130,246,0.08)",
  border: "#DCE4F0",
  borderSoft: "#E8EEF7",
  text: "#1B2942",
  textDim: "#48597A",
  textFaint: "#8598B8",
  teal: "#0EA5A6",
  stamp: "#E23744",
  amber: "#F5A623",
  violet: "#8B5CF6",
  green: "#16A34A",
  steel: "#3B82F6",
  onAccent: "#FFFFFF",
};

const FONT_DISPLAY = "'Space Grotesk', sans-serif";
const FONT_MONO = "'IBM Plex Mono', monospace";
const FONT_BODY = "'Inter', sans-serif";

const TEMPLATES = [
  {
    id: "software",
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
];

const templateOf = (id) => TEMPLATES.find((t) => t.id === id);
const STORAGE_KEY = "pm-artifacts";

// ---------------------------------------------------------------------------

export default function TitleBlock() {
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [formData, setFormData] = useState({});
  const [artifacts, setArtifacts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [storageOk, setStorageOk] = useState(true);
  const [viewingId, setViewingId] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY, false);
        if (res && res.value) setArtifacts(JSON.parse(res.value));
      } catch (e) {
        // no prior data — fresh workspace
      }
      setLoaded(true);
    })();
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
  }

  function startNew() {
    setViewingId(null);
    setFormData({});
    setShowErrors(false);
  }

  function reviseFrom(artifact) {
    setTemplateId(artifact.templateId);
    setFormData({ ...artifact.data });
    setViewingId(null);
    setShowErrors(false);
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
        .tb-input:focus { outline: none; border-color: ${C.teal} !important; box-shadow: 0 0 0 3px rgba(14,165,166,0.15); }
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
              IT project artifact control
            </div>
          </div>
        </div>
        <div
          style={{ fontFamily: FONT_MONO, color: storageOk ? C.textFaint : C.stamp, fontSize: 11 }}
          className="hidden sm:block"
        >
          {storageOk ? `${artifacts.length} artifact${artifacts.length === 1 ? "" : "s"} on file` : "storage unavailable — changes may not persist"}
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
                    <li key={a.id}>
                      <button
                        onClick={() => setViewingId(a.id)}
                        className="w-full text-left px-3 py-2.5 rounded-sm transition"
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
              onJump={(id) => setViewingId(id)}
              onRevise={() => reviseFrom(viewingArtifact)}
            />
          ) : (
            <FormView
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
              onJumpPrev={() => livePrev && setViewingId(livePrev.id)}
              onGenerate={handleGenerate}
              templateMenuOpen={templateMenuOpen}
              setTemplateMenuOpen={setTemplateMenuOpen}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Form (create) view
// ---------------------------------------------------------------------------
function FormView({
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
}) {
  const missingIds = new Set(missingFields.map((f) => f.id));

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div style={{ fontFamily: FONT_MONO, color: C.textFaint, fontSize: 11 }} className="uppercase tracking-widest mb-2">
        Step 1 — select template
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
            {TEMPLATES.map((t) => (
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
          style={{ background: "rgba(14,165,166,0.08)", border: `1px dashed ${C.teal}` }}
        >
          <Link2 size={14} color={C.teal} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.teal }}>
            continues REV {String(livePrev.rev).padStart(2, "0")} for "{livePrev.projectName}" — dated{" "}
            {new Date(livePrev.createdAt).toLocaleDateString()}
          </span>
        </button>
      )}

      <div style={{ fontFamily: FONT_MONO, color: C.textFaint, fontSize: 11 }} className="uppercase tracking-widest mb-4">
        Step 2 — required data
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

      <div className="flex items-center justify-between">
        <div style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: missingFields.length ? C.textFaint : C.green }}>
          {missingFields.length
            ? `${missingFields.length} mandatory field${missingFields.length === 1 ? "" : "s"} remaining`
            : "all mandatory fields complete"}
        </div>
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
function ArtifactView({ artifact, artifacts, onBack, onJump, onRevise }) {
  const template = templateOf(artifact.templateId);
  const prev = artifact.prevId ? artifacts.find((a) => a.id === artifact.prevId) : null;
  const nextRevs = artifacts.filter((a) => a.prevId === artifact.id);
  const changed = new Set(artifact.changedFields || []);

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
          style={{ background: "rgba(14,165,166,0.08)", border: `1px dashed ${C.teal}` }}
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

      <div className="flex items-center gap-3 mt-5">
        <button
          onClick={onRevise}
          className="flex items-center gap-2 px-4 py-2 rounded-sm text-sm"
          style={{ border: `1px solid ${C.border}`, color: C.textDim, fontFamily: FONT_DISPLAY, fontWeight: 500 }}
        >
          <RotateCcw size={14} /> Revise this artifact
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
