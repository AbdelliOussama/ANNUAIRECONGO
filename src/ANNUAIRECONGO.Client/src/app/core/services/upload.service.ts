import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';

export interface UploadResponse {
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post<UploadResponse>('/api/v1/uploads/image', formData).pipe(
      map(res => res.url)
    );
  }

  uploadDocument(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post<UploadResponse>('/api/v1/uploads/document', formData).pipe(
      map(res => res.url)
    );
  }

  deleteFile(url: string): Observable<void> {
    return this.api.delete<void>(`/api/v1/uploads?url=${encodeURIComponent(url)}`);
  }

  toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
}
