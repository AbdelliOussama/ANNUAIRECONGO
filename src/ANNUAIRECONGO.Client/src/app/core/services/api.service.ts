import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, String(params[key]));
        }
      });
    }
    
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params: httpParams });
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body);
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body);
  }

delete<T>(endpoint: string, options?: {
      body?: unknown,
      headers?: Record<string, string>,
      params?: Record<string, string | number | boolean>
    }): Observable<T> {
      const httpOptions: {
        body?: unknown;
        headers?: HttpHeaders;
        params?: HttpParams;
      } = {};
      if (options?.body) httpOptions.body = options.body;
      if (options?.headers) {
        let httpHeaders = new HttpHeaders();
        Object.keys(options.headers).forEach(key => {
          httpHeaders = httpHeaders.set(key, options.headers![key]);
        });
        httpOptions.headers = httpHeaders;
      }
      if (options?.params) {
        let httpParams = new HttpParams();
        Object.keys(options.params).forEach(key => {
          if (options.params![key] !== null && options.params![key] !== undefined) {
            httpParams = httpParams.set(key, String(options.params![key]));
          }
        });
        httpOptions.params = httpParams;
      }
      return this.http.delete<T>(`${this.baseUrl}${endpoint}`, httpOptions);
    }
}