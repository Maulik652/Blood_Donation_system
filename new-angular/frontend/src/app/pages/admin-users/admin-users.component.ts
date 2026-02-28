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
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm = '';
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  pagination: PaginationState = { page: 1, limit: 20, total: 0, totalPages: 1 };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.adminService.getAllUsers(this.pagination.page, this.pagination.limit).subscribe({
      next: (response) => {
        this.users = response.users || [];
        this.pagination = response.pagination || this.pagination;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to load users.';
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredUsers = [...this.users];
      return;
    }

    this.filteredUsers = this.users.filter((user) => {
      return (
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.location.toLowerCase().includes(term) ||
        user.bloodGroup.toLowerCase().includes(term)
      );
    });
  }

  deleteUser(userId: string): void {
    if (!confirm('Delete this user account?')) {
      return;
    }

    this.adminService.deleteUser(userId).subscribe({
      next: () => {
        this.successMessage = 'User deleted successfully.';
        this.loadUsers();
        setTimeout(() => (this.successMessage = ''), 2800);
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to delete user.';
        setTimeout(() => (this.errorMessage = ''), 3000);
      }
    });
  }

  changePage(nextPage: number): void {
    if (nextPage < 1 || nextPage > this.pagination.totalPages) {
      return;
    }

    this.pagination = { ...this.pagination, page: nextPage };
    this.loadUsers();
  }

  get availableUsersCount(): number {
    return this.users.filter((user) => user.isAvailable).length;
  }

  get unavailableUsersCount(): number {
    return this.users.filter((user) => !user.isAvailable).length;
  }
}
