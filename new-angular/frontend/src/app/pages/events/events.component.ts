import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { Event } from '../../models/event.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit, OnDestroy {
  events: Event[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  isLoggedIn = false;
  userRole: string | null = null;
  private authSubscription?: Subscription;

  constructor(
    private eventService: EventService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.currentUser$.subscribe((user) => {
      this.isLoggedIn = !!user;
      this.userRole = user?.role || null;
    });
    this.loadEvents();
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.eventService.getAllEvents().subscribe({
      next: (response) => {
        this.events = response.events || [];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load events';
        this.isLoading = false;
      }
    });
  }

  registerForEvent(eventId: string): void {
    if (!this.isLoggedIn) {
      this.errorMessage = 'Please login to register for events';
      return;
    }

    this.eventService.registerForEvent(eventId).subscribe({
      next: (response) => {
        this.successMessage = 'Successfully registered for the event!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to register for event';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }
}