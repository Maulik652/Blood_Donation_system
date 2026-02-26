import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, finalize, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, AuthResponse, LoginCredentials, RegisterData } from '../models/user.model';

interface ProfileResponse {
  success: boolean;
  user: User;
  csrfToken?: string;
}

interface CsrfTokenResponse {
  success: boolean;
  csrfToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private readonly userKey = 'user';
  private readonly csrfKey = 'csrfToken';
  private readonly profileCacheWindowMs = 60 * 1000;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private lastProfileSyncAt = 0;
  private inFlightProfile$?: Observable<ProfileResponse>;
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();

    if (this.currentUserSubject.value && !this.getCsrfToken()) {
      this.fetchCsrfToken().pipe(catchError(() => of(null))).subscribe();
    }
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
    this.lastProfileSyncAt = Date.now();
  }

  private setCsrfToken(token?: string): void {
    if (!token) {
      sessionStorage.removeItem(this.csrfKey);
      return;
    }

    sessionStorage.setItem(this.csrfKey, token);
  }

  private clearSession(): void {
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.csrfKey);
    this.currentUserSubject.next(null);
    this.lastProfileSyncAt = 0;
    this.inFlightProfile$ = undefined;
  }

  getToken(): string | null {
    return null;
  }

  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/users/register`, data).pipe(
      tap(response => {
        if (response?.user) {
          this.setSession(response.user);
          this.setCsrfToken(response.csrfToken);
        }
      })
    );
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/users/login`, credentials).pipe(
      tap(response => {
        if (response?.user) {
          this.setSession(response.user);
          this.setCsrfToken(response.csrfToken);
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

  getCsrfToken(): string | null {
    return sessionStorage.getItem(this.csrfKey);
  }

  fetchCsrfToken(): Observable<CsrfTokenResponse> {
    return this.http.get<CsrfTokenResponse>(`${this.apiUrl}/users/csrf-token`).pipe(
      tap((response) => {
        if (response?.csrfToken) {
          this.setCsrfToken(response.csrfToken);
        }
      })
    );
  }

  getProfile(force = false): Observable<ProfileResponse> {
    const cachedUser = this.currentUserSubject.value;

    if (!force && cachedUser && Date.now() - this.lastProfileSyncAt < this.profileCacheWindowMs) {
      return of({
        success: true,
        user: cachedUser,
        csrfToken: this.getCsrfToken() || undefined,
      });
    }

    if (!force && this.inFlightProfile$) {
      return this.inFlightProfile$;
    }

    this.inFlightProfile$ = this.http.get<ProfileResponse>(`${this.apiUrl}/users/profile`).pipe(
      tap((response) => {
        if (response?.user) {
          this.setSession(response.user);
          this.setCsrfToken(response.csrfToken);
        }
      }),
      finalize(() => {
        this.inFlightProfile$ = undefined;
      }),
      shareReplay(1)
    );

    return this.inFlightProfile$;
  }

  ensureProfile(force = false): Observable<ProfileResponse> {
    return this.getProfile(force);
  }

  updateAvailability(isAvailable: boolean): Observable<ProfileResponse> {
    return this.http.put<ProfileResponse>(`${this.apiUrl}/users/availability`, { isAvailable }).pipe(
      tap((response) => {
        if (response?.user) {
          this.setSession(response.user);
          this.setCsrfToken(response.csrfToken);
        }
      })
    );
  }
}