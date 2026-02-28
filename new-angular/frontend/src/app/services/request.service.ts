import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Request, CreateRequestData } from '../models/request.model';

interface RequestItemResponse {
  success: boolean;
  request: Request;
  message?: string;
}

interface RequestListResponse {
  success: boolean;
  requests: Request[];
}

interface HospitalInventoryResponse {
  success: boolean;
  inventory: { bloodGroup: string; units: number }[];
  summary: {
    totalUnits: number;
    completedRequests: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createRequest(data: CreateRequestData): Observable<RequestItemResponse> {
    return this.http.post<RequestItemResponse>(`${this.apiUrl}/requests/create`, data);
  }

  getMyRequests(): Observable<RequestListResponse> {
    return this.http.get<RequestListResponse>(`${this.apiUrl}/requests/my`);
  }

  getHospitalInventory(): Observable<HospitalInventoryResponse> {
    return this.http.get<HospitalInventoryResponse>(`${this.apiUrl}/requests/inventory`);
  }

  getAvailableRequests(): Observable<RequestListResponse> {
    return this.http.get<RequestListResponse>(`${this.apiUrl}/requests/available`);
  }

  updateRequestStatus(requestId: string, status: string): Observable<RequestItemResponse> {
    return this.http.put<RequestItemResponse>(`${this.apiUrl}/requests/${requestId}/status`, {
      status
    });
  }

  getDonationHistory(): Observable<RequestListResponse> {
    return this.http.get<RequestListResponse>(`${this.apiUrl}/requests/history`);
  }
}