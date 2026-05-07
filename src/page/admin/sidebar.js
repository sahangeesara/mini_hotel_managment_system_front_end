import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./sidebar.css";

const NAV_SECTIONS = [
  {
    label: "Management",
    items: [
      { to: "/admin/hotel", icon: "bi-building", label: "Hotels" },
    ],
  },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  return (
    <>
      <nav className="mobile-top-nav" role="navigation" aria-label="Admin top navigation">
        <NavLink to="/admin/hotel" className="nav-brand" title="Go to Admin Dashboard">Mini Hotel Admin</NavLink>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a href="/hotel" className="nav-client-link" title="Open Client View" target="_blank" rel="noopener noreferrer">Client</a>
          <button className={`nav-toggle ${isMobileOpen ? 'open' : ''}`} onClick={() => setIsMobileOpen(!isMobileOpen)} aria-label="Toggle navigation">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* Overlay for Mobile */}
      <div className={`sidebar-overlay ${isMobileOpen ? "active" : ""}`} onClick={() => setIsMobileOpen(false)} />

      {/* Sidebar Shell */}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${isMobileOpen ? "mobile-open" : ""}`} role="navigation" aria-label="Admin sidebar">
        <div className="sidebar-brand-area">
          <NavLink to="/admin/hotel" className="brand-link" title="Admin Dashboard">
            <div className="brand-logo" aria-hidden>
              <i className="bi bi-currency-dollar" />
            </div>
            <div className="brand-text">
              <span className="title">Mini Hotel</span>
              <span className="title">Management</span>
            </div>
          </NavLink>

          <a href="/hotel" className="brand-client-link" title="Open client site" target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>View site</a>

          <button className="collapse-toggle" onClick={() => setCollapsed(!collapsed)} aria-pressed={collapsed} aria-label="Collapse sidebar">
            <i className={`bi ${collapsed ? "bi-chevron-right" : "bi-chevron-left"}`} />
          </button>
        </div>

        {/* Scrollable Nav Area - Scrollbar is hidden via CSS */}
        <div className="sidebar-scroll-area">
          {NAV_SECTIONS.map((section, si) => (
            <div key={si} className="nav-group">
              <p className="group-label">{section.label}</p>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                  title={item.label}
                  aria-label={item.label}
                >
                  <i className={`bi ${item.icon} icon`} aria-hidden />
                  <span className="label-text">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
