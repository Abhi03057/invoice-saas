import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../components/Layout.css";

const PAGE_SIZE = 10;
function fmt(str) { if (!str) return "—"; return new Date(str).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }); }

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const fetch_ = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(`/documents/invoices?page=${page}&limit=${PAGE_SIZE}`);
      const data = res.data;
      if (Array.isArray(data)) { setInvoices(data); setTotal(data.length); }
      else { setInvoices(data.invoices || data.data || []); setTotal(data.total || 0); }
    } finally { if (!silent) setLoading(false); }
  };

  useEffect(() => { fetch_(); }, [page]);
  useEffect(() => { const id = setInterval(() => fetch_(true), 8000); return () => clearInterval(id); }, [page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="page">
      <div className="page-header"><h1 className="page-title">Invoices</h1><p className="page-subtitle">Extracted invoice data · auto-refreshes every 8s</p></div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Invoice #</th><th>Vendor</th><th>Total</th><th>Invoice Date</th><th>Due Date</th><th>Doc</th></tr></thead>
          <tbody>
            {loading
              ? Array.from({length:5}).map((_,i) => <tr key={i}>{Array.from({length:6}).map((_,j) => <td key={j}><div className="skeleton" style={{ height:14, width:"80%" }}/></td>)}</tr>)
              : invoices.length === 0
                ? <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">🧾</div><h3>No invoices yet</h3><p>Process some PDFs first</p></div></td></tr>
                : invoices.map(inv => (
                    <tr key={inv.id} style={{ cursor:"pointer" }} onClick={() => inv.document_id && navigate(`/documents/${inv.document_id}`)}>
                      <td>{inv.invoice_number || "—"}</td>
                      <td style={{ color:"var(--text-primary)" }}>{inv.vendor_name || "—"}</td>
                      <td style={{ color:"var(--status-green)" }}>{inv.total_amount ? `$${Number(inv.total_amount).toLocaleString()}` : "—"}</td>
                      <td>{fmt(inv.invoice_date)}</td>
                      <td>{fmt(inv.due_date)}</td>
                      <td><span style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--accent)" }}>{inv.document_id ? `#${inv.document_id}` : "—"}</span></td>
                    </tr>
                  ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">{(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,total)} of {total}</span>
            <button className="btn btn-ghost btn-sm" disabled={page===1} onClick={()=>setPage(p=>p-1)}>←</button>
            <span style={{ fontSize:12, color:"var(--text-muted)", fontFamily:"var(--font-mono)" }}>{page}/{totalPages}</span>
            <button className="btn btn-ghost btn-sm" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>→</button>
          </div>
        )}
      </div>
    </div>
  );
}