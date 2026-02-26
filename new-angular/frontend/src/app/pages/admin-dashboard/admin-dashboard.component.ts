import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { Request } from '../../models/request.model';
import { Event, CreateEventData } from '../../models/event.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  activeTab: 'overview' | 'donors' | 'hospitals' | 'requests' | 'events' = 'overview';
  
  statistics = {
    totalDonors: 0,
    totalHospitals: 0,
    totalRequests: 0,
    acceptedRequests: 0
  };

  donors: User[] = [];
  hospitals: User[] = [];
  requests: Request[] = [];
  events: Event[] = [];
  currentAdmin: User | null = null;

  showEventForm = false;
  editingEvent: Event | null = null;
  
  eventForm = this.formBuilder.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
    location: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    date: ['', [Validators.required]],
  });

  errorMessage = '';
  successMessage = '';
  isLoading = true;
  isSavingEvent = false;

  constructor(
    private formBuilder: FormBuilder,
    private adminService: AdminService,
    private eventService: EventService,
    private authService: AuthService
  ) {}

  get ef() {
    return this.eventForm.controls;
  }

  ngOnInit(): void {
    this.currentAdmin = this.authService.getCurrentUser();
    this.loadStatistics();
    this.loadAllData();
  }

  loadStatistics(): void {
    this.adminService.getStatistics().subscribe({
      next: (response) => {
        this.statistics = response.statistics || this.statistics;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load system statistics.';
      }
    });
  }

  loadAllData(): void {
    this.isLoading = true;

    forkJoin({
      donors: this.adminService.getAllUsers(),
      hospitals: this.adminService.getAllHospitals(),
      requests: this.adminService.getAllRequests(),
      events: this.eventService.getAllEvents(),
    }).subscribe({
      next: ({ donors, hospitals, requests, events }) => {
        this.donors = donors.users || [];
        this.hospitals = hospitals.hospitals || [];
        this.requests = requests.requests || [];
        this.events = events.events || [];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to load admin dashboard data.';
        this.isLoading = false;
      }
    });
  }

  loadDonors(): void {
    this.adminService.getAllUsers().subscribe({
      next: (response) => {
        this.donors = response.users || [];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load donors';
        this.isLoading = false;
      }
    });
  }

  loadHospitals(): void {
    this.adminService.getAllHospitals().subscribe({
      next: (response) => {
        this.hospitals = response.hospitals || [];
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load hospitals.';
      }
    });
  }

  loadRequests(): void {
    this.adminService.getAllRequests().subscribe({
      next: (response) => {
        this.requests = response.requests || [];
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load requests.';
      }
    });
  }

  loadEvents(): void {
    this.eventService.getAllEvents().subscribe({
      next: (response) => {
        this.events = response.events || [];
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load events.';
      }
    });
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.successMessage = 'User deleted successfully';
          this.loadDonors();
          this.loadHospitals();
          this.loadStatistics();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete user';
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
    }
  }

  toggleEventForm(): void {
    this.showEventForm = !this.showEventForm;
    if (!this.showEventForm) {
      this.resetEventForm();
    }
  }

  resetEventForm(): void {
    this.eventForm.reset({
      title: '',
      description: '',
      location: '',
      date: ''
    });
    this.editingEvent = null;
  }

  editEvent(event: Event): void {
    this.editingEvent = event;
    this.eventForm.patchValue({
      title: event.title,
      description: event.description,
      location: event.location,
      date: typeof event.date === 'string' ? event.date.slice(0, 16) : new Date(event.date).toISOString().slice(0, 16)
    });
    this.showEventForm = true;
  }

  saveEvent(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      this.errorMessage = 'Please fix validation errors before saving the event.';
      return;
    }

    if (this.isSavingEvent) {
      return;
    }

    this.isSavingEvent = true;
    const payload: CreateEventData = {
      title: this.ef.title.value?.trim() || '',
      description: this.ef.description.value?.trim() || '',
      location: this.ef.location.value?.trim() || '',
      date: this.ef.date.value || '',
    };

    if (this.editingEvent) {
      this.eventService.updateEvent(this.editingEvent._id!, payload).subscribe({
        next: () => {
          this.isSavingEvent = false;
          this.successMessage = 'Event updated successfully';
          this.loadEvents();
          this.resetEventForm();
          this.showEventForm = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.isSavingEvent = false;
          this.errorMessage = error.error?.message || 'Failed to update event';
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
    } else {
      this.eventService.createEvent(payload).subscribe({
        next: () => {
          this.isSavingEvent = false;
          this.successMessage = 'Event created successfully';
          this.loadEvents();
          this.resetEventForm();
          this.showEventForm = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.isSavingEvent = false;
          this.errorMessage = error.error?.message || 'Failed to create event';
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
    }
  }

  deleteEvent(eventId: string): void {
    if (confirm('Are you sure you want to delete this event?')) {
      this.eventService.deleteEvent(eventId).subscribe({
        next: () => {
          this.successMessage = 'Event deleted successfully';
          this.loadEvents();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete event';
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
    }
  }

  setActiveTab(tab: 'overview' | 'donors' | 'hospitals' | 'requests' | 'events'): void {
    this.activeTab = tab;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'accepted': return 'badge-success';
      case 'rejected': return 'badge-danger';
      case 'completed': return 'badge-info';
      case 'pending': return 'badge-warning';
      default: return 'badge-info';
    }
  }

  get pendingRequestsCount(): number {
    return this.requests.filter((request) => request.status === 'pending').length;
  }

  get criticalRequestsCount(): number {
    return this.requests.filter((request) => request.urgency === 'Critical').length;
  }

  get systemState(): string {
    if (this.criticalRequestsCount > 0) return 'High Alert';
    if (this.pendingRequestsCount > 0) return 'Needs Attention';
    return 'Stable';
  }
}
