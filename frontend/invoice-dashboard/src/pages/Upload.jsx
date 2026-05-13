import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../components/Layout.css";

export default function Upload() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();
  const navigate = useNavigate();

  const addFiles = (incoming) => {
    const pdfs = Array.from(incoming).filter(
      (f) => f.type === "application/pdf"
    );
    setFiles((prev) => {
      const ex = new Set(prev.map((f) => f.name));
      return [...prev, ...pdfs.filter((f) => !ex.has(f.name))];
    });
    if (pdfs.length < incoming.length) {
      setError("Only PDF files are accepted.");
    } else {
      setError(null);
    }
    setSuccess(false);
    setResults([]);
  };

  const removeFile = (name, e) => {
    e.stopPropagation();
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    setResults([]);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    try {
      const res = await api.post("/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResults(Array.isArray(res.data) ? res.data : [res.data]);
      setFiles([]);
      setSuccess(true);
    } catch (e) {
      setError(e.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const dropZoneClass = [
    "drop-zone",
    dragging && "dragging",
    uploading && "uploading",
    success && "success",
    error && !dragging && "error",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Upload</h1>
        <p className="page-subtitle">Upload PDF invoices for async processing</p>
      </div>

      {/* Drop Zone */}
      <div
        className={dropZoneClass}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          style={{ display: "none" }}
          onChange={(e) => addFiles(e.target.files)}
        />
        <div className="drop-icon">
          {uploading ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36">
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
            </svg>
          ) : success ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5" width="36" height="36">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          )}
        </div>
        <p className="drop-text">
          {uploading
            ? "Uploading…"
            : success
              ? "Upload complete"
              : dragging
                ? "Release to add files"
                : "Drop your invoice here"}
        </p>
        <p className="drop-sub">
          {uploading
            ? "Processing your files"
            : success
              ? `${results.length} file${results.length > 1 ? "s" : ""} queued for processing`
              : "PDF files only · multiple supported"}
        </p>

        {uploading && (
          <div className="progress-bar uploading" style={{ marginTop: 18, width: "60%" }}>
            <div className="progress-bar-fill" />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error" style={{ marginTop: 14 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {error}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="file-list">
          <div className="file-list-header">
            {files.length} file{files.length > 1 ? "s" : ""} selected
          </div>
          {files.map((f) => (
            <div key={f.name} className="file-row">
              <div className="file-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div className="file-info">
                <div className="file-name">{f.name}</div>
                <div className="file-size">{(f.size / 1024).toFixed(1)} KB</div>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={(e) => removeFile(f.name, e)}
              >
                ✕
              </button>
            </div>
          ))}
          <div className="file-list-footer">
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading
                ? "Uploading…"
                : `Upload ${files.length} file${files.length > 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      )}

      {/* Upload Results */}
      {success && results.length > 0 && (
        <div className="card upload-results">
          <div className="card-header">
            <span>Upload Results</span>
            <button
              className="card-header-action"
              onClick={() => navigate("/documents")}
            >
              View in Documents →
            </button>
          </div>
          {results.map((doc, i) => (
            <div key={i} className="upload-result-row">
              <span className="badge badge-uploaded">QUEUED</span>
              <span className="upload-result-file">
                {doc.file_name || doc.id}
              </span>
            </div>
          ))}
          <div className="upload-hint">
            Documents are queued for background processing via BullMQ.
          </div>
        </div>
      )}
    </div>
  );
}