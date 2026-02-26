import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Event, CreateEventData } from '../models/event.model';

interface EventItemResponse {
  success: boolean;
  event: Event;
  message?: string;
}

interface EventListResponse {
  success: boolean;
  events: Event[];
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllEvents(): Observable<EventListResponse> {
    return this.http.get<EventListResponse>(`${this.apiUrl}/events`);
  }

  createEvent(data: CreateEventData): Observable<EventItemResponse> {
    return this.http.post<EventItemResponse>(`${this.apiUrl}/events`, data);
  }

  updateEvent(eventId: string, data: CreateEventData): Observable<EventItemResponse> {
    return this.http.put<EventItemResponse>(`${this.apiUrl}/events/${eventId}`, data);
  }

  deleteEvent(eventId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/events/${eventId}`);
  }

  registerForEvent(eventId: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/events/${eventId}/register`, {});
  }
}
