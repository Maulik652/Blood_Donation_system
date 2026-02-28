import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'events',
    loadComponent: () => import('./pages/events/events.component').then(m => m.EventsComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'donor-dashboard',
    loadComponent: () => import('./pages/donor-dashboard/donor-dashboard.component').then(m => m.DonorDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['donor'] }
  },
  {
    path: 'donor/donate',
    loadComponent: () => import('./pages/donor-donate/donor-donate.component').then(m => m.DonorDonateComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['donor'] }
  },
  {
    path: 'donor/requests',
    loadComponent: () => import('./pages/donor-requests/donor-requests.component').then(m => m.DonorRequestsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['donor'] }
  },
  {
    path: 'donor/history',
    loadComponent: () => import('./pages/donor-history/donor-history.component').then(m => m.DonorHistoryComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['donor'] }
  },
  {
    path: 'donor/profile',
    loadComponent: () => import('./pages/donor-profile/donor-profile.component').then(m => m.DonorProfileComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['donor'] }
  },
  {
    path: 'hospital-dashboard',
    loadComponent: () => import('./pages/hospital-dashboard/hospital-dashboard.component').then(m => m.HospitalDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['hospital'] }
  },
  {
    path: 'hospital/create-request',
    loadComponent: () => import('./pages/hospital-create-request/hospital-create-request.component').then(m => m.HospitalCreateRequestComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['hospital'] }
  },
  {
    path: 'hospital/requests',
    loadComponent: () => import('./pages/hospital-requests/hospital-requests.component').then(m => m.HospitalRequestsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['hospital'] }
  },
  {
    path: 'hospital/inventory',
    loadComponent: () => import('./pages/hospital-inventory/hospital-inventory.component').then(m => m.HospitalInventoryComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['hospital'] }
  },
  {
    path: 'hospital/profile',
    loadComponent: () => import('./pages/hospital-profile/hospital-profile.component').then(m => m.HospitalProfileComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['hospital'] }
  },
  {
    path: 'admin-dashboard',
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./pages/admin-users/admin-users.component').then(m => m.AdminUsersComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/hospitals',
    loadComponent: () => import('./pages/admin-hospitals/admin-hospitals.component').then(m => m.AdminHospitalsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/requests',
    loadComponent: () => import('./pages/admin-requests/admin-requests.component').then(m => m.AdminRequestsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/reports',
    loadComponent: () => import('./pages/admin-reports/admin-reports.component').then(m => m.AdminReportsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: '**',
    redirectTo: ''
  }
];
