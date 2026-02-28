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
  monthlyDonations: { label: string; count: number; height: number }[] = [];

  stats = {
    totalDonations: 0,
    completedRequests: 0,
    livesSaved: 0,
    eligibilityDaysLeft: 0,
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
        this.stats.completedRequests = (history.requests || []).filter((item) => item.status === 'completed').length;
        this.stats.livesSaved = (profile.user.totalDonations || 0) * 3;
        this.stats.eligibilityDaysLeft = this.getRemainingDays();
        this.availableRequests = available.requests || [];
        this.donationHistory = history.requests || [];
        this.monthlyDonations = this.buildMonthlyDonations(this.donationHistory);
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

  getLastDonationDate(): string {
    if (!this.user?.lastDonationDate) {
      return 'No donations yet';
    }

    return new Date(this.user.lastDonationDate).toLocaleDateString();
  }

  getEligibilityProgress(): number {
    if (!this.user?.lastDonationDate) {
      return 100;
    }

    const elapsedDays = 90 - this.getRemainingDays();
    return Math.max(0, Math.min(100, Math.round((elapsedDays / 90) * 100)));
  }

  private buildMonthlyDonations(history: Request[]): { label: string; count: number; height: number }[] {
    const months: { label: string; count: number; height: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: month.toLocaleDateString(undefined, { month: 'short' }),
        count: 0,
        height: 16,
      });
    }

    history.forEach((item) => {
      const rawDate = item.completedAt || item.updatedAt || item.createdAt;
      if (!rawDate) {
        return;
      }

      const date = new Date(rawDate);
      const label = date.toLocaleDateString(undefined, { month: 'short' });
      const monthEntry = months.find((month) => month.label === label);

      if (monthEntry && item.status === 'completed') {
        monthEntry.count += 1;
      }
    });

    const max = Math.max(...months.map((month) => month.count), 1);

    return months.map((month) => ({
      ...month,
      height: Math.max(16, Math.round((month.count / max) * 130)),
    }));
  }
}