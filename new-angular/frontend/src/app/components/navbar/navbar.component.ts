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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.userSubscription = this.authService.currentUser$.subscribe(user => {

      this.isLoggedIn = this.authService.isLoggedIn();
      this.userRole = this.authService.getUserRole();
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