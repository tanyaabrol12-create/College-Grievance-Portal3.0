const nodemailer = require('nodemailer');

// Build a real SMTP transporter from environment variables if available
const createRealTransporter = () => {
  // Option 1: Explicit host/port
  if (
    process.env.EMAIL_HOST &&
    process.env.EMAIL_PORT &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASSWORD
  ) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT === '465', // Only secure if port is 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false // Accept self-signed certificates
      }
    });
  }

  // Option 2: Nodemailer service (e.g., 'gmail')
  if (
    process.env.EMAIL_SERVICE &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASSWORD
  ) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  return null;
};

// Create a test transporter for development (Ethereal)
const createTestAccount = async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (e) {
    // In offline/dev environments without network, fall back to a no-op transporter
    return {
      sendMail: async () => ({ messageId: 'noop', previewUrl: null })
    };
  }
};

// Get transporter: prefer real SMTP via env, else Ethereal
const getTransporter = async () => {
  const real = createRealTransporter();
  if (real) return real;
  return await createTestAccount();
};

// For production, you would use real SMTP settings like this:
// const createProductionTransporter = () => {
//   return nodemailer.createTransporter({
//     service: 'gmail',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });
// };

const sendPasswordResetEmail = async (email, otp) => {
  try {
    const transporter = await getTransporter();
    
    const mailOptions = {
      from: `"College Grievance Portal"<${process.env.EMAIL_FROM || process.env.EMAIL_USER }>`|| '"College Grievance Portal" <noreply@cgp.com>',
      to: email,
      subject: 'Password Reset Request - College Grievance Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">College Grievance Portal</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Password Reset Request</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              We received a request to reset your password for your College Grievance Portal account. 
              If you didn't make this request, you can safely ignore this email.
            </p>
            
            <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <h3 style="color: #333; margin: 0 0 10px 0;">Your Verification Code</h3>
              <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; font-family: monospace;">
                ${otp}
              </div>
              <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">
                This code will expire in 10 minutes
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Enter this code in the password reset form to complete the process. 
              If you have any questions, please contact our support team.
            </p>
            
            <div style="background: #e9ecef; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h4 style="color: #333; margin: 0 0 10px 0;">Security Tips:</h4>
              <ul style="color: #666; margin: 0; padding-left: 20px;">
                <li>Never share this code with anyone</li>
                <li>Use a strong, unique password</li>
                <li>Enable two-factor authentication if available</li>
                <li>Keep your login credentials secure</li>
              </ul>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">
              © ${new Date().getFullYear()} College Grievance Portal. All rights reserved.
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    // Log Ethereal preview URL when using test transporter
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('Email sent: %s', info.messageId);
      console.log('Preview URL: %s', previewUrl);
    }
    
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send password reset email');
  }
};

const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = await getTransporter();
    
    const mailOptions = {
      from: `"College Grievance Portal"<${process.env.EMAIL_FROM || process.env.EMAIL_USER }>` || '"College Grievance Portal" <noreply@cgp.com>',
      to: email,
      subject: 'Welcome to College Grievance Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">College Grievance Portal</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Welcome to Our Community</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome, ${name}! 🎉</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for registering with the College Grievance Portal. We're excited to have you as part of our community!
            </p>
            
            <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="color: #333; margin: 0 0 15px 0;">What You Can Do:</h3>
              <ul style="color: #666; margin: 0; padding-left: 20px;">
                <li>Submit grievances and track their status</li>
                <li>Receive real-time updates on your submissions</li>
                <li>Access comprehensive grievance management tools</li>
                <li>Communicate securely with administrators</li>
              </ul>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Your account is now active and ready to use. You can log in to your dashboard and start submitting grievances right away.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://college-grievance-portal3-0-frontend1.onrender.com" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Access Your Dashboard
              </a>
            </div>
            
            <div style="background: #e9ecef; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h4 style="color: #333; margin: 0 0 10px 0;">Need Help?</h4>
              <p style="color: #666; margin: 0;">
                If you have any questions or need assistance, please don't hesitate to contact our support team. 
                We're here to help you make the most of our platform.
              </p>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">
              © ${new Date().getFullYear()} College Grievance Portal. All rights reserved.
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('Welcome email sent: %s', info.messageId);
      console.log('Preview URL: %s', previewUrl);
    }
    
    return info;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
};

