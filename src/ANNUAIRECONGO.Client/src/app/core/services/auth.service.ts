import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { TokenResponse, User, LoginRequest, RegisterRequest } from '../models/auth.model';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'current_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly _currentUser = signal<User | null>(this.getStoredUser());
  private readonly _isAuthenticated = signal<boolean>(this.hasValidToken());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly isAdmin = computed(() => this._currentUser()?.roles?.includes('Admin') ?? false);
  readonly isEntrepriseOwner = computed(() => this._currentUser()?.roles?.includes('EntrepriseOwner') ?? false);

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.api.post<TokenResponse>('/identity/token/generate', credentials).pipe(
      tap(response => {
        this.storeTokens(response);
        this.fetchCurrentUser();
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  register(data: RegisterRequest): Observable<{ value: string }> {
    return this.api.post<{ value: string }>('/identity/register', data);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

   refreshToken(): Observable<TokenResponse> {
     const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
     const accessToken = localStorage.getItem(TOKEN_KEY);
     return this.api.post<TokenResponse>('/identity/token/refresh-token', { refreshToken, accessToken }).pipe(
       tap(response => {
         this.storeTokens(response);
       }),
       catchError(error => {
         this.logout();
         return throwError(() => error);
       })
     );
   }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getAuthHeaders(): { headers: { Authorization: string } } {
    const token = this.getToken();
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  private fetchCurrentUser(): void {
    this.api.get<User>('/identity/current-user/claims').subscribe({
      next: (user) => {
        this._currentUser.set(user);
        this._isAuthenticated.set(true);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      },
      error: (error) => {
        console.error('Error fetching current user:', error);
        this.logout();
      }
    });
  }

  private storeTokens(response: TokenResponse): void {
    const token = response.accessToken?.trim() || '';
    const refreshToken = response.refreshToken?.trim() || '';
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    console.log('[AuthService] Token stored, length:', token.length);
  }

  private getStoredUser(): User | null {
    const userJson = localStorage.getItem(USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    return !!token;
  }

  init(): void {
    if (this.hasValidToken()) {
      this.fetchCurrentUser();
    }
  }
}