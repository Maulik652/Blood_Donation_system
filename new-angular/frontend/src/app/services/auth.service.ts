import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, AuthResponse, LoginCredentials, RegisterData } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private readonly userKey = 'user';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const user = this.safeParseUser(localStorage.getItem(this.userKey));

    if (user) {
      this.currentUserSubject.next(user);
      return;
    }

    this.clearSession();
  }

  private safeParseUser(rawUser: string | null): User | null {
    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as User;
    } catch {
      return null;
    }
  }

  private setSession(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private clearSession(): void {
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return null;
  }

  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/users/register`, data).pipe(
      tap(response => {
        if (response?.user) {
          this.setSession(response.user);
        }
      })
    );
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/users/login`, credentials).pipe(
      tap(response => {
        if (response?.user) {
          this.setSession(response.user);
        }
      })
    );
  }

  logout(): void {
    this.clearSession();
    this.http.post(`${this.apiUrl}/users/logout`, {}).pipe(
      catchError(() => of(null))
    ).subscribe();
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getProfile(): Observable<{ success: boolean; user: User }> {
    return this.http.get<{ success: boolean; user: User }>(`${this.apiUrl}/users/profile`).pipe(
      tap((response) => {
        if (response?.user) {
          this.setSession(response.user);
        }
      })
    );
  }

  updateAvailability(isAvailable: boolean): Observable<{ success: boolean; user: User }> {
    return this.http.put<{ success: boolean; user: User }>(`${this.apiUrl}/users/availability`, { isAvailable }).pipe(
      tap((response) => {
        if (response?.user) {
          this.setSession(response.user);
        }
      })
    );
  }
}