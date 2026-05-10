import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Notification } from '../models/company.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly api = inject(ApiService);

  getNotifications(): Observable<Notification[]> {
    return this.api.get<Notification[]>('/api/v1/notifications');
  }

  getMyNotifications(): Observable<Notification[]> {
    return this.getNotifications();
  }

  markAsRead(id: string): Observable<void> {
    return this.api.put<void>(`/api/v1/notifications/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.api.put<void>('/api/v1/notifications/read-all', {});
  }

  markAllRead(): Observable<void> {
    return this.markAllAsRead();
  }

  deleteNotification(id: string): Observable<void> {
    return this.api.delete<void>(`/api/v1/notifications/${id}`);
  }
}