import { useEffect, useState } from "react";
import api from "../api/axios";
import "../components/Layout.css";

const STATS = [
  { key:"total_documents", label:"Total Docs" },
  { key:"processed",       label:"Processed"  },
  { key:"processing",      label:"Processing" },
  { key:"failed",          label:"Failed"     },
  { key:"uploaded",        label:"Queued"     },
  { key:"total_invoices",  label:"Invoices"   },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try { const res = await api.get("/stats"); setStats(res.data); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">System overview · auto-refreshes every 10s</p>
      </div>
      <div className="stat-grid">
        {STATS.map(s => (
          <div key={s.key} className="stat-card">
            <div className="stat-label">{s.label}</div>
            {loading
              ? <div className="skeleton" style={{ height:36, width:"60%", marginTop:4 }} />
              : <div className="stat-value">{stats?.[s.key] ?? "—"}</div>}
          </div>
        ))}
      </div>
      <div className="card" style={{ padding:20 }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"var(--text-muted)", marginBottom:14 }}>Processing Pipeline</div>
        <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:4 }}>
          {[["Upload","var(--status-yellow)"],["Queue","var(--accent)"],["Parse","var(--status-blue)"],["Store","var(--status-green)"]].map(([label, color], i) => (
            <>
              <span key={label} style={{ background:`${color}18`, border:`1px solid ${color}40`, color, borderRadius:6, padding:"5px 12px", fontFamily:"var(--font-mono)", fontSize:11, fontWeight:600 }}>{label}</span>
              {i < 3 && <span style={{ color:"var(--text-muted)", fontSize:12 }}>›</span>}
            </>
          ))}
        </div>
        <p style={{ marginTop:12, fontSize:12, color:"var(--text-muted)", fontFamily:"var(--font-mono)" }}>PDFs → Redis / BullMQ → background worker → PostgreSQL</p>
      </div>
    </div>
  );
}