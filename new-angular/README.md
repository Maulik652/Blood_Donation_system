# Blood Donation Management System

A comprehensive full-stack web application for managing blood donations, connecting donors with hospitals, and organizing donation events.

## 🔎 Current Verification Status (February 26, 2026)

- ✅ Backend installs, starts, and connects to MongoDB successfully.
- ✅ Backend public endpoints respond correctly (`GET /` and `GET /api/events` returned `200`).
- ✅ Frontend installs and builds successfully (`ng build`).
- ✅ Frontend dev server runs and serves app successfully (`http://localhost:4200` returned `200`).
- ✅ Frontend test configuration fixed and headless tests execute successfully (`1/1` passing smoke test).

## 🩸 Features

### For Guests
- Browse blood donation information
- View upcoming events
- Register as a donor or hospital
- Access contact information

### For Donors
- Create and manage profile
- Toggle availability status
- View blood requests matching their blood group
- Accept or reject donation requests
- Track donation history
- Register for donation events

### For Hospitals
- Create blood requests with urgency levels
- Manage all created requests
- View donors who accepted requests
- Track request statuses

### For Admins
- Dashboard with system statistics
- Manage all users (donors and hospitals)
- View all blood requests
- Create, edit, and delete events
- Delete users

## 🚀 Tech Stack

### Frontend
- Angular 17 (Standalone Components)
- TypeScript
- RxJS
- Angular Router
- Angular HttpClient

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (running locally or connection string)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/blood-donation
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=30d
NODE_ENV=development
```

4. Create admin user:
```bash
node seeder.js
```

5. Start the server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL in `src/environments/environment.ts` if needed

4. Start development server:
```bash
npm start
```

Frontend will run on `http://localhost:4200`

## 🔑 Default Admin Credentials

- **Email:** admin@blood.com
- **Password:** admin123

## 📡 API Endpoints

### Authentication
- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get profile
- `PUT /api/users/availability` - Update availability

### Blood Requests
- `POST /api/requests/create` - Create request
- `GET /api/requests/my` - Get hospital requests
- `GET /api/requests/available` - Get available requests
- `PUT /api/requests/update-status/:id` - Update status
- `GET /api/requests/donation-history` - Get history

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/register` - Register for event

### Admin
- `GET /api/admin/users` - Get all donors
- `GET /api/admin/hospitals` - Get hospitals
- `GET /api/admin/requests` - Get all requests
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/statistics` - Get statistics

## 🎨 Design

### Color Palette
- **Primary:** #e53935 (Red)
- **Secondary:** #ffffff (White)
- **Accent:** #1976d2 (Blue)
- **Font:** Poppins

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based authorization
- Protected API routes
- HTTP-only approach for sensitive operations

## 👥 User Roles

1. **Guest** - Browse public pages, register/login
2. **Donor (user)** - Manage donations and requests
3. **Hospital** - Create and manage blood requests
4. **Admin** - Full system management

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Mobile phones
- Tablets
- Desktops
- Large screens

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm start
```

## 🏗️ Project Structure

```
blood-donation-system/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   └── models/
│   │   ├── environments/
│   │   └── styles.css
│   ├── angular.json
│   └── package.json
└── backend/
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── server.js
    ├── seeder.js
    └── package.json
```

## 🧪 Testing

### Backend Checks
```bash
cd backend
npm install
npm start
```

> Note: No automated backend test script is currently defined in `backend/package.json`.

### Frontend Checks
```bash
cd frontend
npm run build
npm test
```

## 📄 License

ISC

## 👨‍💻 Author

Blood Donation Management System Team

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## ⭐ Support

Give a ⭐️ if this project helped you!

---

**Note:** This is a complete production-ready application with best practices for security, architecture, and user experience.
