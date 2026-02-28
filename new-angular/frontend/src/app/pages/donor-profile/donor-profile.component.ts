import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-donor-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './donor-profile.component.html',
  styleUrls: ['./donor-profile.component.css']
})
export class DonorProfileComponent implements OnInit {
  user: User | null = null;
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.authService.getProfile(true).subscribe({
      next: (response) => {
        this.user = response.user;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Unable to load donor profile.';
        this.isLoading = false;
      }
    });
  }

  toggleAvailability(): void {
    if (!this.user || this.isSaving) {
      return;
    }

    this.isSaving = true;
    const nextStatus = !this.user.isAvailable;

    this.authService.updateAvailability(nextStatus).subscribe({
      next: (response) => {
        this.user = response.user;
        this.successMessage = `Availability updated to ${nextStatus ? 'Available' : 'Unavailable'}.`;
        this.isSaving = false;
        setTimeout(() => (this.successMessage = ''), 2800);
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to update availability.';
        this.isSaving = false;
        setTimeout(() => (this.errorMessage = ''), 3200);
      }
    });
  }

  get eligibility(): string {
    if (!this.user?.lastDonationDate) {
      return 'Eligible Now';
    }

    const last = new Date(this.user.lastDonationDate);
    const days = Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24));
    return days >= 90 ? 'Eligible Now' : `Eligible in ${90 - days} day(s)`;
  }
}
