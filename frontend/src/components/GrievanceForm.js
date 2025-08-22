import React, { useState } from 'react';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const GrievanceForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  });
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleChange = (e) => setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(`File ${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError(`File type ${file.type} is not supported.`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      setAttachments(prev => [...prev, ...validFiles]);
      setError('');
    }
  };

  const removeFile = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <i className="fas fa-image"></i>;
    if (file.type === 'application/pdf') return <i className="fas fa-file-pdf"></i>;
    return <i className="fas fa-file-alt"></i>;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Check if user is logged in
    if (!token) {
      setError('Please login first to submit a grievance.');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Submitting grievance:', formData);
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      
      // Append files
      attachments.forEach((file, index) => {
        formDataToSend.append('attachments', file);
      });
      
      const response = await API.post('/grievances', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      console.log('Grievance submitted successfully:', response.data);
      setSuccess('Grievance submitted successfully!');
      setFormData({ title: '', description: '', category: '' });
      setAttachments([]);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Grievance submission error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.message || 'Failed to submit grievance. Please try again.');
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
              <i className="fas fa-clipboard-list"></i>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">
              Submit Grievance
            </h1>
            
            <p className="text-secondary mb-6">
              Please provide detailed information about your grievance
            </p>

            {error && (
              <div className="alert alert-error mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full">
              <div className="grid gap-6">
                <div className="form-group">
                  <input
                    type="text"
                    name="title"
                    placeholder="Grievance Title"
                    value={formData.title}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="student">Student Issues</option>
                    <option value="faculty">Faculty Issues</option>
                    <option value="staff">Staff Issues</option>
                    <option value="network">Network Issues</option>
                    <option value="security">Security Issues</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <textarea
                    name="description"
                    placeholder="Please provide a detailed description of your grievance..."
                    value={formData.description}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="6"
                    required
                  />
                </div>

                {/* File Attachment Section */}
                <div className="form-group">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold mb-2">
                      Attachments (Optional)
                    </h3>
                    <p className="text-sm text-secondary mb-4">
                      Supported formats: Images (JPEG, PNG, GIF), PDF, Text, Word documents. Max size: 5MB per file.
                    </p>
                    
                    <label className="btn btn-outlined cursor-pointer">
                      <i className="fas fa-paperclip mr-2"></i>
                      Choose Files
                      <input
                        type="file"
                        multiple
                        className="file-input"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.gif,.pdf,.txt,.doc,.docx"
                      />
                    </label>
                  </div>

                  {/* File Preview */}
                  {attachments.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-base font-bold mb-3">
                        Attached Files ({attachments.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {attachments.map((file, index) => (
                          <div
                            key={index}
                            className="chip chip-primary"
                            onClick={() => removeFile(index)}
                          >
                            {getFileIcon(file)}
                            {file.name} ({formatFileSize(file.size)})
                            <i className="fas fa-times ml-2 cursor-pointer"></i>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex-1"
                >
                  {loading ? (
                    <div className="spinner" style={{ width: '24px', height: '24px' }}></div>
                  ) : (
                    'Submit Grievance'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="btn btn-outlined flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrievanceForm;
