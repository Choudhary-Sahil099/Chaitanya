
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  FileImage,
  Menu,
  Microscope,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import "../styles/dashboard.css";

interface AnalysisRecord {
  id: number;
  imageName: string;
  predictedClass: string;
  classCode: string;
  confidence: number;
  date: string;
  status: "Accepted" | "Uncertain";
}

// Temporary sample data.
// We will replace this with API data when SQLite persistence is implemented.
const sampleRecords: AnalysisRecord[] = [
  {
    id: 1,
    imageName: "lesion_sample_01.jpg",
    predictedClass: "Melanocytic nevi",
    classCode: "nv",
    confidence: 0.96,
    date: "2026-10-28T10:30:00",
    status: "Accepted",
  },
  {
    id: 2,
    imageName: "skin_image_02.png",
    predictedClass: "Melanoma",
    classCode: "mel",
    confidence: 0.72,
    date: "2026-10-26T15:45:00",
    status: "Uncertain",
  },
  {
    id: 3,
    imageName: "lesion_sample_03.jpg",
    predictedClass: "Benign keratosis-like lesions",
    classCode: "bkl",
    confidence: 0.89,
    date: "2026-10-24T12:15:00",
    status: "Accepted",
  },
  {
    id: 4,
    imageName: "skin_image_04.webp",
    predictedClass: "Basal cell carcinoma",
    classCode: "bcc",
    confidence: 0.64,
    date: "2026-10-21T09:20:00",
    status: "Uncertain",
  },
];

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function AnalysisHistory() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");

  const filteredRecords = useMemo(() => {
    return sampleRecords.filter((record) => {
      const matchesSearch =
        record.imageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.predictedClass.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.classCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesClass =
        selectedClass === "all" || record.classCode === selectedClass;

      return matchesSearch && matchesClass;
    });
  }, [searchQuery, selectedClass]);

  const totalAnalyses = sampleRecords.length;
  const uncertainAnalyses = sampleRecords.filter(
    (record) => record.status === "Uncertain"
  ).length;

  const averageConfidence =
    sampleRecords.reduce((total, record) => total + record.confidence, 0) /
    (totalAnalyses || 1);

  return (
    <div className="dashboard-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="dashboard-main">
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
          <section className="dashboard-welcome">
            <div>
              <span className="dashboard-eyebrow">
                <span className="status-pulse" />
                YOUR ANALYSIS RECORDS
              </span>

              <h2>Your analysis journey.</h2>

              <p>
                Review your previous image classifications, confidence
                scores, and model uncertainty results in one place.
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

          <section className="dashboard-stats">
            <article className="dashboard-stat-card">
              <div className="stat-icon blue">
                <FileImage size={21} />
              </div>
              <div>
                <span>Total analyses</span>
                <strong>{totalAnalyses}</strong>
                <small>Sample records</small>
              </div>
            </article>

            <article className="dashboard-stat-card">
              <div className="stat-icon purple">
                <CalendarDays size={21} />
              </div>
              <div>
                <span>Average confidence</span>
                <strong>{(averageConfidence * 100).toFixed(1)}%</strong>
                <small>Across sample records</small>
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
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    flex: "1 1 240px",
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
                    <option value="nv">Melanocytic nevi</option>
                    <option value="mel">Melanoma</option>
                    <option value="bkl">Benign keratosis-like lesions</option>
                    <option value="bcc">Basal cell carcinoma</option>
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

              {filteredRecords.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: "650px",
                      textAlign: "left",
                    }}
                  >
                    <thead>
                      <tr>
                        {[
                          "IMAGE",
                          "PREDICTED CLASS",
                          "CONFIDENCE",
                          "DATE",
                          "STATUS",
                        ].map((heading) => (
                          <th
                            key={heading}
                            style={{
                              padding: "14px 12px",
                              fontSize: "11px",
                              letterSpacing: "0.7px",
                              opacity: 0.65,
                              borderBottom: "1px solid var(--border-color, #333)",
                            }}
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {filteredRecords.map((record) => (
                        <tr key={record.id}>
                          <td
                            style={{
                              padding: "18px 12px",
                              borderBottom: "1px solid var(--border-color, #333)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <FileImage size={19} />
                              <span>{record.imageName}</span>
                            </div>
                          </td>

                          <td
                            style={{
                              padding: "18px 12px",
                              borderBottom: "1px solid var(--border-color, #333)",
                            }}
                          >
                            <strong>{record.predictedClass}</strong>
                            <small
                              style={{
                                display: "block",
                                opacity: 0.6,
                                marginTop: "4px",
                              }}
                            >
                              {record.classCode.toUpperCase()}
                            </small>
                          </td>

                          <td
                            style={{
                              padding: "18px 12px",
                              borderBottom: "1px solid var(--border-color, #333)",
                            }}
                          >
                            {(record.confidence * 100).toFixed(1)}%
                          </td>

                          <td
                            style={{
                              padding: "18px 12px",
                              borderBottom: "1px solid var(--border-color, #333)",
                            }}
                          >
                            {formatDate(record.date)}
                          </td>

                          <td
                            style={{
                              padding: "18px 12px",
                              borderBottom: "1px solid var(--border-color, #333)",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                padding: "6px 10px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                background:
                                  record.status === "Accepted"
                                    ? "rgba(46, 160, 110, 0.12)"
                                    : "rgba(220, 160, 50, 0.12)",
                                color:
                                  record.status === "Accepted"
                                    ? "#43b581"
                                    : "#d7a441",
                              }}
                            >
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="history-empty-state">
                  <FileImage size={32} />
                  <strong>No matching analyses found</strong>
                  <span>
                    Try changing your search or class filter.
                  </span>
                </div>
              )}
            </div>
          </section>

          <footer className="dashboard-disclaimer">
            <ShieldCheck size={17} />
            <p>
              These records are sample data for the current UI design.
              SkinSight is an educational AI tool, not a medical
              diagnostic service.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
