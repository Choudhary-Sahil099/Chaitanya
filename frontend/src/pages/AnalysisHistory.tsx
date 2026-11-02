
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  FileImage,
  Loader2,
  Menu,
  Microscope,
  Search,
  ShieldCheck,
  UserRound,
  X,
  Trash2,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import "../styles/dashboard.css";

// --------------------------------------------------
// API CONFIGURATION
// --------------------------------------------------

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

interface AnalysisRecord {
  id: number;
  original_filename: string;
  predicted_class: string;
  predicted_class_code: string;
  confidence: number;
  status: "accepted" | "uncertain";
  is_uncertain: boolean;
  created_at: string;
  image_url: string;
}

interface HistoryResponse {
  success: boolean;
  total: number;
  analyses: AnalysisRecord[];
}

interface ClassProbability {
  class_index: number;
  class_code: string;
  class_name: string;
  probability: number;
}

interface AnalysisDetail {
  id: number;
  original_filename: string;
  predicted_class: string;
  predicted_class_code: string;
  confidence: number;
  status: "accepted" | "uncertain";
  is_uncertain: boolean;
  normalized_entropy: number;
  uncertainty_reasons: string[];
  class_probabilities: ClassProbability[];
  created_at: string;
  image_url: string;
  gradcam_heatmap_url: string;
  gradcam_overlay_url: string;
}

interface DetailResponse {
  success: boolean;
  analysis: AnalysisDetail;
}

// --------------------------------------------------
// HAM10000 CLASS OPTIONS
// --------------------------------------------------

const CLASS_OPTIONS = [
  { code: "nv", name: "Melanocytic nevi" },
  { code: "mel", name: "Melanoma" },
  { code: "bkl", name: "Benign keratosis" },
  { code: "bcc", name: "Basal cell carcinoma" },
  { code: "akiec", name: "Actinic keratoses" },
  { code: "vasc", name: "Vascular lesions" },
  { code: "df", name: "Dermatofibroma" },
];

// --------------------------------------------------
// HELPER FUNCTIONS
// --------------------------------------------------

// Use Vite proxy for all backend requests.
const getApiUrl = (path: string) => path;

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatPercentage = (value: number) =>
  `${(value * 100).toFixed(1)}%`;

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

