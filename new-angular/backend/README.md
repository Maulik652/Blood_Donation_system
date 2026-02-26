# Blood Donation Management System - Backend

RESTful API for Blood Donation Management System built with Node.js, Express, and MongoDB.

## Features

- JWT Authentication & Authorization
- Role-based Access Control (Admin, Hospital, Donor)
- User Registration & Login
- Blood Request Management
- Event Management
- Admin Dashboard APIs
- Password Hashing with bcrypt

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file in the root directory:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/blood-donation
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
NODE_ENV=development
```

3. Create admin user:
```bash
node seeder.js
```

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

The server will run on `http://localhost:5000`

## Default Admin Credentials

- **Email:** admin@blood.com
- **Password:** admin123

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user (donor/hospital)
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (Protected)
- `PUT /api/users/availability` - Update donor availability (Protected)

### Blood Requests
- `POST /api/requests/create` - Create blood request (Hospital)
- `GET /api/requests/my` - Get hospital's requests (Hospital)
- `GET /api/requests/available` - Get available requests (Donor)
- `PUT /api/requests/update-status/:id` - Update request status (Protected)
- `GET /api/requests/donation-history` - Get donation history (Donor)

### Events
- `GET /api/events` - Get all events (Public)
- `POST /api/events` - Create event (Admin)
- `PUT /api/events/:id` - Update event (Admin)
- `DELETE /api/events/:id` - Delete event (Admin)
- `POST /api/events/:id/register` - Register for event (Donor)

### Admin
- `GET /api/admin/users` - Get all donors (Admin)
- `GET /api/admin/hospitals` - Get all hospitals (Admin)
- `GET /api/admin/requests` - Get all requests (Admin)
- `DELETE /api/admin/users/:id` - Delete user (Admin)
- `GET /api/admin/statistics` - Get system statistics (Admin)

## Database Models

### User
- name, email, password, age, role, phone, bloodGroup, location, isAvailable

### Request
- donor, hospital, bloodGroup, status, urgency, message

### Event
- title, description, location, date

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Role-based authorization middleware
- Protected routes with authentication middleware

## Error Handling

Centralized error handling with custom error middleware.

## Author

Blood Donation Management System Team

## License

ISC
