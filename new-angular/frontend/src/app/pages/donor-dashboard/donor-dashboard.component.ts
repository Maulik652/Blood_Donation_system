import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RequestService } from '../../services/request.service';
import { User } from '../../models/user.model';
import { Request } from '../../models/request.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-donor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './donor-dashboard.component.html',
  styleUrls: ['./donor-dashboard.component.css']
})
export class DonorDashboardComponent implements OnInit {

  user: User | null = null;
  availableRequests: Request[] = [];
  donationHistory: Request[] = [];

  stats = {
    totalDonations: 0,
    livesSaved: 0,
    responseRate: 92
  };

  errorMessage = '';
  isLoading = true;

  constructor(
    private authService: AuthService,
    private requestService: RequestService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      profile: this.authService.getProfile(),
      available: this.requestService.getAvailableRequests(),
      history: this.requestService.getDonationHistory(),
    }).subscribe({
      next: ({ profile, available, history }) => {
        this.user = profile.user;
        this.stats.totalDonations = profile.user.totalDonations || 0;
        this.stats.livesSaved = (profile.user.totalDonations || 0) * 3;
        this.availableRequests = available.requests || [];
        this.donationHistory = history.requests || [];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Unable to load dashboard data.';
        this.isLoading = false;
      },
    });
  }

  toggleAvailability(): void {
    if (!this.user) return;

    const newStatus = !this.user.isAvailable;

    this.authService.updateAvailability(newStatus).subscribe({
      next: () => {
        if (this.user) this.user.isAvailable = newStatus;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to update availability.';
      }
    });
  }

  acceptRequest(id: string): void {
    this.requestService.updateRequestStatus(id, 'accepted').subscribe({
      next: () => {
        this.loadDashboard();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to accept request.';
      }
    });
  }

  rejectRequest(id: string): void {
    this.availableRequests = this.availableRequests.filter((request) => request._id !== id);
  }

  getEligibility(): boolean {
    if (!this.user?.lastDonationDate) return true;

    const last = new Date(this.user.lastDonationDate);
    const today = new Date();

    const diffDays = Math.floor(
      (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
    );

    return diffDays >= 90;
  }

  getRemainingDays(): number {
    if (!this.user?.lastDonationDate) return 0;

    const last = new Date(this.user.lastDonationDate);
    const today = new Date();

    const diffDays = Math.floor(
      (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
    );

    return Math.max(90 - diffDays, 0);
  }
}