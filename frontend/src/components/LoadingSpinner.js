import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="loading">
      <div className="spinner"></div>
      <h2 className="text-xl font-medium text-gray-600">
        {message}
      </h2>
    </div>
  );
};

export default LoadingSpinner; 