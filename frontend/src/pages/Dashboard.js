import React, { useEffect, useState } from 'react';
import API from '../services/api';
import GrievanceCard from '../components/GrievanceCard';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    try {
      setLoading(true);
      const res = await API.get('/grievances');
      setGrievances(res.data);
    } catch (err) {
      setError('Failed to fetch grievances. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusCount = (status) => {
    return grievances.filter(g => g.status === status).length;
  };

  const getCategoryCount = (category) => {
    return grievances.filter(g => g.category === category).length;
  };

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

  const getRoleDescription = (role) => {
    switch (role) {
      case 'admin':
      case 'dean':
        return 'You can view all grievances from any user';
      case 'hod':
        return 'You can view student and faculty grievances only';
      case 'student':
      case 'faculty':
      case 'staff':
      default:
        return 'You can view and submit your own grievances';
    }
  };

  const getAccessibleCategories = (role) => {
    switch (role) {
      case 'admin':
      case 'dean':
        return ['student', 'faculty', 'staff', 'network', 'security'];
      case 'hod':
        return ['student', 'faculty'];
      default:
        return [role];
    }
  };

  // Filter grievances for display
  let displayedGrievances = grievances;
  if (selectedCategory !== 'all') {
    displayedGrievances = grievances.filter(g => g.category === selectedCategory);
  }

  const stats = [
    {
      title: 'Total Grievances',
      value: grievances.length,
      icon: <i className="fas fa-clipboard-list"></i>,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Pending',
      value: getStatusCount('Pending'),
      icon: <i className="fas fa-clock"></i>,
      gradient: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
    },
    {
      title: 'Resolved',
      value: getStatusCount('Resolved'),
      icon: <i className="fas fa-check-circle"></i>,
      gradient: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)'
    },
    {
      title: 'In Progress',
      value: getStatusCount('In Progress'),
      icon: <i className="fas fa-tachometer-alt"></i>,
      gradient: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'
    }
  ];

  if (loading) {
    return (
      <div className="container-lg">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-lg">
      <div className="py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="avatar-lg mr-4">
              {getRoleIcon(user?.role)}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Welcome, {user?.name}
              </h1>
              <p className="text-lg text-black-600">
                {getRoleDescription(user?.role)}
              </p>
            </div>
          </div>
          {/* Admin/dean/hod logout button always visible for admin, dean, or hod */}
          {/* (user?.role === 'admin' || user?.role === 'dean' || user?.role === 'hod') && (
            <button
              className="btn btn-outlined"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Logout
            </button>
          ) */}
        </div>

        {/* Submit Grievance Button - Only show for non-admin/dean users */}
        {user?.role !== 'admin' && user?.role !== 'dean' && (
          <button
            className="btn btn-primary mb-6"
            onClick={() => navigate('/submit')}
          >
            <i className="fas fa-plus mr-2"></i>
            Submit New Grievance
          </button>
        )}

        {error && (
          <div className="alert alert-error mb-6">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="card">
              <div className="card-content text-center" style={{ background: stat.gradient, color: 'white' }}>
                <div className="text-4xl mb-4">
                  {stat.icon}
                </div>
                <h3 className="text-4xl font-bold mb-2">
                  {stat.value}
                </h3>
                <p className="text-lg font-medium opacity-90">
                  {stat.title}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Category Breakdown - Only show for admin users */}
        {(user?.role === 'admin' || user?.role === 'dean' || user?.role === 'hod') && (
          <div className="card mb-8">
            <div className="card-content">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Grievances by Category
              </h2>
              <div className="flex flex-wrap gap-3">
                <button
                  className={`chip ${selectedCategory === 'all' ? 'chip-outlined' : 'chip-primary'}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  All Grievances
                </button>
                {getAccessibleCategories(user?.role).map((category) => (
                  <button
                    key={category}
                    className={`chip ${selectedCategory === category ? 'chip-outlined' : 'chip-primary'}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}: {getCategoryCount(category)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Grievances List */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Recent Grievances
          </h2>
          {displayedGrievances.length === 0 ? (
            <div className="card text-center">
              <div className="card-content p-12">
                <h3 className="text-2xl font-bold text-gray-600 mb-4">
                  No grievances found
                </h3>
                <p className="text-gray-600 mb-6">
                  {user?.role === 'admin' || user?.role === 'dean' 
                    ? 'No grievances have been submitted yet'
                    : 'Start by submitting your first grievance'
                  }
                </p>
                {/* Only show submit button for non-admin/dean users */}
                {user?.role !== 'admin' && user?.role !== 'dean' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate('/submit')}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Submit First Grievance
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              {displayedGrievances.map((grievance) => (
                <div key={grievance._id}>
                  <GrievanceCard 
                    grievance={grievance} 
                    onStatusUpdate={fetchGrievances}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
