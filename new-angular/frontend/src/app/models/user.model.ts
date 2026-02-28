export interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  age: number;
  role: 'user' | 'donor' | 'hospital' | 'admin';
  hospitalApproved?: boolean;
  phone: string;
  bloodGroup: string;
  location: string;
  isAvailable?: boolean;
  totalDonations?: number;
  lastDonationDate?: string; // for donor eligibility
  createdAt?: string;
  updatedAt?: string;
}

// Response from backend after login/register
export interface AuthResponse {
  success: boolean;
  token?: string;
  csrfToken?: string;
  user: User;
  message?: string;
}

// Login form data
export interface LoginCredentials {
  email: string;
  password: string;
}

// Register form data
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  age: number;
  role: 'user' | 'donor' | 'hospital';
  phone: string;
  bloodGroup: string;
  location: string;
}