import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { RequestService } from '../../services/request.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-hospital-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hospital-profile.component.html',
  styleUrls: ['./hospital-profile.component.css']
})
export class HospitalProfileComponent implements OnInit {
  profile: User | null = null;
  totalRequests = 0;
  completedRequests = 0;
  activeRequests = 0;
  isLoading = true;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private requestService: RequestService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    forkJoin({
      profile: this.authService.getProfile(true),
      requests: this.requestService.getMyRequests(),
    }).subscribe({
      next: ({ profile, requests }) => {
        this.profile = profile.user;
        const all = requests.requests || [];
        this.totalRequests = all.length;
        this.completedRequests = all.filter((item) => item.status === 'completed').length;
        this.activeRequests = all.filter((item) => item.status !== 'completed').length;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Unable to load hospital profile data.';
        this.isLoading = false;
      }
    });
  }
}
