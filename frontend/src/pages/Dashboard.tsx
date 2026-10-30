
import { useState } from "react";
import { Link } from "react-router-dom";

import {
  Activity,
  ArrowRight,
  Bell,
  Clock3,
  FileImage,
  Menu,
  Microscope,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import "../styles/dashboard.css";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">

      {/* Reusable Sidebar */}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Dashboard */}

      <main className="dashboard-main">

        {/* Header */}

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
                Workspace / Dashboard
              </span>

              <h1>Dashboard</h1>
            </div>

          </div>

          <div className="dashboard-header-actions">

            <button
              className="dashboard-icon-button"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span className="notification-dot" />
            </button>

            <div className="dashboard-header-avatar">
              <UserRound size={19} />
            </div>

          </div>

        </header>

        <div className="dashboard-content">

          {/* Welcome Section */}

          <section className="dashboard-welcome">

            <div>

              <span className="dashboard-eyebrow">
                <span className="status-pulse" />
                YOUR PERSONAL SKIN ANALYSIS SPACE
              </span>

              <h2>Welcome to SkinSight.</h2>

              <p>
                Explore AI-powered skin lesion classification,
                understand visual explanations, and keep track
                of your previous analyses.
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
                <Microscope size={48} strokeWidth={1.3} />
              </div>
            </div>

          </section>

          {/* Dashboard Statistics */}

          <section className="dashboard-stats">

            <article className="dashboard-stat-card">

              <div className="stat-icon blue">
                <FileImage size={21} />
              </div>

              <div>
                <span>Total analyses</span>
                <strong>—</strong>
                <small>History storage not connected</small>
              </div>

            </article>

            <article className="dashboard-stat-card">

              <div className="stat-icon purple">
                <Clock3 size={21} />
              </div>

              <div>
                <span>Last analysis</span>
                <strong>—</strong>
                <small>No saved records yet</small>
              </div>

            </article>

            <article className="dashboard-stat-card">

              <div className="stat-icon green">
                <ShieldCheck size={21} />
              </div>

              <div>
                <span>AI review</span>
                <strong>Available</strong>
                <small>Educational classification tool</small>
              </div>

            </article>

          </section>

          {/* Start Analysis Card */}

          <section className="dashboard-upload-section">

            <div className="section-heading">

              <div>
                <h3>Ready to analyze an image?</h3>
                <p>
                  Start a new skin lesion image analysis.
                </p>
              </div>

              <span className="section-step">
                START HERE
              </span>

            </div>

            <div className="dashboard-upload-card">

              <div className="upload-illustration">

                <div className="upload-image-icon">
                  <Activity size={35} />
                </div>

                <div className="upload-sparkle sparkle-one" />
                <div className="upload-sparkle sparkle-two" />

              </div>

              <div className="upload-card-content">

                <span className="upload-tag">
                  AI-POWERED IMAGE REVIEW
                </span>

                <h3>Let's take a closer look.</h3>

                <p>
                  Upload a skin lesion image and explore its
                  predicted classification, confidence score,
                  uncertainty estimation and Grad-CAM explanation.
                </p>

                <div className="upload-actions">

                  <Link
                    to="/app/analyze"
                    className="dashboard-primary-button"
                  >
                    <Microscope size={18} />
                    New Analysis
                    <ArrowRight size={17} />
                  </Link>

                  <Link
                    to="/app/history"
                    className="dashboard-secondary-button"
                  >
                    <FileImage size={18} />
                    View History
                  </Link>

                </div>

                <div className="upload-note">
                  <ShieldCheck size={15} />

                  <span>
                    SkinSight is an educational research prototype,
                    not a medical diagnostic tool.
                  </span>
                </div>

              </div>

            </div>

          </section>

          {/* Recent Analyses */}

          <section className="dashboard-history-section">

            <div className="section-heading">

              <div>
                <h3>Recent analyses</h3>
                <p>
                  Your previously saved image reviews.
                </p>
              </div>

              <Link
                to="/app/history"
                className="view-all-link"
              >
                View all
                <ArrowRight size={16} />
              </Link>

            </div>

            <div className="dashboard-history-card">

              <div className="history-empty-state">

                <FileImage size={30} />

                <strong>No saved analyses yet</strong>

                <span>
                  Your completed predictions will appear here
                  once analysis history storage is implemented.
                </span>

                <Link
                  to="/app/analyze"
                  className="view-all-link"
                >
                  Start your first analysis
                  <ArrowRight size={16} />
                </Link>

              </div>

            </div>

          </section>

          {/* Disclaimer */}

          <footer className="dashboard-disclaimer">

            <ShieldCheck size={17} />

            <p>
              SkinSight is an educational AI tool, not a medical
              diagnostic service. Always consult a qualified
              healthcare professional about skin concerns.
            </p>

          </footer>

        </div>

      </main>

    </div>
  );
}
