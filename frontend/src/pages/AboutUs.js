import React from 'react';

const AboutUs = () => {
  return (
    <div className="container-lg">
      <div className="flex flex-col items-center mt-8">
        {/* Hero Section */}
        <div className="card card-gradient mb-8 w-full text-center">
          <div className="card-content">
            <h1 className="text-4xl font-bold mb-4">
              About College Grievance Portal
            </h1>
            <p className="text-lg text-secondary max-w-4xl mx-auto">
              A comprehensive digital platform designed to streamline grievance management in educational institutions, 
              fostering transparency, efficiency, and better communication between students, faculty, and administration.
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-2 gap-6 mb-8 w-full">
          <div className="card card-gradient">
            <div className="card-content">
              <div className="avatar mx-auto mb-4">
                <i className="fas fa-bullseye"></i>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-center">Our Mission</h2>
              <p className="text-secondary text-center">
                To provide a secure, efficient, and transparent platform for addressing grievances 
                within educational institutions, ensuring timely resolution and maintaining the highest 
                standards of confidentiality and professionalism.
              </p>
            </div>
          </div>

          <div className="card card-gradient-alt">
            <div className="card-content">
              <div className="avatar mx-auto mb-4">
                <i className="fas fa-eye"></i>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-center">Our Vision</h2>
              <p className="text-secondary text-center">
                To become the leading grievance management solution for educational institutions, 
                promoting open communication, accountability, and continuous improvement in 
                institutional processes and student services.
              </p>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="card w-full mb-8">
          <div className="card-content">
            <h2 className="text-3xl font-bold mb-6 text-center">Key Features</h2>
            <div className="grid grid-3 gap-6">
              <div className="text-center">
                <div className="avatar mx-auto mb-3">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h3 className="text-lg font-bold mb-2">Secure Authentication</h3>
                <p className="text-secondary">
                  Role-based access control with secure login for different user types including students, 
                  faculty, staff, and administrators.
                </p>
              </div>

              <div className="text-center">
                <div className="avatar mx-auto mb-3">
                  <i className="fas fa-file-alt"></i>
                </div>
                <h3 className="text-lg font-bold mb-2">Grievance Submission</h3>
                <p className="text-secondary">
                  Easy-to-use forms for submitting grievances with file attachment support 
                  and detailed categorization.
                </p>
              </div>

              <div className="text-center">
                <div className="avatar mx-auto mb-3">
                  <i className="fas fa-tasks"></i>
                </div>
                <h3 className="text-lg font-bold mb-2">Status Tracking</h3>
                <p className="text-secondary">
                  Real-time tracking of grievance status from submission to resolution 
                  with automated notifications.
                </p>
              </div>

              <div className="text-center">
                <div className="avatar mx-auto mb-3">
                  <i className="fas fa-chart-bar"></i>
                </div>
                <h3 className="text-lg font-bold mb-2">Analytics Dashboard</h3>
                <p className="text-secondary">
                  Comprehensive dashboard for administrators to monitor grievance patterns, 
                  resolution times, and institutional insights.
                </p>
              </div>

              <div className="text-center">
                <div className="avatar mx-auto mb-3">
                  <i className="fas fa-bell"></i>
                </div>
                <h3 className="text-lg font-bold mb-2">Notifications</h3>
                <p className="text-secondary">
                  Automated email notifications for status updates, new assignments, 
                  and resolution confirmations.
                </p>
              </div>

              <div className="text-center">
                <div className="avatar mx-auto mb-3">
                  <i className="fas fa-mobile-alt"></i>
                </div>
                <h3 className="text-lg font-bold mb-2">Responsive Design</h3>
                <p className="text-secondary">
                  Mobile-friendly interface that works seamlessly across all devices 
                  and screen sizes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Stack
        <div className="card w-full mb-8">
          <div className="card-content">
            <h2 className="text-3xl font-bold mb-6 text-center">Technology Stack</h2>
            <div className="grid grid-2 gap-6">
              <div>
                <h3 className="text-xl font-bold mb-4 text-center">Frontend</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-semibold">React.js</span>
                    <span className="text-secondary">Modern UI Framework</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-semibold">CSS3</span>
                    <span className="text-secondary">Custom Styling</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-semibold">React Router</span>
                    <span className="text-secondary">Navigation</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4 text-center">Backend</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-semibold">Node.js</span>
                    <span className="text-secondary">Runtime Environment</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-semibold">Express.js</span>
                    <span className="text-secondary">Web Framework</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-semibold">MongoDB</span>
                    <span className="text-secondary">Database</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> */}

        {/* Benefits */}
        <div className="card w-full mb-8">
          <div className="card-content">
            <h2 className="text-3xl font-bold mb-6 text-center">Benefits</h2>
            <div className="grid grid-2 gap-6">
              <div>
                <h3 className="text-xl font-bold mb-4 text-center">For Students</h3>
                <ul className="space-y-2 text-secondary flex flex-col justify-center items-center ">
                  <li className="flex items-center">
                    <i className="fas fa-check text--500 mr-2"></i>
                    Easy grievance submission process
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Real-time status tracking
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Confidential and secure communication
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Faster resolution times
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4 text-center">For Administration</h3>
                <ul className="space-y-2 text-secondary flex flex-col justify-center items-center ">
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Centralized grievance management
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Automated workflow processes
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Comprehensive analytics and reporting
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Improved institutional transparency
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card w-full mb-11">
          <div className="card-content text-center">
            <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
            <p className="text-lg text-secondary mb-6">
              Have questions or need support? We're here to help!
            </p>
            <div className="flex justify-center space-x-6">
              <a 
                href="mailto:tanyaabrol12@gmail.com" 
                className="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fas fa-envelope mr-2"></i>
                Email Support
              </a>
              <a 
                href="https://linkedin.com/in/tanya-abrol" 
                className="btn btn-outlined"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-linkedin mr-2"></i>
                LinkedIn
              </a>
              <a 
                href="https://github.com/tanyaabrol12-create" 
                className="btn btn-outlined"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-github mr-2"></i>
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
