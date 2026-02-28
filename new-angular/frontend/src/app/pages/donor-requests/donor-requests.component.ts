import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RequestService } from '../../services/request.service';
import { Request } from '../../models/request.model';

@Component({
  selector: 'app-donor-requests',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './donor-requests.component.html',
  styleUrls: ['./donor-requests.component.css']
})
export class DonorRequestsComponent implements OnInit {
  requests: Request[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  constructor(private requestService: RequestService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading = true;
    this.requestService.getAvailableRequests().subscribe({
      next: (response) => {
        this.requests = response.requests || [];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Unable to load available requests.';
        this.isLoading = false;
      }
    });
  }

  acceptRequest(requestId: string): void {
    this.requestService.updateRequestStatus(requestId, 'accepted').subscribe({
      next: () => {
        this.successMessage = 'Request accepted successfully.';
        setTimeout(() => (this.successMessage = ''), 2800);
        this.loadRequests();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to accept request.';
        setTimeout(() => (this.errorMessage = ''), 3200);
      }
    });
  }

  hideRequest(requestId: string): void {
    this.requests = this.requests.filter((request) => request._id !== requestId);
  }

  get criticalCount(): number {
    return this.requests.filter((request) => (request.urgency || '').toLowerCase() === 'critical').length;
  }
}
