
import {
  Activity,
  ClipboardList,
  HelpCircle,
  Home,
  Microscope,
  Settings,
  UserRound,
  ChevronDown,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <button
          className="dashboard-overlay"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}

      <aside
        className={`dashboard-sidebar ${
          isOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="dashboard-brand">
          <div className="dashboard-brand-icon">
            <Activity size={23} />
          </div>

          <span>
            Skin<span>Sight</span>
          </span>

          <button
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-section-label">
          WORKSPACE
        </div>

        <nav className="dashboard-nav">
          <NavLink
            to="/app"
            end
            className={({ isActive }) =>
              `dashboard-nav-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <Home size={19} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/app/analyze"
            className={({ isActive }) =>
              `dashboard-nav-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <Microscope size={19} />
            <span>New Analysis</span>
            <span className="nav-new-dot" />
          </NavLink>

          <NavLink
            to="/app/history"
            className={({ isActive }) =>
              `dashboard-nav-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <ClipboardList size={19} />
            <span>Analysis History</span>
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-section-label">
            SUPPORT
          </div>

          <a
            href="#help"
            className="dashboard-nav-link"
            onClick={onClose}
          >
            <HelpCircle size={19} />
            <span>Help & Information</span>
          </a>

          <a
            href="#settings"
            className="dashboard-nav-link"
            onClick={onClose}
          >
            <Settings size={19} />
            <span>Settings</span>
          </a>

          <div className="sidebar-user">
            <div className="sidebar-avatar">
              <UserRound size={20} />
            </div>

            <div className="sidebar-user-info">
              <strong>Guest User</strong>
              <span>Personal workspace</span>
            </div>

            <ChevronDown size={16} />
          </div>
        </div>
      </aside>
    </>
  );
}
