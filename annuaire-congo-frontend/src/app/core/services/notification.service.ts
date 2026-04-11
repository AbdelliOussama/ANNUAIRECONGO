import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Notification } from '../models/company.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly api = inject(ApiService);

  getMyNotifications(): Observable<Notification[]> {
    return this.api.get<Notification[]>('/api/v1.0/notifications');
  }

  markAsRead(id: string): Observable<void> {
    return this.api.put<void>(`/api/v1.0/notifications/${id}/read`, {});
  }

  markAllRead(): Observable<void> {
    return this.api.put<void>('/api/v1.0/notifications/read-all', {});
  }

  deleteNotification(id: string): Observable<void> {
    return this.api.delete<void>(`/api/v1.0/notifications/${id}`);
  }
}