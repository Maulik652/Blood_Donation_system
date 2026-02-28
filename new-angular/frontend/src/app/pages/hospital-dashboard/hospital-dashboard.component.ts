import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RequestService } from '../../services/request.service';
import { Request } from '../../models/request.model';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-hospital-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './hospital-dashboard.component.html',
  styleUrls: ['./hospital-dashboard.component.css']
})
export class HospitalDashboardComponent implements OnInit {

  requests: Request[] = [];
  profile: User | null = null;

  stats = {
    totalDonors: 0,
    active: 0,
    critical: 0
  };

  inventorySnapshot: { bloodGroup: string; units: number }[] = [];

  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  requestForm = this.formBuilder.group({
    bloodGroup: ['', [Validators.required]],
    urgency: ['Medium', [Validators.required]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
  });

  successMessage = '';
  errorMessage = '';
  isSubmitting = false;
  isLoading = true;

  constructor(
    private formBuilder: FormBuilder,
    private requestService: RequestService,
    private authService: AuthService
  ) {}

  get rf() {
    return this.requestForm.controls;
  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadRequests();
  }

  loadProfile(): void {
    this.authService.getProfile().subscribe({
      next: (response) => {
        this.profile = response.user;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Unable to load hospital profile.';
      }
    });
  }

  loadRequests(): void {
    this.isLoading = true;
    this.requestService.getMyRequests().subscribe({
      next: (res) => {
        this.requests = res.requests || [];
        this.calculateStats();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load requests. Please try again.';
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    const donors = new Set(
      this.requests
        .filter((request) => !!request.donor?._id)
        .map((request) => request.donor!._id)
    );

    this.stats.totalDonors = donors.size;
    this.stats.active = this.requests.filter(r => r.status !== 'completed').length;

    this.stats.critical = this.requests.filter(
      r => r.urgency === 'Critical' && r.status !== 'completed'
    ).length;

    this.inventorySnapshot = this.getInventorySnapshot();
  }

  private getInventorySnapshot(): { bloodGroup: string; units: number }[] {
    const inventoryMap = new Map<string, number>();

    this.bloodGroups.forEach((group) => inventoryMap.set(group, 0));

    this.requests.forEach((request) => {
      if (request.status === 'completed') {
        const current = inventoryMap.get(request.bloodGroup) || 0;
        inventoryMap.set(request.bloodGroup, current + 1);
      }
    });

    return this.bloodGroups.map((group) => ({
      bloodGroup: group,
      units: inventoryMap.get(group) || 0,
    }));
  }

  createRequest(): void {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      this.errorMessage = 'Please correct validation errors before creating a request.';
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    this.errorMessage = '';
    const payload = {
      bloodGroup: this.rf.bloodGroup.value || '',
      urgency: this.rf.urgency.value || 'Medium',
      message: this.rf.message.value?.trim() || '',
    };

    this.requestService.createRequest(payload).subscribe({
      next: () => {
        this.requestForm.reset({
          bloodGroup: '',
          urgency: 'Medium',
          message: ''
        });
        this.successMessage = 'Blood request created successfully.';
        this.isSubmitting = false;
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
        this.loadRequests();
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || 'Failed to create request. Please try again.';
      }
    });
  }

  completeRequest(id: string): void {

    this.requestService.updateRequestStatus(id, 'completed')
      .subscribe(() => {
        this.successMessage = 'Request marked as completed.';
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
        this.loadRequests();
      }, () => {
        this.errorMessage = 'Failed to update request status.';
      });
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'status-info';
      case 'accepted':
        return 'status-success';
      case 'rejected':
        return 'status-danger';
      default:
        return 'status-warning';
    }
  }

  get activeRequests(): Request[] {
    return this.requests.filter((request) => request.status !== 'completed');
  }

  get completedRequests(): Request[] {
    return this.requests.filter((request) => request.status === 'completed');
  }
}