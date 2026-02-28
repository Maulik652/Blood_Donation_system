import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { Request } from '../models/request.model';

interface AdminListUsersResponse {
  success: boolean;
  users: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface AdminListHospitalsResponse {
  success: boolean;
  hospitals: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface AdminListRequestsResponse {
  success: boolean;
  requests: Request[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface AdminStatsResponse {
  success: boolean;
  statistics: {
    totalUsers: number;
    totalDonors: number;
    totalHospitals: number;
    totalRequests: number;
    acceptedRequests: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllUsers(page = 1, limit = 20): Observable<AdminListUsersResponse> {
    return this.http.get<AdminListUsersResponse>(`${this.apiUrl}/admin/users?page=${page}&limit=${limit}`);
  }

  getAllHospitals(page = 1, limit = 20): Observable<AdminListHospitalsResponse> {
    return this.http.get<AdminListHospitalsResponse>(`${this.apiUrl}/admin/hospitals?page=${page}&limit=${limit}`);
  }

  getAllRequests(page = 1, limit = 20): Observable<AdminListRequestsResponse> {
    return this.http.get<AdminListRequestsResponse>(`${this.apiUrl}/admin/requests?page=${page}&limit=${limit}`);
  }

  deleteUser(userId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/admin/users/${userId}`);
  }

  approveHospital(hospitalId: string): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.apiUrl}/admin/hospitals/${hospitalId}/approve`, {});
  }

  getStatistics(): Observable<AdminStatsResponse> {
    return this.http.get<AdminStatsResponse>(`${this.apiUrl}/admin/statistics`);
  }
}
