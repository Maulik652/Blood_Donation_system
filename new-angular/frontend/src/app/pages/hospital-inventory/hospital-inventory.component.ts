import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RequestService } from '../../services/request.service';

@Component({
  selector: 'app-hospital-inventory',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hospital-inventory.component.html',
  styleUrls: ['./hospital-inventory.component.css']
})
export class HospitalInventoryComponent implements OnInit {
  inventory: { bloodGroup: string; units: number }[] = [];
  totalUnits = 0;
  completedRequests = 0;
  isLoading = true;
  errorMessage = '';

  constructor(private requestService: RequestService) {}

  ngOnInit(): void {
    this.loadInventory();
  }

  loadInventory(): void {
    this.isLoading = true;
    this.requestService.getHospitalInventory().subscribe({
      next: (response) => {
        this.inventory = response.inventory || [];
        this.totalUnits = response.summary?.totalUnits || 0;
        this.completedRequests = response.summary?.completedRequests || 0;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Unable to load inventory data.';
        this.isLoading = false;
      }
    });
  }

  get lowStockCount(): number {
    return this.inventory.filter((item) => item.units <= 1).length;
  }
}
