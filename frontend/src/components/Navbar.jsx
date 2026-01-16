import './Navbar.css';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <div className="navbar-brand">
            <div className="logo">
              <span className="logo-icon"><i className="fas fa-chart-pie"></i></span>
              <span className="logo-text">Customer Segmentation</span>
            </div>
          </div>

          <div className="navbar-menu">
            <Link
              to="/"
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              <span className="nav-icon"><i className="fas fa-home"></i></span>
              Dashboard
            </Link>
            <Link
              to="/analysis"
              className={`nav-link ${isActive('/analysis') ? 'active' : ''}`}
            >
              <span className="nav-icon"><i className="fas fa-microscope"></i></span>
              Analysis
            </Link>
            <Link
              to="/customers"
              className={`nav-link ${isActive('/customers') ? 'active' : ''}`}
            >
              <span className="nav-icon"><i className="fas fa-users"></i></span>
              Customers
            </Link>
            <Link
              to="/campaigns"
              className={`nav-link ${isActive('/campaigns') ? 'active' : ''}`}
            >
              <span className="nav-icon"><i className="fas fa-bullseye"></i></span>
              Campaigns
            </Link>
            <Link
              to="/reports"
              className={`nav-link ${isActive('/reports') ? 'active' : ''}`}
            >
              <span className="nav-icon"><i className="fas fa-chart-line"></i></span>
              Reports
            </Link>
            <Link
              to="/settings"
              className={`nav-link ${isActive('/settings') ? 'active' : ''}`}
            >
              <span className="nav-icon"><i className="fas fa-cog"></i></span>
              Settings
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
