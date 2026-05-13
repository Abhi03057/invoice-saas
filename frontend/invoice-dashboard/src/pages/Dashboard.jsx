import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../components/Layout.css";

const STATS = [
  { key: "total_documents", label: "Total Documents", color: "accent", meta: "all time" },
  { key: "processed",       label: "Processed",       color: "green",  meta: "completed" },
  { key: "processing",      label: "Processing",      color: "blue",   meta: "live" },
  { key: "failed",          label: "Failed",           color: "red",    meta: "needs attention" },
  { key: "uploaded",        label: "Queued",           color: "amber",  meta: "awaiting worker" },
  { key: "total_invoices",  label: "Extracted Invoices", color: "accent", meta: "from processed docs" },
];

const PIPELINE = [
  { label: "Upload",  color: "var(--amber)", key: "uploaded" },
  { label: "Queue",   color: "var(--navy)", key: null },
  { label: "Parse",   color: "var(--blue)",  key: "processing" },
  { label: "Store",   color: "var(--green)", key: "processed" },
];

function fmt(str) {
  if (!str) return "—";
  return new Date(str).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [statsRes, docsRes] = await Promise.allSettled([
        api.get("/stats"),
        api.get("/documents?page=1&limit=5"),
      ]);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
      if (docsRes.status === "fulfilled") {
        const d = docsRes.value.data;
        setRecentDocs(Array.isArray(d) ? d.slice(0, 5) : (d.documents || d.data || []).slice(0, 5));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <div className="page-subtitle" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="live-dot" />
          auto-refresh · 10s
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stat-grid">
        {STATS.map((s) => (
          <div key={s.key} className={`stat-card stat-card--${s.color}`}>
            <div className="stat-label">{s.label}</div>
            {loading ? (
              <div className="skeleton" style={{ height: 36, width: "50%", marginTop: 4 }} />
            ) : (
              <div className="stat-value">{stats?.[s.key] ?? "—"}</div>
            )}
            <div className="stat-meta">{s.meta}</div>
          </div>
        ))}
      </div>

      {/* Pipeline */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">Processing Pipeline</div>
        <div className="pipeline">
          {PIPELINE.map((stage, i) => (
            <div key={stage.label} style={{ display: "flex", alignItems: "center" }}>
              <div className="pipeline-stage">
                <span
                  className="pipeline-stage-dot"
                  style={{ background: stage.color }}
                />
                {stage.label}
                {stage.key && stats && (
                  <span className="pipeline-stage-count">
                    {stats[stage.key] ?? 0}
                  </span>
                )}
              </div>
              {i < PIPELINE.length - 1 && (
                <span className="pipeline-arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="pipeline-tech">PDFs → Redis / BullMQ → background worker → PostgreSQL</div>
        <div className="card-fine-print">Processing pipeline auto-refreshes every 10 seconds</div>
      </div>

      {/* Recent Documents */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="card-header" style={{ padding: "14px 22px 14px", marginBottom: 0, borderBottom: "none" }}>
          <span>Recent Documents</span>
          <button
            className="card-header-action"
            onClick={() => navigate("/documents")}
          >
            View all →
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>File</th>
              <th>Status</th>
              <th>Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 3 }).map((_, j) => (
                    <td key={j}>
                      <div className="skeleton" style={{ height: 14, width: "70%" }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : recentDocs.length === 0 ? (
              <tr>
                <td colSpan={3}>
                  <div className="empty-state" style={{ padding: "36px 20px" }}>
                    <div className="empty-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <h3>No documents yet</h3>
                    <p>Upload a PDF to get started</p>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate("/upload")}>
                      Upload
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              recentDocs.map((doc) => (
                <tr
                  key={doc.id}
                  className="clickable"
                  onClick={() => navigate(`/documents/${doc.id}`)}
                >
                  <td className="primary truncate">
                    {doc.file_name || doc.original_name || `doc-${doc.id}`}
                  </td>
                  <td>
                    <StatusBadge status={doc.status} />
                  </td>
                  <td className="mono">{fmt(doc.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const m = {
    processed: "badge-processed",
    processing: "badge-processing",
    uploaded: "badge-uploaded",
    failed: "badge-failed",
  };
  const labels = {
    processed: "PAID",
    processing: "PROCESSING",
    uploaded: "QUEUED",
    failed: "FAILED",
  };
  return <span className={`badge ${m[status] || ""}`}>{labels[status] || status}</span>;
}