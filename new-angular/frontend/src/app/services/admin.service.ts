import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { Request } from '../models/request.model';

interface AdminListUsersResponse {
  success: boolean;
  users: User[];
}

interface AdminListHospitalsResponse {
  success: boolean;
  hospitals: User[];
}

interface AdminListRequestsResponse {
  success: boolean;
  requests: Request[];
}

interface AdminStatsResponse {
  success: boolean;
  statistics: {
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

  getAllUsers(): Observable<AdminListUsersResponse> {
    return this.http.get<AdminListUsersResponse>(`${this.apiUrl}/admin/users`);
  }

  getAllHospitals(): Observable<AdminListHospitalsResponse> {
    return this.http.get<AdminListHospitalsResponse>(`${this.apiUrl}/admin/hospitals`);
  }

  getAllRequests(): Observable<AdminListRequestsResponse> {
    return this.http.get<AdminListRequestsResponse>(`${this.apiUrl}/admin/requests`);
  }

  deleteUser(userId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/admin/users/${userId}`);
  }

  getStatistics(): Observable<AdminStatsResponse> {
    return this.http.get<AdminStatsResponse>(`${this.apiUrl}/admin/statistics`);
  }
}
