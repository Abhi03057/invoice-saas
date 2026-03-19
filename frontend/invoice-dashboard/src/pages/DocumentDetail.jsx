import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../components/Layout.css";

function StatusBadge({ status }) {
  const m = { processed:"badge-processed", processing:"badge-processing", uploaded:"badge-uploaded", failed:"badge-failed" };
  return <span className={`badge ${m[status]||""}`}>{status}</span>;
}

function fmt(str) {
  if (!str) return "—";
  return new Date(str).toLocaleString("en-US", { month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit" });
}

function Row({ label, value }) {
  return (
    <div style={{ display:"flex", gap:16, padding:"9px 0", borderBottom:"1px solid var(--border-subtle)" }}>
      <div style={{ width:160, fontSize:10, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", color:"var(--text-muted)", flexShrink:0 }}>{label}</div>
      <div style={{ fontSize:12, color:"var(--text-primary)", fontFamily:"var(--font-mono)", flex:1, wordBreak:"break-all" }}>{value || "—"}</div>
    </div>
  );
}

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const fetchData = async () => {
    try {
      const [d, inv] = await Promise.allSettled([api.get(`/documents/${id}`), api.get(`/documents/${id}/invoice`)]);
      if (d.status === "fulfilled") setDoc(d.value.data);
      if (inv.status === "fulfilled") setInvoice(inv.value.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); const id2 = setInterval(fetchData, 5000); return () => clearInterval(id2); }, [id]);

  const handleRetry = async () => {
    setRetrying(true);
    try { await api.post(`/documents/${id}/retry`); fetchData(); }
    finally { setRetrying(false); }
  };

  if (loading) return <div className="page">{Array.from({length:6}).map((_,i) => <div key={i} className="skeleton" style={{ height:18, marginBottom:12 }}/>)}</div>;
  if (!doc) return <div className="page"><div className="empty-state"><div className="empty-icon">❓</div><h3>Not found</h3><button className="btn btn-ghost" style={{ marginTop:12 }} onClick={() => navigate("/documents")}>← Back</button></div></div>;

  return (
    <div className="page">
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/documents")}>← Back</button>
        <h1 style={{ fontSize:16, fontWeight:700 }}>{doc.file_name || doc.original_name || `Document ${id}`}</h1>
        <StatusBadge status={doc.status} />
        {doc.status === "failed" && (
          <button className="btn btn-danger btn-sm" style={{ marginLeft:"auto" }} onClick={handleRetry} disabled={retrying}>{retrying ? "Retrying…" : "↺ Retry"}</button>
        )}
      </div>
      <div className="card" style={{ padding:"18px 20px", marginBottom:16 }}>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"var(--text-muted)", marginBottom:12 }}>Document Info</div>
        <Row label="ID" value={doc.id} />
        <Row label="File Name" value={doc.file_name || doc.original_name} />
        <Row label="Status" value={doc.status} />
        <Row label="Uploaded" value={fmt(doc.created_at)} />
        <Row label="Last Updated" value={fmt(doc.updated_at)} />
        {doc.error_message && <Row label="Error" value={doc.error_message} />}
      </div>
      {invoice && (
        <div className="card" style={{ padding:"18px 20px" }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"var(--text-muted)", marginBottom:12 }}>Extracted Invoice Data</div>
          {Object.entries(invoice).map(([k, v]) => v != null && <Row key={k} label={k.replace(/_/g," ")} value={String(v)} />)}
        </div>
      )}
    </div>
  );
}