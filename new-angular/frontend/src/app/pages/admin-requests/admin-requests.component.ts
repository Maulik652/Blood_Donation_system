import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Request } from '../../models/request.model';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-requests.component.html',
  styleUrls: ['./admin-requests.component.css']
})
export class AdminRequestsComponent implements OnInit {
  requests: Request[] = [];
  filteredRequests: Request[] = [];
  searchTerm = '';
  selectedStatus = 'all';
  selectedUrgency = 'all';
  isLoading = true;
  errorMessage = '';

  pagination: PaginationState = { page: 1, limit: 20, total: 0, totalPages: 1 };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading = true;
    this.adminService.getAllRequests(this.pagination.page, this.pagination.limit).subscribe({
      next: (response) => {
        this.requests = response.requests || [];
        this.pagination = response.pagination || this.pagination;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to load requests.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredRequests = this.requests.filter((request) => {
      const requestUrgency = (request.urgency || '').toLowerCase();
      const hospitalName = request.hospital?.name?.toLowerCase() || '';
      const donorName = request.donor?.name?.toLowerCase() || '';
      const blood = request.bloodGroup.toLowerCase();

      const matchesText =
        !term ||
        hospitalName.includes(term) ||
        donorName.includes(term) ||
        blood.includes(term);

      const matchesStatus = this.selectedStatus === 'all' || request.status === this.selectedStatus;
      const matchesUrgency = this.selectedUrgency === 'all' || requestUrgency === this.selectedUrgency;

      return matchesText && matchesStatus && matchesUrgency;
    });
  }

  changePage(nextPage: number): void {
    if (nextPage < 1 || nextPage > this.pagination.totalPages) {
      return;
    }

    this.pagination = { ...this.pagination, page: nextPage };
    this.loadRequests();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'accepted':
        return 'badge-success';
      case 'rejected':
        return 'badge-danger';
      case 'completed':
        return 'badge-info';
      case 'pending':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  }

  get pendingCount(): number {
    return this.requests.filter((request) => request.status === 'pending').length;
  }

  get criticalCount(): number {
    return this.requests.filter((request) => (request.urgency || '').toLowerCase() === 'critical').length;
  }

  get completedCount(): number {
    return this.requests.filter((request) => request.status === 'completed').length;
  }
}
