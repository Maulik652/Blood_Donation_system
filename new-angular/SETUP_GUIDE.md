# Blood Donation Management System - Setup Guide

## Quick Start Guide

### Step 1: Install Prerequisites

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **MongoDB**
   - Option A: Install MongoDB locally from https://www.mongodb.com/try/download/community
   - Option B: Use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

3. **Angular CLI**
   ```bash
   npm install -g @angular/cli
   ```

### Step 2: Setup Backend

1. Open terminal in project root and navigate to backend:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create/verify `.env` file exists with these settings:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/blood-donation
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```

4. Start MongoDB (if running locally):
   - Windows: MongoDB service should start automatically
   - Mac: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

5. Create admin user:
   ```bash
   node seedAdmin.js
   ```
   You should see: "Admin user created successfully"

6. Start backend server:
   ```bash
   npm run dev
   ```
   You should see: "Server running on port 5000" and "MongoDB Connected"

### Step 3: Setup Frontend

1. Open a NEW terminal window

2. Navigate to frontend:
   ```bash
   cd frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start Angular development server:
   ```bash
   npm start
   ```
   or
   ```bash
   ng serve
   ```

5. Open browser and go to: `http://localhost:4200`

### Step 4: Test the Application

1. **Test Admin Login**:
   - Click "Login" in navbar
   - Email: `admin@blood.com`
   - Password: `admin123`
   - You should be redirected to Admin Dashboard

2. **Register as Donor**:
   - Logout from admin
   - Click "Register"
   - Fill form with role "Donor"
   - Submit and you'll be redirected to Donor Dashboard

3. **Register as Hospital**:
   - Logout
   - Click "Register"
   - Fill form with role "Hospital"
   - Submit and you'll be redirected to Hospital Dashboard

4. **Test Blood Request Flow**:
   - Login as Hospital
   - Create a blood request
   - Logout and login as Donor
   - You should see the request in "Available Requests"
   - Accept the request
   - Logout and login as Hospital again
   - You should see donor details in your request

## Troubleshooting

### Backend Issues

**MongoDB Connection Error**:
```
Solution: Make sure MongoDB is running
- Check if MongoDB service is active
- Verify MONGO_URI in .env file
- Try: mongodb://127.0.0.1:27017/blood-donation
```

**Port Already in Use**:
```
Solution: Change PORT in .env file to 5001 or another available port
Also update apiUrl in frontend/src/environments/environment.ts
```

**Admin Seed Error**:
```
Solution: Drop the database and try again
mongo
> use blood-donation
> db.dropDatabase()
> exit
Then run: node seedAdmin.js
```

### Frontend Issues

**Port 4200 Already in Use**:
```
Solution: Run with different port
ng serve --port 4201
```

**API Connection Error**:
```
Solution: Check backend is running on port 5000
Verify environment.ts has correct apiUrl: 'http://localhost:5000/api'
```

**Module Not Found**:
```
Solution: Delete node_modules and reinstall
rm -rf node_modules
npm install
```

## Project URLs

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/

## Default Credentials

### Admin
- Email: `admin@blood.com`
- Password: `admin123`

### Test Donors/Hospitals
Create your own through registration form

## Common Commands

### Backend
```bash
# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Start production server
npm start

# Seed admin user
node seedAdmin.js
```

### Frontend
```bash
# Install dependencies
npm install

# Start development server
npm start
# or
ng serve

# Build for production
ng build --configuration production

# Run tests
ng test
```

## Features to Test

1. **Guest Features**:
   - ✓ View Home page
   - ✓ View About page
   - ✓ View Events page
   - ✓ View Contact page
   - ✓ Register as Donor/Hospital
   - ✓ Login

2. **Donor Features**:
   - ✓ View profile
   - ✓ Toggle availability
   - ✓ View blood requests
   - ✓ Accept/Reject requests
   - ✓ View donation history

3. **Hospital Features**:
   - ✓ View profile
   - ✓ Create blood request
   - ✓ View my requests
   - ✓ Track request status
   - ✓ View accepted donor details

4. **Admin Features**:
   - ✓ View statistics
   - ✓ Manage donors
   - ✓ Manage hospitals
   - ✓ View all requests
   - ✓ Create/Edit/Delete events
   - ✓ Delete users

## MongoDB Compass (Optional)

For visual database management, download MongoDB Compass:
1. Download from: https://www.mongodb.com/products/compass
2. Connect to: `mongodb://localhost:27017`
3. Select database: `blood-donation`
4. View collections: `users`, `requests`, `events`

## Next Steps

After successful setup:

1. **Customize**: 
   - Update JWT_SECRET in .env
   - Change admin credentials
   - Update contact information

2. **Deploy**:
   - Frontend: Vercel, Netlify, or Azure
   - Backend: Heroku, Railway, or DigitalOcean
   - Database: MongoDB Atlas

3. **Enhance**:
   - Add email notifications
   - Implement blood bank inventory
   - Add SMS alerts for urgent requests
   - Integrate maps for location
   - Add analytics dashboard

## Need Help?

If you encounter any issues:
1. Check this guide thoroughly
2. Verify all prerequisites are installed
3. Ensure both frontend and backend are running
4. Check browser console and terminal for errors
5. Make sure MongoDB is running

Happy Coding! 🩸
