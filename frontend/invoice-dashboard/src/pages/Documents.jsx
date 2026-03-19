import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../components/Layout.css";

const PAGE_SIZE = 10;

function StatusBadge({ status }) {
  const m = { processed:"badge-processed", processing:"badge-processing", uploaded:"badge-uploaded", failed:"badge-failed" };
  return <span className={`badge ${m[status]||""}`}>{status}</span>;
}

function fmt(str) {
  if (!str) return "—";
  return new Date(str).toLocaleString("en-US", { month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit" });
}

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [retrying, setRetrying] = useState({});
  const navigate = useNavigate();

  const fetchDocs = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(`/documents?page=${page}&limit=${PAGE_SIZE}`);
      const data = res.data;
      if (Array.isArray(data)) { setDocs(data); setTotal(data.length); }
      else { setDocs(data.documents || data.data || []); setTotal(data.total || 0); }
    } finally { if (!silent) setLoading(false); }
  };

  useEffect(() => { fetchDocs(); }, [page]);
  useEffect(() => { const id = setInterval(() => fetchDocs(true), 5000); return () => clearInterval(id); }, [page]);

  const handleRetry = async (e, id) => {
    e.stopPropagation();
    setRetrying(r => ({ ...r, [id]: true }));
    try { await api.post(`/documents/${id}/retry`); fetchDocs(true); }
    finally { setRetrying(r => ({ ...r, [id]: false })); }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="page">
      <div className="page-header" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div><h1 className="page-title">Documents</h1><p className="page-subtitle">Auto-refreshes every 5s · {total} total</p></div>
        <button className="btn btn-primary" onClick={() => navigate("/upload")}>+ Upload</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>File Name</th><th>Status</th><th>Uploaded</th><th>Updated</th><th style={{ textAlign:"right" }}>Action</th></tr></thead>
          <tbody>
            {loading
              ? Array.from({length:5}).map((_,i) => <tr key={i}>{Array.from({length:5}).map((_,j) => <td key={j}><div className="skeleton" style={{ height:14, width:"80%" }}/></td>)}</tr>)
              : docs.length === 0
                ? <tr><td colSpan={5}><div className="empty-state"><div className="empty-icon">📭</div><h3>No documents yet</h3><p>Upload a PDF to get started</p></div></td></tr>
                : docs.map(doc => (
                    <tr key={doc.id} style={{ cursor:"pointer" }} onClick={() => navigate(`/documents/${doc.id}`)}>
                      <td style={{ maxWidth:280, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{doc.file_name || doc.original_name || `doc-${doc.id}`}</td>
                      <td><StatusBadge status={doc.status} /></td>
                      <td>{fmt(doc.created_at)}</td>
                      <td>{fmt(doc.updated_at)}</td>
                      <td style={{ textAlign:"right" }}>
                        {doc.status === "failed" && <button className="btn btn-danger btn-sm" onClick={e => handleRetry(e, doc.id)} disabled={retrying[doc.id]}>{retrying[doc.id] ? "…" : "↺ Retry"}</button>}
                      </td>
                    </tr>
                  ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">{(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,total)} of {total}</span>
            <button className="btn btn-ghost btn-sm" disabled={page===1} onClick={() => setPage(p=>p-1)}>←</button>
            <span style={{ fontSize:12, color:"var(--text-muted)", fontFamily:"var(--font-mono)" }}>{page}/{totalPages}</span>
            <button className="btn btn-ghost btn-sm" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>→</button>
          </div>
        )}
      </div>
    </div>
  );
}