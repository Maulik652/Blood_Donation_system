import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
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
    data: { roles: ['user'] }
  },
  {
    path: 'hospital-dashboard',
    loadComponent: () => import('./pages/hospital-dashboard/hospital-dashboard.component').then(m => m.HospitalDashboardComponent),
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
    path: '**',
    redirectTo: ''
  }
];
