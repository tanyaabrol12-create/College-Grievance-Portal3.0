# Central Grievance System

A modern, beautiful web application for managing grievances in educational institutions. Built with React, Material-UI, Node.js, and MongoDB.

## Features

- 🎨 **Beautiful Modern UI** - Gradient designs and smooth animations
- 👤 **User Authentication** - Secure login and registration system
- 📝 **Grievance Management** - Submit, view, and track grievances
- 📊 **Dashboard Analytics** - Statistics and category breakdowns
- 🔐 **Role-based Access** - Different permissions for different user roles
- 👨‍💼 **Predefined Admin Users** - Admin and HOD with predefined credentials
- 📱 **Responsive Design** - Works perfectly on all devices
- ⚡ **Real-time Updates** - Instant feedback and notifications

## Tech Stack

### Frontend
- React 19
- Material-UI (MUI)
- React Router DOM
- Axios for API calls

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/grievance-portal
JWT_SECRET=your-secret-key-here
PORT=5000
```

4. Start the backend server:
```bash
npm start
# or for development with nodemon
npm run dev
```

The backend will run on `http://localhost:5000`

**Note**: The server will automatically create predefined admin users on first startup.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## User Roles & Access

### Predefined Admin Users

#### System Administrator (Dean)
- **Email**:*****@cgs.com
- **Password**: *******
- **Access**: Can view ALL grievances from any user
- **Permissions**: Full access to all grievance categories

#### Head of Department (HOD)
- **Email**:****@cgs.com
- **Password**: ******
- **Access**: Can view student and faculty grievances only
- **Permissions**: Limited to student and faculty categories

### Regular Users (Registration Required)

- **Student** - Can submit and view their own grievances
- **Faculty** - Can submit and view their own grievances
- **Staff** - Can submit and view their own grievances

### Role-based Access Control

| Role | Student Grievances | Faculty Grievances | Staff Grievances | Network Grievances | Security Grievances |
|------|-------------------|-------------------|------------------|-------------------|-------------------|
| Dean (Admin) | ✅ | ✅ | ✅ | ✅ | ✅ |
| HOD | ✅ | ✅ | ❌ | ❌ | ❌ |
| Student | ✅ (own only) | ❌ | ❌ | ❌ | ❌ |
| Faculty | ❌ | ✅ (own only) | ❌ | ❌ | ❌ |
| Staff | ❌ | ❌ | ✅ (own only) | ❌ | ❌ |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user (excludes admin/hod)
- `POST /api/auth/login` - Login user

### Grievances
- `GET /api/grievances` - Get grievances (filtered by role)
- `POST /api/grievances` - Submit new grievance
- `PUT /api/grievances/:id/status` - Update grievance status (admin/hod only)
- `GET /api/grievances/stats` - Get grievance statistics

## Features Overview

### 🎨 Beautiful Design
- Gradient backgrounds and modern UI elements
- Smooth hover animations and transitions
- Responsive design for all screen sizes
- Custom scrollbars and focus effects

### 👨‍💼 Admin Management
- Predefined admin users with secure credentials
- Role-based access control
- Visual indicators for admin users
- Special admin interface elements

### 📊 Dashboard Analytics
- Statistics cards showing grievance counts
- Category breakdown with colorful chips
- Real-time data updates
- Role-specific information display

### 🔐 Security
- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control
- Secure API endpoints
- Predefined admin protection

### 📱 User Experience
- Intuitive navigation
- Loading states and error handling
- Success notifications
- Form validation
- Role-specific dashboards

## Quick Start Guide

### For Admin Users
1. **Login with predefined credentials**:
2. **Access all grievances** based on your role
3. **Update grievance status** as needed

### For Regular Users
1. **Register** a new account (student, faculty, or staff)
2. **Login** with your credentials
3. **Submit grievances** and view your own submissions

## Project Structure

```
CGS2/
├── backend/
│   ├── index.js              # Main server file with admin initialization
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── models/
│   │   ├── User.js          # User model with isPredefined field
│   │   └── Grievance.js     # Grievance model with timestamps
│   ├── routes/
│   │   ├── auth.js          # Authentication routes with role restrictions
│   │   └── grievance.js     # Grievance routes with role-based filtering
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js     # Login with admin credentials display
│   │   │   ├── Navbar.js    # Navigation with role indicators
│   │   │   ├── GrievanceForm.js    # Grievance submission form
│   │   │   └── GrievanceCard.js    # Grievance display card
│   │   ├── pages/
│   │   │   ├── Dashboard.js # Role-specific dashboard
│   │   │   ├── Register.js  # Registration with role restrictions
│   │   │   └── SubmitGrievance.js # Grievance submission page
│   │   ├── services/
│   │   │   └── api.js       # API service configuration
│   │   └── App.js           # Main app component
│   └── package.json
└── README.md
```

## Running the Application

1. **Start MongoDB** (if running locally):
```bash
mongod
```

2. **Start the backend** (in backend directory):
```bash
npm start
```

3. **Start the frontend** (in frontend directory):
```bash
npm start
```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Admin Credentials

### System Administrator (Dean)
- **Email**:****@cgs.com
- **Password**: *****
- **Access Level**: Full access to all grievances

### Head of Department (HOD)
- **Email**:*****@cgs.com
- **Password**:******
- **Access Level**: Student and faculty grievances only

## Development

### Adding New Features
1. Create new components in `frontend/src/components/`
2. Add routes in `frontend/src/App.js`
3. Create API endpoints in `backend/routes/`
4. Update models if needed in `backend/models/`

### Styling
The application uses Material-UI with custom styling. All components use the `sx` prop for styling with a consistent color scheme:
- Primary: `#667eea` to `#764ba2` gradient
- Secondary: Various status colors
- Background: Light gradients

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env` file

2. **Admin Users Not Created**
   - Check MongoDB connection
   - Restart the backend server
   - Check console logs for initialization messages

3. **CORS Errors**
   - Backend CORS is configured for development
   - Update CORS settings for production

4. **JWT Token Issues**
   - Check token format (Bearer token)
   - Verify JWT secret in backend

5. **Role-based Access Issues**
   - Verify user role in database
   - Check role-based filtering logic
   - Ensure proper role assignments

## Security Notes

- Admin credentials are predefined and cannot be changed through the registration process
- Regular users cannot register as admin or HOD roles
- All passwords are hashed using bcryptjs
- JWT tokens are used for session management
- Role-based access is enforced on both frontend and backend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository. 
