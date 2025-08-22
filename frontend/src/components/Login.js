import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [loginType, setLoginType] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLoginClick = () => {
    setShowLoginOptions(true);
  };

  const handleLoginTypeSelect = (type) => {
    setLoginType(type);
    setShowLoginOptions(false);
    setError('');
    setFormData({ email: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await API.post('/auth/login', formData);
      // Prevent users from logging in via admin portal
      if (loginType === 'admin' && !['admin', 'dean', 'hod'].includes(res.data.user.role)) {
        setError('Only admins can login through the admin portal.');
        setLoading(false);
        return;
      }
      
      // Use the AuthContext login function
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToOptions = () => {
    setLoginType('');
    setFormData({ email: '', password: '' });
    setError('');
  };

  const renderLoginOptions = () => (
    showLoginOptions && (
      <div className="dialog-overlay" onClick={() => setShowLoginOptions(false)}>
        <div className="dialog" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-2xl font-bold text-center mb-4">Choose Login Type</h2>
          <div className="grid grid-2 gap-4">
            <div 
              className="card card-gradient cursor-pointer"
              onClick={() => handleLoginTypeSelect('user')}
            >
              <div className="card-content text-center">
                <div className="avatar mx-auto mb-3">
                  <i className="fas fa-user"></i>
                </div>
                <h3 className="text-lg font-bold mb-2" >User Login</h3>
                <p className="text-secondary">For students, faculty, and staff members</p>
              </div>
            </div>
            <div 
              className="card card-gradient-alt cursor-pointer"
              onClick={() => handleLoginTypeSelect('admin')}
            >
              <div className="card-content text-center">
                <div className="avatar mx-auto mb-3">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h3 className="text-lg font-bold mb-2">Admin Login</h3>
                <p className="text-secondary">For administrators and department heads</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );

  const renderLoginForm = () => (
    <div className="container-sm">
      <div className="flex flex-col items-center mt-8">
        <div className={`card card-content ${loginType === 'admin' ? 'card-gradient-alt' : 'card-gradient'}`}>
          <div className="avatar mx-auto mb-4">
            {loginType === 'admin' ? (
              <i className="fas fa-shield-alt"></i>
            ) : (
              <i className="fas fa-lock"></i>
            )}
          </div>
          
          <h1 className="text-3xl font-bold mb-4 text-center">
            {loginType === 'admin' ? 'Admin Login' : 'User Login'}
          </h1>
          
          <p className="text-center mb-6 text-secondary">
            {loginType === 'admin' 
              ? 'Sign in to access administrative features' 
              : 'Sign in to your College Grievance Portal account'
            }
          </p>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full">
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
                autoFocus
              />
            </div>
            
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full mb-4"
            >
              {loading ? (
                <div className="spinner" style={{ width: '24px', height: '24px' }}></div>
              ) : (
                'Sign In'
              )}
            </button>
            
            {/* <button
              type="button"
              onClick={handleBackToOptions}
              className="btn btn-text btn-full mb-4"
            >
              Back to Login Options
            </button> */}
            
            {loginType === 'user' && (
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="btn btn-text btn-full"
              >
                Don't have an account? Sign Up
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {!loginType ? (
        <div className="container-lg">
          <div className="flex flex-col items-center mt-8">
            {/* CGS Information Section */}
            <div className="card card-gradient mb-9 w-full text-center">
              <div className="card-content">
                <h1 className="text-4xl font-bold mb-4">
                  Welcome to CGP
                </h1>
                <h2 className="text-2xl font-bold mb-3">
                  College Grievance Portal
                </h2>
                <p className="text-lg mb-4 text-secondary max-w-3xl mx-auto">
                  A comprehensive platform designed to streamline the grievance management process in educational institutions. 
                  Our system provides a secure, efficient, and transparent way for students, faculty, and staff to submit, 
                  track, and resolve grievances while maintaining confidentiality and ensuring timely resolution.
                </p>
                <p className="text-muted italic">
                  Empowering our community through effective communication and problem resolution.
                </p>
              </div>
            </div>

            {/* Login Options */}
            <div className="card card-gradient w-full">
              <div className="card-content text-center">
                <div className="avatar mx-auto mb-4">
                  <i className="fas fa-lock"></i>
                </div>
                
                <h2 className="text-3xl font-bold mb-4">
                  Get Started
                </h2>
                
                <p className="text-secondary mb-6">
                  Choose your login type to access the Portal
                </p>

                <button
                  onClick={handleLoginClick}
                  className="btn btn-primary"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        renderLoginForm()
      )}
      
      {renderLoginOptions()}
    </>
  );
};

export default Login;
