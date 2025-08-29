import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleClose();
  };

  const isLoggedIn = !!user;

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
      case 'dean':
        return <i className="fas fa-shield-alt"></i>;
      case 'hod':
        return <i className="fas fa-graduation-cap"></i>;
      default:
        return <i className="fas fa-user"></i>;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
      case 'dean':
        return '#f5576c';
      case 'hod':
        return '#667eea';
      default:
        return '#4caf50';
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div 
          className="navbar-brand"
          onClick={() => navigate('/dashboard')}
        >
          College Grievance Portal
        </div>
        
        {isLoggedIn ? (
          <div className="navbar-nav">
            <button
              className="nav-button"
              onClick={() => navigate('/dashboard')}
            >
              <i className="fas fa-tachometer-alt"></i>
              Dashboard
            </button>
            
            {/* Only show Submit Grievance button for non-admin/dean users */}
            {user?.role !== 'admin' && user?.role !== 'dean' && (
              <button
                className="nav-button"
                onClick={() => navigate('/submit')}
              >
                <i className="fas fa-plus"></i>
                Submit Grievance
              </button>
            )}

            <button
              className="nav-button"
              onClick={() => navigate('/about')}
            >
              <i className="fas fa-info-circle"></i>
              About Us
            </button>

            <div className="user-chip">
              {getRoleIcon(user?.role)}
              {user?.role?.toUpperCase() || 'USER'}
            </div>

            <div className="user-avatar" onClick={handleMenu}>
              {getRoleIcon(user?.role)}
            </div>
            
            {anchorEl && (
              <div className="dialog-overlay" onClick={handleClose}>
                <div className="dialog" onClick={(e) => e.stopPropagation()}>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      {user?.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {user?.email}
                    </p>
                    <div className="flex items-center mt-2">
                      {getRoleIcon(user?.role)}
                      <span className="ml-2 text-sm font-bold" style={{ color: getRoleColor(user?.role) }}>
                        {user?.role?.toUpperCase()}
                      </span>
                    </div>
                    {user?.isPredefined && (
                      <div className="chip chip-primary mt-2 text-xs">
                        Predefined User
                      </div>
                    )}
                  </div>
                  <div className="divider"></div>
                  <button
                    onClick={handleLogout}
                    className="btn btn-text w-full text-red-600 "
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="navbar-nav">
            <button
              className="nav-button"
              onClick={() => navigate('/about')}
            >
              <i className="fas fa-info-circle"></i>
              About Us
            </button>
            <button
              className="nav-button outlined"
              onClick={() => navigate('/register')}
            >
              Register
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
