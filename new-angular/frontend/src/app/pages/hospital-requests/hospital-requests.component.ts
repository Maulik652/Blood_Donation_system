import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RequestService } from '../../services/request.service';
import { Request } from '../../models/request.model';

@Component({
  selector: 'app-hospital-requests',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hospital-requests.component.html',
  styleUrls: ['./hospital-requests.component.css']
})
export class HospitalRequestsComponent implements OnInit {
  requests: Request[] = [];
  isLoading = true;
  successMessage = '';
  errorMessage = '';

  constructor(private requestService: RequestService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading = true;
    this.requestService.getMyRequests().subscribe({
      next: (response) => {
        this.requests = response.requests || [];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Unable to load hospital requests.';
        this.isLoading = false;
      }
    });
  }

  completeRequest(requestId: string): void {
    this.requestService.updateRequestStatus(requestId, 'completed').subscribe({
      next: () => {
        this.successMessage = 'Request marked as completed.';
        this.loadRequests();
        setTimeout(() => (this.successMessage = ''), 2800);
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to complete request.';
      }
    });
  }

  get activeRequests(): Request[] {
    return this.requests.filter((item) => item.status !== 'completed');
  }

  get completedRequests(): Request[] {
    return this.requests.filter((item) => item.status === 'completed');
  }
}
