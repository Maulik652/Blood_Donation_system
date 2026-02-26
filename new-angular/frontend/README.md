# Blood Donation Management System - Frontend

Modern, responsive Angular application for Blood Donation Management System.

## Features

- User Authentication (Login/Register)
- Role-based Dashboards (Donor, Hospital, Admin)
- Blood Request Management
- Event Management
- Responsive Design
- JWT Token Authentication
- Protected Routes with Guards

## Tech Stack

- **Angular 17** - Frontend Framework
- **TypeScript** - Programming Language
- **RxJS** - Reactive Programming
- **Angular Router** - Navigation
- **Angular HttpClient** - HTTP Communication

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure API URL:
Update `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

3. Start development server:
```bash
npm start
```

The application will run on `http://localhost:4200`

## Build

```bash
# Development build
npm run build

# Production build
npm run build --configuration production
```

## User Roles

### Guest
- View home, about, events, contact pages
- Register as donor or hospital
- Login

### Donor (user)
- View and update profile
- Toggle availability status
- View available blood requests
- Accept/Reject requests
- View donation history
- Register for events

### Hospital
- View and update profile
- Create blood requests
- View created requests
- Track request status
- View accepted donors

### Admin
- View system statistics
- Manage all users (donors & hospitals)
- View all blood requests
- Create, edit, delete events
- Delete users

## Default Admin Login

- **Email:** admin@blood.com
- **Password:** admin123

## Project Structure

```
src/
├── app/
│   ├── components/        # Shared components (Navbar, Footer)
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── guards/           # Route guards
│   ├── interceptors/     # HTTP interceptors
│   ├── models/           # TypeScript interfaces
│   ├── app.component.ts  # Root component
│   └── app.routes.ts     # Route configuration
├── environments/         # Environment configs
├── styles.css           # Global styles
└── main.ts              # Application entry point
```

## Pages

- **Home** - Hero section, statistics, information
- **About** - Mission, values, donation facts
- **Events** - Upcoming blood donation events
- **Contact** - Contact form and information
- **Login** - User authentication
- **Register** - User registration
- **Donor Dashboard** - Donor features and requests
- **Hospital Dashboard** - Create and manage requests
- **Admin Dashboard** - System management

## Styling

- **Primary Color:** #e53935 (Red)
- **Secondary Color:** #ffffff (White)
- **Accent Color:** #1976d2 (Blue)
- **Font:** Poppins

## Security

- JWT token stored in localStorage
- Protected routes with auth guard
- Role-based authorization
- HTTP interceptor for token injection

## Responsive Design

Fully responsive layout supporting:
- Mobile devices (< 768px)
- Tablets (768px - 1024px)
- Desktop (> 1024px)

## Author

Blood Donation Management System Team

## License

ISC