export default function AnalysisHistory() {
  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // History records
  const [records, setRecords] = useState<AnalysisRecord[]>([]);

  // Search and filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Detail modal
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<AnalysisDetail | null>(null);

  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  // Delete state
  const [isDeleting, setIsDeleting] = useState(false);

  // --------------------------------------------------
  // FETCH HISTORY
  // --------------------------------------------------

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(getApiUrl("/api/history"));

      if (!response.ok) {
        throw new Error("Could not load analysis history.");
      }

      const data: HistoryResponse = await response.json();

      setRecords(data.analyses ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading history.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // --------------------------------------------------
  // SEARCH AND FILTER
  // --------------------------------------------------

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        record.original_filename.toLowerCase().includes(query) ||
        record.predicted_class.toLowerCase().includes(query) ||
        record.predicted_class_code.toLowerCase().includes(query);

      const matchesClass =
        selectedClass === "all" ||
        record.predicted_class_code === selectedClass;

      return matchesSearch && matchesClass;
    });
  }, [records, searchQuery, selectedClass]);

  // --------------------------------------------------
  // STATISTICS
  // --------------------------------------------------

  const totalAnalyses = records.length;

  const uncertainAnalyses = records.filter(
    (record) => record.is_uncertain,
  ).length;

  const averageConfidence =
    records.length > 0
      ? records.reduce(
          (total, record) => total + record.confidence,
          0,
        ) / records.length
      : 0;

  // --------------------------------------------------
  // OPEN ANALYSIS DETAILS
  // --------------------------------------------------

  const openAnalysis = async (analysisId: number) => {
    try {
      setIsDetailLoading(true);
      setDetailError("");
      setSelectedAnalysis(null);

      const response = await fetch(
        getApiUrl(`/api/history/${analysisId}`),
      );

      if (!response.ok) {
        throw new Error("Could not load analysis details.");
      }

      const data: DetailResponse = await response.json();

      setSelectedAnalysis(data.analysis);
    } catch (err) {
      setDetailError(
        err instanceof Error
          ? err.message
          : "Could not load this analysis.",
      );
    } finally {
      setIsDetailLoading(false);
    }
  };

  // --------------------------------------------------
  // CLOSE MODAL
  // --------------------------------------------------

  const closeAnalysis = () => {
    if (isDeleting) return;

    setSelectedAnalysis(null);
    setDetailError("");
    setIsDetailLoading(false);
  };

  // --------------------------------------------------
  // DELETE ANALYSIS
  // --------------------------------------------------

  const deleteAnalysis = async (analysisId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this analysis?",
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      setDetailError("");

      const response = await fetch(
        getApiUrl(`/api/history/${analysisId}`),
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Could not delete this analysis.");
      }

      // Remove the deleted record from the UI.
      setRecords((previous) =>
        previous.filter((record) => record.id !== analysisId),
      );

      // Close the modal after successful deletion.
      setSelectedAnalysis(null);
    } catch (err) {
      setDetailError(
        err instanceof Error
          ? err.message
          : "Something went wrong while deleting.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="dashboard-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="dashboard-main">
        {/* HEADER */}

        <header className="dashboard-header">
          <div className="dashboard-header-left">
            <button
              className="dashboard-menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>

            <div>
              <span className="dashboard-breadcrumb">
                Workspace / Analysis History
              </span>

              <h1>Analysis History</h1>
            </div>
          </div>

          <div className="dashboard-header-actions">
            <div className="dashboard-header-avatar">
              <UserRound size={19} />
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* WELCOME SECTION */}

          <section className="dashboard-welcome">
            <div>
              <span className="dashboard-eyebrow">
                <span className="status-pulse" />
                YOUR ANALYSIS RECORDS
              </span>

              <h2>Your analysis journey.</h2>

              <p>
                Review your previous image classifications,
                confidence scores, and model uncertainty
                results in one place.
              </p>

              <Link
                to="/app/analyze"
                className="dashboard-primary-button"
              >
                <Microscope size={18} />
                Start New Analysis
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="welcome-decoration">
              <div className="welcome-decoration-circle">
                <FileImage size={46} strokeWidth={1.3} />
              </div>
            </div>
          </section>

          {/* STATISTICS */}

          <section className="dashboard-stats">
            <article className="dashboard-stat-card">
              <div className="stat-icon blue">
                <FileImage size={21} />
              </div>

              <div>
                <span>Total analyses</span>
                <strong>{totalAnalyses}</strong>
                <small>Saved records</small>
              </div>
            </article>

            <article className="dashboard-stat-card">
              <div className="stat-icon purple">
                <CalendarDays size={21} />
              </div>

              <div>
                <span>Average confidence</span>
                <strong>
                  {formatPercentage(averageConfidence)}
                </strong>
                <small>Across saved analyses</small>
              </div>
            </article>

            <article className="dashboard-stat-card">
              <div className="stat-icon green">
                <ShieldCheck size={21} />
              </div>

              <div>
                <span>Uncertain results</span>
                <strong>{uncertainAnalyses}</strong>
                <small>Require cautious interpretation</small>
              </div>
            </article>
          </section>

          {/* HISTORY TABLE */}

          <section className="dashboard-history-section">
            <div className="section-heading">
              <div>
                <h3>All analyses</h3>
                <p>
                  Search and filter your previous image analyses.
                </p>
              </div>

              <span className="section-step">
                {filteredRecords.length} RECORDS
              </span>
            </div>

            <div className="dashboard-history-card">
              {/* SEARCH AND FILTER */}

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "24px",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    flex: "1 1 240px",
                    minWidth: 0,
                    position: "relative",
                  }}
                >
                  <Search
                    size={18}
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      opacity: 0.6,
                    }}
                  />

                  <input
                    type="text"
                    placeholder="Search by image or predicted class..."
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "13px 14px 13px 42px",
                      borderRadius: "10px",
                      border: "1px solid var(--border-color, #333)",
                      background: "var(--card-background, transparent)",
                      color: "inherit",
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ position: "relative" }}>
                  <select
                    value={selectedClass}
                    onChange={(event) =>
                      setSelectedClass(event.target.value)
                    }
                    style={{
                      appearance: "none",
                      padding: "13px 38px 13px 14px",
                      borderRadius: "10px",
                      border: "1px solid var(--border-color, #333)",
                      background: "var(--card-background, transparent)",
                      color: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    <option value="all">All classes</option>

                    {CLASS_OPTIONS.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={16}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>

              {/* LOADING STATE */}

              {isLoading && (
                <div className="history-empty-state">
                  <Loader2
                    size={30}
                    className="animate-spin"
                  />
                  <strong>Loading your analyses...</strong>
                </div>
              )}

              {/* ERROR STATE */}

              {!isLoading && error && (
                <div className="history-empty-state">
                  <strong>Unable to load history</strong>
                  <span>{error}</span>

                  <button
                    className="dashboard-primary-button"
                    onClick={fetchHistory}
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* RECORDS TABLE */}

              {!isLoading &&
                !error &&
                filteredRecords.length > 0 && (
                  <div className="history-table-wrapper">
                    <table className="history-table">
                      <thead>
                        <tr>
                          {[
                            "IMAGE",
                            "PREDICTED CLASS",
                            "CONFIDENCE",
                            "DATE",
                            "STATUS",
                            "DETAILS",
                          ].map((heading) => (
                            <th key={heading}>{heading}</th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {filteredRecords.map((record) => (
                          <tr
                            key={record.id}
                            onClick={() => openAnalysis(record.id)}
                            title="View analysis details"
                          >
                            {/* IMAGE */}

                            <td>
                              <div className="history-image-cell">
                                <img
                                  src={getApiUrl(record.image_url)}
                                  alt={record.original_filename}
                                  loading="lazy"
                                />

                                <span>
                                  {record.original_filename}
                                </span>
                              </div>
                            </td>

                            {/* PREDICTED CLASS */}

                            <td>
                              <strong>
                                {record.predicted_class}
                              </strong>

                              <small>
                                {record.predicted_class_code.toUpperCase()}
                              </small>
                            </td>

                            {/* CONFIDENCE */}

                            <td>
                              {formatPercentage(record.confidence)}
                            </td>

                            {/* DATE */}

                            <td>
                              {formatDate(record.created_at)}
                            </td>

                            {/* STATUS */}

                            <td>
                              <span
                                className={
                                  record.is_uncertain
                                    ? "history-status uncertain"
                                    : "history-status accepted"
                                }
                              >
                                {record.is_uncertain
                                  ? "Uncertain"
                                  : "Accepted"}
                              </span>
                            </td>

                            {/* DETAILS */}

                            <td>
                              <ArrowRight size={18} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              {/* EMPTY STATE */}

              {!isLoading &&
                !error &&
                filteredRecords.length === 0 && (
                  <div className="history-empty-state">
                    <FileImage size={32} />

                    <strong>
                      {records.length === 0
                        ? "No analyses saved yet"
                        : "No matching analyses found"}
                    </strong>

                    <span>
                      {records.length === 0
                        ? "Your completed analyses will appear here."
                        : "Try changing your search or class filter."}
                    </span>
                  </div>
                )}
            </div>
          </section>

          {/* DISCLAIMER */}

          <footer className="dashboard-disclaimer">
            <ShieldCheck size={17} />

            <p>
              These records contain saved AI predictions.
              SkinSight is an educational AI research prototype,
              not a medical diagnostic service.
            </p>
          </footer>
        </div>
      </main>

      {/* ------------------------------------------------
          ANALYSIS DETAIL MODAL
      ------------------------------------------------ */}

      {(isDetailLoading || selectedAnalysis || detailError) && (
        <div
          className="analysis-modal-backdrop"
          onClick={closeAnalysis}
        >
          <div
            className="analysis-modal"
            onClick={(event) => event.stopPropagation()}
          >
            {/* MODAL HEADER */}

            <div className="analysis-modal-header">
              <div>
                <span className="dashboard-eyebrow">
                  SAVED ANALYSIS
                </span>

                <h2>Analysis details</h2>
              </div>

              <div className="analysis-modal-actions">
                {/* DELETE BUTTON: only show when details exist */}

                {selectedAnalysis && (
                  <button
                    onClick={() =>
                      deleteAnalysis(selectedAnalysis.id)
                    }
                    disabled={isDeleting}
                    className="analysis-delete-button"
                  >
                    <Trash2 size={16} />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                )}

                <button
                  onClick={closeAnalysis}
                  aria-label="Close analysis details"
                  className="analysis-close-button"
                  disabled={isDeleting}
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* DETAIL LOADING */}

            {isDetailLoading && (
              <div className="history-empty-state">
                <Loader2
                  size={30}
                  className="animate-spin"
                />
                <strong>Loading analysis details...</strong>
              </div>
            )}

            {/* DETAIL ERROR */}

            {detailError && (
              <div className="history-empty-state">
                <strong>Unable to load analysis</strong>
                <span>{detailError}</span>
              </div>
            )}

            {/* ANALYSIS CONTENT */}

            {selectedAnalysis && (
              <div className="analysis-detail-content">
                {/* PREDICTION SUMMARY */}

                <div>
                  <h3>{selectedAnalysis.predicted_class}</h3>

                  <p style={{ opacity: 0.65 }}>
                    {selectedAnalysis.original_filename}
                  </p>

                  <div className="analysis-meta">
                    <span>
                      Confidence:{" "}
                      <strong>
                        {formatPercentage(
                          selectedAnalysis.confidence,
                        )}
                      </strong>
                    </span>

                    <span>
                      Status:{" "}
                      <strong>
                        {selectedAnalysis.is_uncertain
                          ? "Uncertain"
                          : "Accepted"}
                      </strong>
                    </span>

                    <span>
                      Date:{" "}
                      <strong>
                        {formatDate(selectedAnalysis.created_at)}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* IMAGES */}

                <div className="analysis-image-grid">
                  <div>
                    <h4>Original image</h4>

                    <img
                      src={getApiUrl(
                        selectedAnalysis.image_url,
                      )}
                      alt="Original uploaded skin image"
                    />
                  </div>

                  <div>
                    <h4>Grad-CAM heatmap</h4>

                    <img
                      src={getApiUrl(
                        selectedAnalysis.gradcam_heatmap_url,
                      )}
                      alt="Grad-CAM heatmap"
                    />
                  </div>

                  <div>
                    <h4>Grad-CAM overlay</h4>

                    <img
                      src={getApiUrl(
                        selectedAnalysis.gradcam_overlay_url,
                      )}
                      alt="Grad-CAM overlay"
                    />
                  </div>
                </div>

                {/* CLASS PROBABILITIES */}

                <div>
                  <h4>Class probabilities</h4>

                  {selectedAnalysis.class_probabilities
                    .slice()
                    .sort(
                      (a, b) => b.probability - a.probability,
                    )
                    .map((item) => (
                      <div
                        key={item.class_code}
                        className="analysis-probability"
                      >
                        <div className="analysis-probability-label">
                          <span>{item.class_name}</span>

                          <strong>
                            {formatPercentage(item.probability)}
                          </strong>
                        </div>

                        <div className="analysis-probability-track">
                          <div
                            style={{
                              width: `${Math.max(
                                0,
                                Math.min(100, item.probability * 100),
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>

                {/* UNCERTAINTY INFORMATION */}

                <div>
                  <h4>Uncertainty information</h4>

                  <p>
                    Normalized entropy:{" "}
                    {selectedAnalysis.normalized_entropy.toFixed(4)}
                  </p>

                  {selectedAnalysis.uncertainty_reasons.length > 0 ? (
                    <ul>
                      {selectedAnalysis.uncertainty_reasons.map(
                        (reason, index) => (
                          <li key={index}>{reason}</li>
                        ),
                      )}
                    </ul>
                  ) : (
                    <p style={{ opacity: 0.65 }}>
                      No uncertainty reasons were reported.
                    </p>
                  )}
                </div>

                {/* DISCLAIMER */}

                <p className="analysis-detail-disclaimer">
                  SkinSight is an experimental AI research
                  prototype. Its predictions are not medical
                  diagnoses. Consult a qualified healthcare
                  professional for medical assessment.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
