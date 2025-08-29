import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const ForgotPassword = () => {
  const [step, setStep] = useState('email'); // 'email', 'otp', 'newPassword'
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await API.post('/auth/forgot-password', { email: formData.email });
      setSuccess('OTP has been sent to your email address.');
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await API.post('/auth/verify-otp', { 
        email: formData.email, 
        otp: formData.otp 
      });
      setSuccess('OTP verified successfully. Please enter your new password.');
      setStep('newPassword');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }
    
    try {
      await API.post('/auth/reset-password', {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      setSuccess('Password reset successfully! You can now login with your new password.');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  const renderEmailStep = () => (
    <div className="container-sm">
      <div className="flex flex-col items-center mt-8">
        <div className="card card-gradient">
          <div className="card-content">
            <div className="avatar mx-auto mb-4">
              <i className="fas fa-key"></i>
            </div>
            
            <h1 className="text-3xl font-bold mb-4 text-center">
              Forgot Password
            </h1>
            
            <p className="text-center mb-6 text-secondary">
              Enter your email address and we'll send you a verification code to reset your password.
            </p>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSendOTP} className="w-full">
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                  autoFocus
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
                  'Send Verification Code'
                )}
              </button>
              
              <button
                type="button"
                onClick={handleBackToLogin}
                className="btn btn-text btn-full"
              >
                Back to Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOTPStep = () => (
    <div className="container-sm">
      <div className="flex flex-col items-center mt-8">
        <div className="card card-gradient">
          <div className="card-content">
            <div className="avatar mx-auto mb-4">
              <i className="fas fa-shield-alt"></i>
            </div>
            
            <h1 className="text-3xl font-bold mb-4 text-center">
              Verify Code
            </h1>
            
            <p className="text-center mb-6 text-secondary">
              We've sent a verification code to <strong>{formData.email}</strong>
            </p>

            {success && (
              <div className="alert alert-success">
                {success}
              </div>
            )}

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="w-full">
              <div className="form-group">
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter verification code"
                  value={formData.otp}
                  onChange={handleChange}
                  className="form-input"
                  required
                  autoFocus
                  maxLength="6"
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
                  'Verify Code'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setStep('email')}
                className="btn btn-text btn-full"
              >
                Back to Email
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNewPasswordStep = () => (
    <div className="container-sm">
      <div className="flex flex-col items-center mt-8">
        <div className="card card-gradient">
          <div className="card-content">
            <div className="avatar mx-auto mb-4">
              <i className="fas fa-lock"></i>
            </div>
            
            <h1 className="text-3xl font-bold mb-4 text-center">
              New Password
            </h1>
            
            <p className="text-center mb-6 text-secondary">
              Enter your new password below
            </p>

            {success && (
              <div className="alert alert-success">
                {success}
              </div>
            )}

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="w-full">
              <div className="form-group">
                <input
                  type="password"
                  name="newPassword"
                  placeholder="New Password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="form-input"
                  required
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm New Password"
                  value={formData.confirmPassword}
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
                  'Reset Password'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setStep('otp')}
                className="btn btn-text btn-full"
              >
                Back to Verification
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {step === 'email' && renderEmailStep()}
      {step === 'otp' && renderOTPStep()}
      {step === 'newPassword' && renderNewPasswordStep()}
    </>
  );
};

export default ForgotPassword;
