import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { NotificationService } from '@core/services/notification.service';
import { Notification, NotificationType } from '@core/models/company.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSnackBarModule,
    MatBadgeModule
  ],
  template: `
    <div class="notifications-container">
      <div class="header">
        <h1>Notifications</h1>
        @if (unreadCount() > 0) {
          <button mat-stroked-button (click)="markAllRead()">
            <mat-icon>done_all</mat-icon>
            Mark All Read
          </button>
        }
      </div>

      <mat-card>
        <mat-card-content>
          @if (notifications().length > 0) {
            <mat-list>
              @for (notification of notifications(); track notification.id) {
                <mat-list-item 
                  [class.unread]="!notification.isRead"
                  (click)="markAsRead(notification.id)">
                  <mat-icon matListItemIcon [class]="'type-' + notification.type">
                    {{ getIcon(notification.type) }}
                  </mat-icon>
                  <div matListItemTitle>{{ notification.title }}</div>
                  <div matListItemLine>{{ notification.message }}</div>
                  <div matListItemMeta>
                    <span class="time">{{ notification.createdAt | date:'short' }}</span>
                    <button mat-icon-button (click)="deleteNotification(notification.id, $event)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </mat-list-item>
              }
            </mat-list>
          } @else {
            <div class="empty-state">
              <mat-icon>notifications_none</mat-icon>
              <p>No notifications</p>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .notifications-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .unread {
      background: #fff3e0;
    }

    mat-list-item {
      cursor: pointer;
      border-bottom: 1px solid #eee;
    }

    .type-0 { color: #1976d2; }
    .type-1 { color: #2e7d32; }
    .type-2 { color: #f57c00; }
    .type-3 { color: #d32f2f; }

    .time {
      font-size: 12px;
      color: #666;
      margin-right: 8px;
    }

    .empty-state {
      text-align: center;
      padding: 48px;
      
      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #ccc;
      }
      
      p {
        margin-top: 16px;
        color: #666;
      }
    }
  `]
})
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private snackBar = inject(MatSnackBar);

  notifications = signal<Notification[]>([]);
  unreadCount = signal(0);

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getMyNotifications().subscribe(data => {
      this.notifications.set(data);
      this.unreadCount.set(data.filter(n => !n.isRead).length);
    });
  }

  getIcon(type: NotificationType): string {
    const icons: { [key: number]: string } = {
      0: 'info',
      1: 'check_circle',
      2: 'warning',
      3: 'error'
    };
    return icons[type] || 'notifications';
  }

  markAsRead(id: string): void {
    this.notificationService.markAsRead(id).subscribe(() => this.loadNotifications());
  }

  markAllRead(): void {
    this.notificationService.markAllRead().subscribe(() => {
      this.snackBar.open('All notifications marked as read', 'Close', { duration: 3000 });
      this.loadNotifications();
    });
  }

  deleteNotification(id: string, event: Event): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(id).subscribe(() => {
      this.snackBar.open('Notification deleted', 'Close', { duration: 3000 });
      this.loadNotifications();
    });
  }
}