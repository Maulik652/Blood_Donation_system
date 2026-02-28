import { Component, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  isLoggedIn = false;
  userRole: string | null = null;
  userName: string = '';
  isMenuOpen = false;
  private userSubscription?: Subscription;

  dashboardRoute = '/';   // ✅ Required for polished HTML

  readonly menuConfig: Record<'guest' | 'donor' | 'hospital' | 'admin', { label: string; route: string }[]> = {
    guest: [
      { label: 'Home', route: '/home' },
      { label: 'About', route: '/about' },
      { label: 'Events', route: '/events' },
      { label: 'Contact', route: '/contact' },
    ],
    donor: [
      { label: 'Dashboard', route: '/donor-dashboard' },
      { label: 'Donate', route: '/donor/donate' },
      { label: 'Requests', route: '/donor/requests' },
      { label: 'History', route: '/donor/history' },
      { label: 'Profile', route: '/donor/profile' },
    ],
    hospital: [
      { label: 'Dashboard', route: '/hospital-dashboard' },
      { label: 'Create Request', route: '/hospital/create-request' },
      { label: 'Requests', route: '/hospital/requests' },
      { label: 'Inventory', route: '/hospital/inventory' },
      { label: 'Profile', route: '/hospital/profile' },
    ],
    admin: [
      { label: 'Dashboard', route: '/admin-dashboard' },
      { label: 'Users', route: '/admin/users' },
      { label: 'Hospitals', route: '/admin/hospitals' },
      { label: 'Requests', route: '/admin/requests' },
      { label: 'Reports', route: '/admin/reports' },
    ]
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.userSubscription = this.authService.currentUser$.subscribe(user => {

      this.isLoggedIn = this.authService.isLoggedIn();
      this.userRole = this.authService.getRole();
      this.userName = user?.name || '';

      this.setDashboardRoute();   // ✅ Centralized role logic
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  /* ✅ PROFESSIONAL ROLE CONTROL */
  private setDashboardRoute(): void {

    const ROLE_ROUTES: Record<string, string> = {

      donor: '/donor-dashboard',
      user: '/donor-dashboard',

      hospital: '/hospital-dashboard',

      admin: '/admin-dashboard'
    };

    this.dashboardRoute = ROLE_ROUTES[this.userRole!] || '/';
  }

  get navLinks(): { label: string; route: string }[] {
    const role = (this.userRole as 'guest' | 'donor' | 'hospital' | 'admin' | null) || 'guest';
    return this.menuConfig[role] || this.menuConfig.guest;
  }

  get displayIdentity(): string {
    if (this.userName) {
      return this.userName;
    }

    if (this.userRole === 'hospital') {
      return 'Hospital';
    }

    if (this.userRole === 'admin') {
      return 'Admin';
    }

    return 'Donor';
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
    this.closeMenu();
  }
}