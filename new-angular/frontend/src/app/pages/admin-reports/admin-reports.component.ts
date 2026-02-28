import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AdminService } from '../../services/admin.service';
import { Request } from '../../models/request.model';

interface StatusPoint {
  label: string;
  count: number;
  width: number;
  css: string;
}

interface BloodGroupPoint {
  group: string;
  count: number;
}

interface HospitalPoint {
  name: string;
  count: number;
}

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-reports.component.html',
  styleUrls: ['./admin-reports.component.css']
})
export class AdminReportsComponent implements OnInit {
  isLoading = true;
  errorMessage = '';
  generatedAt = new Date();

  totalUsers = 0;
  totalDonors = 0;
  totalHospitals = 0;
  totalRequests = 0;
  acceptedRequests = 0;
  acceptanceRate = 0;

  statusSeries: StatusPoint[] = [];
  bloodGroupSeries: BloodGroupPoint[] = [];
  hospitalSeries: HospitalPoint[] = [];
  recentCriticalRequests: Request[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      stats: this.adminService.getStatistics(),
      requests: this.adminService.getAllRequests(1, 100),
    }).subscribe({
      next: ({ stats, requests }) => {
        this.totalUsers = stats.statistics?.totalUsers || 0;
        this.totalDonors = stats.statistics?.totalDonors || 0;
        this.totalHospitals = stats.statistics?.totalHospitals || 0;
        this.totalRequests = stats.statistics?.totalRequests || 0;
        this.acceptedRequests = stats.statistics?.acceptedRequests || 0;

        this.acceptanceRate = this.totalRequests > 0
          ? Math.round((this.acceptedRequests / this.totalRequests) * 100)
          : 0;

        const requestItems = requests.requests || [];
        this.statusSeries = this.buildStatusSeries(requestItems);
        this.bloodGroupSeries = this.buildBloodGroupSeries(requestItems);
        this.hospitalSeries = this.buildHospitalSeries(requestItems);
        this.recentCriticalRequests = this.buildRecentCritical(requestItems);
        this.generatedAt = new Date();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to load report data.';
        this.isLoading = false;
      }
    });
  }

  exportCsv(): void {
    const rows: string[] = [];

    rows.push('Metric,Value');
    rows.push(`Total Users,${this.totalUsers}`);
    rows.push(`Total Donors,${this.totalDonors}`);
    rows.push(`Total Hospitals,${this.totalHospitals}`);
    rows.push(`Total Requests,${this.totalRequests}`);
    rows.push(`Accepted Requests,${this.acceptedRequests}`);
    rows.push(`Acceptance Rate,${this.acceptanceRate}%`);
    rows.push('');

    rows.push('Status,Count');
    this.statusSeries.forEach((point) => rows.push(`${point.label},${point.count}`));
    rows.push('');

    rows.push('Blood Group,Count');
    this.bloodGroupSeries.forEach((point) => rows.push(`${point.group},${point.count}`));
    rows.push('');

    rows.push('Hospital,Request Count');
    this.hospitalSeries.forEach((point) => rows.push(`"${point.name}",${point.count}`));

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `bloodconnect-report-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private buildStatusSeries(items: Request[]): StatusPoint[] {
    const statuses: Array<{ label: 'pending' | 'accepted' | 'rejected' | 'completed'; css: string }> = [
      { label: 'pending', css: 'pending' },
      { label: 'accepted', css: 'accepted' },
      { label: 'rejected', css: 'rejected' },
      { label: 'completed', css: 'completed' },
    ];

    const countMap = new Map<string, number>();
    statuses.forEach((entry) => countMap.set(entry.label, 0));

    items.forEach((request) => {
      countMap.set(request.status, (countMap.get(request.status) || 0) + 1);
    });

    const max = Math.max(...statuses.map((entry) => countMap.get(entry.label) || 0), 1);

    return statuses.map((entry) => {
      const count = countMap.get(entry.label) || 0;
      return {
        label: entry.label,
        count,
        width: Math.max(6, Math.round((count / max) * 100)),
        css: entry.css,
      };
    });
  }

  private buildBloodGroupSeries(items: Request[]): BloodGroupPoint[] {
    const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const countMap = new Map<string, number>();

    groups.forEach((group) => countMap.set(group, 0));

    items.forEach((request) => {
      countMap.set(request.bloodGroup, (countMap.get(request.bloodGroup) || 0) + 1);
    });

    return groups
      .map((group) => ({ group, count: countMap.get(group) || 0 }))
      .filter((point) => point.count > 0)
      .sort((a, b) => b.count - a.count);
  }

  private buildHospitalSeries(items: Request[]): HospitalPoint[] {
    const map = new Map<string, number>();

    items.forEach((request) => {
      const name = request.hospital?.name || 'Unknown Hospital';
      map.set(name, (map.get(name) || 0) + 1);
    });

    return [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }

  private buildRecentCritical(items: Request[]): Request[] {
    return items
      .filter((request) => (request.urgency || '').toLowerCase() === 'critical')
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, 6);
  }
}
