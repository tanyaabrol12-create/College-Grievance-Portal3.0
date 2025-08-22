import React, { useState } from 'react';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function GrievanceCard({ grievance, onStatusUpdate }) {
  const [status, setStatus] = useState(grievance.status || 'Pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  const canUpdateStatus = user && ['admin', 'dean', 'hod'].includes(user.role);

  const handleStatusChange = async (newStatus) => {
    if (!canUpdateStatus) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await API.put(`/grievances/${grievance._id}/status`, { status: newStatus });
      setStatus(newStatus);
      setSuccess('Status updated successfully!');
      if (onStatusUpdate) {
        onStatusUpdate();
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAttachment = async (filename) => {
    try {
      const response = await API.get(`/grievances/attachments/${grievance._id}/${filename}`, {
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Find the original filename
      const attachment = grievance.attachments.find(att => att.filename === filename);
      link.setAttribute('download', attachment ? attachment.originalName : filename);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download attachment');
      setTimeout(() => setError(''), 5000);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return 'status-resolved';
      case 'in progress':
        return 'status-progress';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-pending';
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'student':
        return 'category-student';
      case 'faculty':
        return 'category-faculty';
      case 'staff':
        return 'category-staff';
      case 'network':
        return 'category-network';
      case 'security':
        return 'category-security';
      default:
        return 'category-student';
    }
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) return <i className="fas fa-image"></i>;
    if (mimetype === 'application/pdf') return <i className="fas fa-file-pdf"></i>;
    return <i className="fas fa-file-alt"></i>;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const statusClass = getStatusColor(status);
  const categoryClass = getCategoryColor(grievance.category);

  return (
    <div className="card">
      <div className="card-content p-6">
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

        <div className="flex items-start mb-6">
          <div className={`avatar mr-4 ${categoryClass}`}>
            <i className="fas fa-clipboard-list"></i>
          </div>
          
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              {grievance.title}
            </h3>
            
            <p className="text-gray-600 mb-4 leading-relaxed">
              {grievance.description}
            </p>
          </div>
        </div>

        <div className="divider"></div>

        <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
          <div className="flex gap-3 flex-wrap items-center">
            <div className={`chip ${categoryClass}`}>
              {grievance.category?.charAt(0).toUpperCase() + grievance.category?.slice(1) || 'Unknown'}
            </div>
            
            {canUpdateStatus ? (
              <div className="flex items-center gap-2">
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={loading}
                  className={`form-select ${statusClass}`}
                  style={{ minWidth: '140px', height: '45px' }}
                >
                  <option value="Pending">⏳ Pending</option>
                  <option value="In Progress">🔄 In Progress</option>
                  <option value="Resolved">✅ Resolved</option>
                </select>
                {loading && <div className="spinner" style={{ width: '20px', height: '20px' }}></div>}
              </div>
            ) : (
              <div className={`chip ${statusClass}`}>
                {status?.toLowerCase() === 'resolved' ? <i className="fas fa-check-circle mr-2"></i> :
                 status?.toLowerCase() === 'in progress' ? <i className="fas fa-clock mr-2"></i> :
                 <i className="fas fa-exclamation-circle mr-2"></i>}
                {status}
              </div>
            )}
          </div>

          {grievance.createdAt && (
            <span className="text-sm text-gray-500 font-medium">
              📅 {new Date(grievance.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Attachments Section */}
        {grievance.attachments && grievance.attachments.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-lg font-bold text-gray-800 mb-3">
              📎 Attachments ({grievance.attachments.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {grievance.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="chip chip-primary cursor-pointer"
                  onClick={() => handleDownloadAttachment(attachment.filename)}
                >
                  {getFileIcon(attachment.mimetype)}
                  {attachment.originalName} ({formatFileSize(attachment.size)})
                  <i className="fas fa-download ml-2"></i>
                </div>
              ))}
            </div>
          </div>
        )}

        {grievance.submittedBy && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 font-medium">
              👤 Submitted by: {grievance.submittedBy.name || grievance.submittedBy}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GrievanceCard;
