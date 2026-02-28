import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { User } from '../../models/user.model';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

@Component({
  selector: 'app-admin-hospitals',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-hospitals.component.html',
  styleUrls: ['./admin-hospitals.component.css']
})
export class AdminHospitalsComponent implements OnInit {
  hospitals: User[] = [];
  filteredHospitals: User[] = [];
  searchTerm = '';
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  pagination: PaginationState = { page: 1, limit: 20, total: 0, totalPages: 1 };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadHospitals();
  }

  loadHospitals(): void {
    this.isLoading = true;
    this.adminService.getAllHospitals(this.pagination.page, this.pagination.limit).subscribe({
      next: (response) => {
        this.hospitals = response.hospitals || [];
        this.pagination = response.pagination || this.pagination;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to load hospitals.';
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredHospitals = [...this.hospitals];
      return;
    }

    this.filteredHospitals = this.hospitals.filter((hospital) => {
      return (
        hospital.name.toLowerCase().includes(term) ||
        hospital.email.toLowerCase().includes(term) ||
        hospital.location.toLowerCase().includes(term)
      );
    });
  }

  approveHospital(hospitalId: string): void {
    this.adminService.approveHospital(hospitalId).subscribe({
      next: () => {
        this.successMessage = 'Hospital approved successfully.';
        this.loadHospitals();
        setTimeout(() => (this.successMessage = ''), 2800);
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to approve hospital.';
        setTimeout(() => (this.errorMessage = ''), 3000);
      }
    });
  }

  deleteHospital(hospitalId: string): void {
    if (!confirm('Delete this hospital account?')) {
      return;
    }

    this.adminService.deleteUser(hospitalId).subscribe({
      next: () => {
        this.successMessage = 'Hospital deleted successfully.';
        this.loadHospitals();
        setTimeout(() => (this.successMessage = ''), 2800);
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to delete hospital.';
        setTimeout(() => (this.errorMessage = ''), 3000);
      }
    });
  }

  changePage(nextPage: number): void {
    if (nextPage < 1 || nextPage > this.pagination.totalPages) {
      return;
    }

    this.pagination = { ...this.pagination, page: nextPage };
    this.loadHospitals();
  }

  get approvedCount(): number {
    return this.hospitals.filter((hospital) => hospital.hospitalApproved).length;
  }

  get pendingCount(): number {
    return this.hospitals.filter((hospital) => !hospital.hospitalApproved).length;
  }
}
