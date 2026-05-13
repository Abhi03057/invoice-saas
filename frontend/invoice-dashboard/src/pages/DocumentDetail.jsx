import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../components/Layout.css";

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

function fmt(str) {
  if (!str) return "—";
  return new Date(str).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function DetailRow({ label, value, isMoney }) {
  return (
    <div className={`detail-row ${isMoney ? 'invoice-total-line' : ''}`}>
      <div className="detail-key">{label}</div>
      <div className="detail-val" style={isMoney ? { fontSize: 18, fontWeight: 700, color: 'var(--green)' } : undefined}>
        {value || "—"}
      </div>
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
      const [d, inv] = await Promise.allSettled([
        api.get(`/documents/${id}`),
        api.get(`/documents/${id}/invoice`),
      ]);
      if (d.status === "fulfilled") setDoc(d.value.data);
      if (inv.status === "fulfilled") setInvoice(inv.value.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timerId = setInterval(fetchData, 5000);
    return () => clearInterval(timerId);
  }, [id]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await api.post(`/documents/${id}/retry`);
      fetchData();
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: 20, width: 200, marginBottom: 24 }} />
        <div className="detail-grid">
          <div className="card">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 16, marginBottom: 14 }} />
            ))}
          </div>
          <div className="card">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 16, marginBottom: 14 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3>Document not found</h3>
          <p>The document may have been deleted</p>
          <button className="btn btn-ghost" onClick={() => navigate("/documents")}>
            ← Back to Documents
          </button>
        </div>
      </div>
    );
  }

  const stampClass = {
    processed: "stamp-processed",
    processing: "stamp-processing",
    uploaded: "stamp-uploaded",
    failed: "stamp-failed",
  };
  const stampText = {
    processed: "PROCESSED",
    processing: "PROCESSING",
    uploaded: "QUEUED",
    failed: "FAILED",
  };

  return (
    <div className="page">
      <div className="page-breadcrumb">
        <a href="#" onClick={(e) => { e.preventDefault(); navigate("/documents"); }}>
          Documents
        </a>
        <span className="sep">/</span>
        <span style={{ color: "var(--text-primary)" }}>
          {doc.file_name || doc.original_name || `doc-${id}`}
        </span>
      </div>

      <div className="detail-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/documents")}>
          ←
        </button>
        <h1 className="detail-title">
          {doc.file_name || doc.original_name || `Document ${id}`}
        </h1>
        <StatusBadge status={doc.status} />
        {doc.status === "failed" && (
          <button
            className="btn btn-danger btn-sm"
            style={{ marginLeft: "auto" }}
            onClick={handleRetry}
            disabled={retrying}
          >
            {retrying ? "Retrying…" : "↺ Retry"}
          </button>
        )}
        {/* Large diagonal stamp overlay */}
        <div className={`status-stamp-overlay ${stampClass[doc.status] || ''}`}>
          {stampText[doc.status] || doc.status}
        </div>
      </div>

      <div className="detail-grid">
        {/* Document Info */}
        <div className="card">
          <div className="card-header">Document Info</div>
          <DetailRow label="ID" value={`#${doc.id}`} />
          <DetailRow label="File Name" value={doc.file_name || doc.original_name} />
          <DetailRow label="Status" value={doc.status} />
          <DetailRow label="Uploaded" value={fmt(doc.created_at)} />
          <DetailRow label="Last Updated" value={fmt(doc.updated_at)} />
          {doc.error_message && <DetailRow label="Error" value={doc.error_message} />}
          <div className="card-fine-print">Document ID #{doc.id} · BillSync Processing Engine</div>
        </div>

        {/* Extracted Invoice Data */}
        {invoice ? (
          <div className="card">
            <div className="card-header">Extracted Invoice</div>
            {invoice.invoice_number && (
              <DetailRow label="Invoice #" value={`#${invoice.invoice_number}`} />
            )}
            {invoice.vendor_name && (
              <DetailRow label="Vendor" value={invoice.vendor_name} />
            )}
            {invoice.invoice_date && (
              <DetailRow label="Invoice Date" value={invoice.invoice_date} />
            )}
            {invoice.due_date && (
              <DetailRow label="Due Date" value={invoice.due_date} />
            )}
            {invoice.currency && (
              <DetailRow label="Currency" value={invoice.currency} />
            )}
            {invoice.total_amount && (
              <DetailRow
                label="Total"
                value={`$${Number(invoice.total_amount).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                isMoney
              />
            )}
            {/* Show remaining fields */}
            {Object.entries(invoice)
              .filter(([k]) => !['id', 'document_id', 'invoice_number', 'vendor_name', 'invoice_date', 'due_date', 'currency', 'total_amount', 'created_at', 'updated_at'].includes(k))
              .map(([k, v]) =>
                v != null && (
                  <DetailRow
                    key={k}
                    label={k.replace(/_/g, " ")}
                    value={String(v)}
                  />
                )
              )}
            <div className="card-fine-print">
              Data extracted via BillSync AI Engine · {fmt(invoice.created_at)}
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-header">Extracted Invoice</div>
            <div className="empty-state" style={{ padding: "36px 16px" }}>
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <h3>No invoice data</h3>
              <p>
                {doc.status === "processed"
                  ? "No invoice data was extracted"
                  : "Data will appear after processing"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}