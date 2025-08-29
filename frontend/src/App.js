// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SubmitGrievance from './pages/SubmitGrievance';
import AboutUs from './pages/AboutUs';
import ForgotPassword from './components/ForgotPassword';
import LoadingSpinner from './components/LoadingSpinner';

// ProtectedRoute component with proper authentication checks
function ProtectedRoute({ element, allowedRoles, redirectTo = "/" }) {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }
  
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not allowed, redirect to dashboard (admin can access user pages)
    if (user.role === 'admin' || user.role === 'dean') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  return element;
}

// Home component that shows different content based on auth status
function Home() {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }
  
  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Login />;
}

function AppRoutes() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Dashboard: all authenticated users */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute 
              element={<Dashboard />} 
              allowedRoles={["admin", "dean", "hod", "student", "faculty", "staff"]} 
            />
          } 
        />
        
        {/* SubmitGrievance: only non-admins */}
        <Route 
          path="/submit" 
          element={
            <ProtectedRoute 
              element={<SubmitGrievance />} 
              allowedRoles={["student", "faculty", "staff", "hod"]} 
            />
          } 
        />
        
        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {isHomePage && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
