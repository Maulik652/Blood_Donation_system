import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { Event } from '../../models/event.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-donor-donate',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './donor-donate.component.html',
  styleUrls: ['./donor-donate.component.css']
})
export class DonorDonateComponent implements OnInit {
  user: User | null = null;
  events: Event[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  constructor(
    private eventService: EventService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      profile: this.authService.getProfile(),
      events: this.eventService.getAllEvents(),
    }).subscribe({
      next: ({ profile, events }) => {
        this.user = profile.user;
        this.events = (events.events || [])
          .filter((event) => (event.status || 'scheduled') !== 'ended')
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Unable to load donation events.';
        this.isLoading = false;
      }
    });
  }

  register(eventId: string): void {
    this.eventService.registerForEvent(eventId).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Registered successfully.';
        setTimeout(() => (this.successMessage = ''), 2800);
        this.loadData();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Registration failed.';
        setTimeout(() => (this.errorMessage = ''), 3200);
      }
    });
  }

  canRegister(event: Event): boolean {
    const status = event.status || 'scheduled';
    const openStatus = status === 'scheduled' || status === 'postponed';
    const hasSpace = (event.registeredCount || 0) < (event.capacity || 0);
    return openStatus && hasSpace && this.isEligible;
  }

  get isEligible(): boolean {
    if (!this.user?.lastDonationDate) {
      return true;
    }

    const last = new Date(this.user.lastDonationDate);
    const days = Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24));
    return days >= 90;
  }

  get daysLeft(): number {
    if (!this.user?.lastDonationDate) {
      return 0;
    }

    const last = new Date(this.user.lastDonationDate);
    const days = Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(90 - days, 0);
  }
}