const sendGrievanceSubmissionEmail = async (email, name, grievanceId, subject) => {
  try {
    const transporter = await getTransporter();
    
    const mailOptions = {
      from:  `"College Grievance Portal"<${process.env.EMAIL_FROM || process.env.EMAIL_USER }>`|| '"College Grievance Portal" <noreply@cgp.com>',
      to: email,
      subject: 'Grievance Submitted Successfully - College Grievance Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">College Grievance Portal</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Grievance Submission Confirmation</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello, ${name}! ✅</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Your grievance has been successfully submitted to the College Grievance Portal. 
              We have received your concern and it is now under review.
            </p>
            
            <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="color: #333; margin: 0 0 15px 0;">Grievance Details:</h3>
              <p style="color: #666; margin: 0 0 10px 0;"><strong>Grievance ID:</strong> ${grievanceId}</p>
              <p style="color: #666; margin: 0 0 10px 0;"><strong>Subject:</strong> ${subject}</p>
              <p style="color: #666; margin: 0;"><strong>Status:</strong> <span style="color: #ff9800; font-weight: bold;">Pending Review</span></p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Our team will review your grievance and you will receive updates on the status. 
              You can also track the progress of your grievance through your dashboard.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://college-grievance-portal3-0-frontend1.onrender.com/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                View Your Dashboard
              </a>
            </div>
            
            <div style="background: #e9ecef; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h4 style="color: #333; margin: 0 0 10px 0;">What Happens Next?</h4>
              <ul style="color: #666; margin: 0; padding-left: 20px;">
                <li>Your grievance will be reviewed by our team</li>
                <li>You'll receive status updates via email</li>
                <li>Administrators may request additional information if needed</li>
                <li>Resolution will be communicated once complete</li>
              </ul>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">
              © ${new Date().getFullYear()} College Grievance Portal. All rights reserved.
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('Grievance submission email sent: %s', info.messageId);
      console.log('Preview URL: %s', previewUrl);
    }
    
    return info;
  } catch (error) {
    console.error('Error sending grievance submission email:', error);
    throw new Error('Failed to send grievance submission email');
  }
};

const sendGrievanceStatusUpdateEmail = async (email, name, grievanceId, subject, status, comments = '') => {
  try {
    const transporter = await getTransporter();
    
    const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
        case 'approved':
          return '#4caf50';
        case 'rejected':
          return '#f44336';
        case 'in progress':
          return '#2196f3';
        default:
          return '#ff9800';
      }
    };
    
    const getStatusIcon = (status) => {
      switch (status.toLowerCase()) {
        case 'approved':
          return '✅';
        case 'rejected':
          return '❌';
        case 'in progress':
          return '🔄';
        default:
          return '⏳';
      }
    };
    
    const mailOptions = {
      from:  `"College Grievance Portal"<${process.env.EMAIL_FROM || process.env.EMAIL_USER }>`|| '"College Grievance Portal" <noreply@cgp.com>',
      to: email,
      subject: `Grievance Status Update: ${status.toUpperCase()} - College Grievance Portal`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">College Grievance Portal</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Grievance Status Update</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello, ${name}! ${getStatusIcon(status)}</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Your grievance has been reviewed and the status has been updated. 
              Please find the details below.
            </p>
            
            <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="color: #333; margin: 0 0 15px 0;">Grievance Details:</h3>
              <p style="color: #666; margin: 0 0 10px 0;"><strong>Grievance ID:</strong> ${grievanceId}</p>
              <p style="color: #666; margin: 0 0 10px 0;"><strong>Subject:</strong> ${subject}</p>
              <p style="color: #666; margin: 0 0 15px 0;"><strong>Status:</strong> <span style="color: ${getStatusColor(status)}; font-weight: bold;">${status.toUpperCase()}</span></p>
              
              ${comments ? `
                <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 15px;">
                  <h4 style="color: #333; margin: 0 0 10px 0;">Comments:</h4>
                  <p style="color: #666; margin: 0; font-style: italic;">"${comments}"</p>
                </div>
              ` : ''}
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              You can view the complete details and any additional information in your dashboard.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://college-grievance-portal3-0-frontend1.onrender.com/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                View Your Dashboard
              </a>
            </div>
            
            <div style="background: #e9ecef; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h4 style="color: #333; margin: 0 0 10px 0;">Need Assistance?</h4>
              <p style="color: #666; margin: 0;">
                If you have any questions about this status update or need further assistance, 
                please contact our support team. We're here to help!
              </p>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">
              © ${new Date().getFullYear()} College Grievance Portal. All rights reserved.
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('Status update email sent: %s', info.messageId);
      console.log('Preview URL: %s', previewUrl);
    }
    
    return info;
  } catch (error) {
    console.error('Error sending status update email:', error);
    throw new Error('Failed to send status update email');
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendGrievanceSubmissionEmail,
  sendGrievanceStatusUpdateEmail,
};
