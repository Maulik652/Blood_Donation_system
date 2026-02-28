import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RequestService } from '../../services/request.service';
import { Request } from '../../models/request.model';

@Component({
  selector: 'app-donor-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './donor-history.component.html',
  styleUrls: ['./donor-history.component.css']
})
export class DonorHistoryComponent implements OnInit {
  history: Request[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private requestService: RequestService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoading = true;
    this.requestService.getDonationHistory().subscribe({
      next: (response) => {
        this.history = (response.requests || []).sort(
          (a, b) => new Date(b.completedAt || b.updatedAt || b.createdAt || '').getTime() - new Date(a.completedAt || a.updatedAt || a.createdAt || '').getTime()
        );
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Unable to load donation history.';
        this.isLoading = false;
      }
    });
  }

  get totalCompleted(): number {
    return this.history.filter((item) => item.status === 'completed').length;
  }

  get livesImpacted(): number {
    return this.totalCompleted * 3;
  }
}
