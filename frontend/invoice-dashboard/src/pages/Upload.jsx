import { useState, useRef } from "react";
import api from "../api/axios";
import "../components/Layout.css";

export default function Upload() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const addFiles = (incoming) => {
    const pdfs = Array.from(incoming).filter(f => f.type === "application/pdf");
    setFiles(prev => { const ex = new Set(prev.map(f => f.name)); return [...prev, ...pdfs.filter(f => !ex.has(f.name))]; });
    if (pdfs.length < incoming.length) setError("Only PDF files are accepted.");
    else setError(null);
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true); setResults([]); setError(null);
    const formData = new FormData();
    files.forEach(f => formData.append("files", f));
    try {
      const res = await api.post("/documents", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setResults(Array.isArray(res.data) ? res.data : [res.data]);
      setFiles([]);
    } catch (e) {
      setError(e.response?.data?.message || "Upload failed.");
    } finally { setUploading(false); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Upload Invoices</h1>
        <p className="page-subtitle">Upload PDF invoices for async processing</p>
      </div>
      <div
        className={`drop-zone ${dragging ? "dragging" : ""}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept="application/pdf" multiple style={{ display:"none" }} onChange={e => addFiles(e.target.files)} />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <p className="drop-text">{dragging ? "Release to add files" : "Drop PDFs here or click to select"}</p>
        <p className="drop-sub">PDF files only · multiple supported</p>
      </div>
      {files.length > 0 && (
        <div className="card" style={{ marginTop:20, padding:0, overflow:"hidden" }}>
          <div style={{ padding:"10px 14px", borderBottom:"1px solid var(--border)", fontSize:11, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"var(--text-muted)" }}>{files.length} file{files.length>1?"s":""} selected</div>
          {files.map(f => (
            <div key={f.name} className="file-row">
              <span>📄</span>
              <div style={{ flex:1 }}><div style={{ fontSize:13 }}>{f.name}</div><div style={{ fontSize:11, color:"var(--text-muted)", fontFamily:"var(--font-mono)" }}>{(f.size/1024).toFixed(1)} KB</div></div>
              <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setFiles(p => p.filter(x => x.name !== f.name)); }}>✕</button>
            </div>
          ))}
          <div style={{ padding:"10px 14px", borderTop:"1px solid var(--border)", display:"flex", justifyContent:"flex-end" }}>
            <button className="btn btn-primary" onClick={handleUpload} disabled={uploading}>{uploading ? "Uploading…" : `Upload ${files.length} file${files.length>1?"s":""}`}</button>
          </div>
        </div>
      )}
      {error && <div className="card card-sm" style={{ marginTop:16, borderColor:"var(--status-red)", color:"var(--status-red)", fontSize:13, padding:"10px 14px" }}>{error}</div>}
      {results.length > 0 && (
        <div className="card" style={{ marginTop:20, padding:"18px 20px" }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"var(--text-muted)", marginBottom:12 }}>Upload Results</div>
          {results.map((doc, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"5px 0" }}>
              <span className="badge badge-uploaded">queued</span>
              <span style={{ fontSize:12, fontFamily:"var(--font-mono)" }}>{doc.file_name || doc.id}</span>
            </div>
          ))}
          <p style={{ marginTop:12, fontSize:12, color:"var(--text-muted)" }}>Documents queued. Check the Documents page for status.</p>
        </div>
      )}
    </div>
  );
}