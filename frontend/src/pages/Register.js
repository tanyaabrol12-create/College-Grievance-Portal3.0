import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setUserData({
    ...userData,
    [e.target.name]: e.target.value
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Sending registration request with data:', userData);
      const response = await API.post('/auth/register', userData);
      console.log('Registration successful, full response:', response);
      console.log('Registration response data:', response.data);
      
      // Check if token and user data are returned
      if (response.data.token && response.data.user) {
        console.log('Auto-login after registration with token:', response.data.token.substring(0, 20) + '...');
        console.log('User data for login:', response.data.user);
        // Use the AuthContext login function to store token and user data
        const loginSuccess = login(response.data.user, response.data.token);
        console.log('Login function called, result:', loginSuccess);
        
        if (loginSuccess) {
          console.log('Login successful, redirecting to dashboard');
          // Redirect to dashboard instead of login page
          navigate('/dashboard');
        } else {
          console.error('Auto-login failed after registration');
          setError('Registration successful but auto-login failed. Please try logging in manually.');
          navigate('/');
        }
      } else {
        console.log('No token or user data returned, redirecting to login');
        navigate('/');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-md">
      <div className="flex flex-col items-center mt-8 mb-8">
        <div className="card card-gradient w-full">
          <div className="card-content text-center">
            <div className="avatar mx-auto mb-4">
              <i className="fas fa-user-plus"></i>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">
              Create Account
            </h1>
            
            <p className="text-secondary mb-6">
              Join the College Grievance Portal community
            </p>

            {/* Admin Notice */}
            <div className="card mb-10" style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
              <div className="card-content">
                <div className="flex items-center mb-2">
                  <i className="fas fa-info-circle mr-2"></i>
                  <h3 className="text-lg font-bold">
                    Important Notice
                  </h3>
                </div>
                <p className="mb-4">
                  <strong>Admin and HOD users</strong> have predefined credentials and cannot be registered here.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-shield-alt"></i>
                    <span>Admin: admin@cgs.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-graduation-cap"></i>
                    <span>HOD: hod@cgs.com</span>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="alert alert-error mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full">
              <div className="grid grid-2 gap-4 mb-4">
                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={userData.name}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={userData.email}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group mb-4">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={userData.password}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="grid grid-2 gap-4 mb-6">
                <div className="form-group">
                  <select
                    name="role"
                    value={userData.role}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="department"
                    placeholder="Department"
                    value={userData.department}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-full mb-4"
              >
                {loading ? (
                  <div className="spinner" style={{ width: '24px', height: '24px' }}></div>
                ) : (
                  'Create Account'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn btn-text btn-full"
              >
                Already have an account? Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
