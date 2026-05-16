import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../components/Layout.css";

const PAGE_SIZE = 10;

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

  return (
    <span className={`badge ${m[status] || ""}`}>
      {labels[status] || status}
    </span>
  );
}

function fmt(str) {
  if (!str) return "—";

  return new Date(str).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const navigate = useNavigate();

  const fetchDocs = async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      const res = await api.get(
        `/documents?page=${page}&limit=${PAGE_SIZE}`
      );

      const data = res.data;

      if (Array.isArray(data)) {
        setDocs(data);
        setTotal(data.length);
      } else {
        setDocs(data.documents || data.data || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch documents", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [page]);

  useEffect(() => {
    const id = setInterval(() => fetchDocs(true), 5000);

    return () => clearInterval(id);
  }, [page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Documents</h1>

            <p className="page-subtitle">
              {total} total · auto-refresh · 5s
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => navigate("/upload")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="14"
              height="14"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>

            Upload
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>File Name</th>
              <th>Status</th>
              <th>Uploaded</th>
              <th>Updated</th>
              <th className="right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j}>
                      <div
                        className="skeleton"
                        style={{ height: 14, width: "75%" }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : docs.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">
                    <div className="empty-icon">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        width="22"
                        height="22"
                      >
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />

                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>

                    <h3>No documents yet</h3>

                    <p>Upload a PDF to get started</p>

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate("/upload")}
                    >
                      Upload document
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              docs.map((doc) => (
                <tr
                  key={doc.id}
                  className="clickable"
                  onClick={() => navigate(`/documents/${doc.id}`)}
                >
                  <td className="primary truncate">
                    {doc.file_name ||
                      doc.original_name ||
                      `doc-${doc.id}`}
                  </td>

                  <td>
                    <StatusBadge status={doc.status} />
                  </td>

                  <td className="mono">
                    {fmt(doc.created_at)}
                  </td>

                  <td className="mono">
                    {fmt(doc.updated_at)}
                  </td>

                  <td className="right">
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/documents/${doc.id}`);
                        }}
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">
              {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, total)} of {total}
            </span>

            <button
              className="btn btn-ghost btn-sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ←
            </button>

            <span
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {page}/{totalPages}
            </span>

            <button
              className="btn btn-ghost btn-sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}