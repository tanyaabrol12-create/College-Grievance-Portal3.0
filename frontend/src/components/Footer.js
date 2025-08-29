import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-title">College Grievance Portal</h3>
          <p className="footer-description">
            A comprehensive platform for efficient grievance management in educational institutions.
          </p>
        </div>

        <div className="footer-section">
          <h4 className="footer-subtitle">Quick Links</h4>
          <ul className="footer-links">
            <li><a href="/" className="footer-link">Home</a></li>
            <li><a href="/about" className="footer-link">About Us</a></li>
            <li><a href="/dashboard" className="footer-link">Dashboard</a></li>
            <li><a href="/submit" className="footer-link">Submit Grievance</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-subtitle">Contact Developer</h4>
          <div className="footer-social">
            <a 
              href="mailto:tanyaabrol12@gmail.com" 
              className="footer-social-link"
              target="_blank"
              rel="noopener noreferrer"
              title="Email"
            >
              <i className="fas fa-envelope"></i>
              <span>tanyaabrol12@gmail.com</span>
            </a>
            
            <a 
              href="https://linkedin.com/in/tanya-abrol" 
              className="footer-social-link"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
            >
              <i className="fab fa-linkedin"></i>
              <span>LinkedIn Profile</span>
            </a>
            
            <a 
              href="https://github.com/tanyaabrol12-create" 
              className="footer-social-link"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
            >
              <i className="fab fa-github"></i>
              <span>GitHub Repository</span>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p className="footer-copyright">
            © {currentYear} College Grievance Portal. All rights reserved.
          </p>
          <p className="footer-developer">
            Developed with ❤️ by <a 
              href="https://linkedin.com/in/tanya-abrol" 
              className="footer-developer-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Tanya Abrol
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
