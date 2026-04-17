import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { NotificationService } from '@core/services/notification.service';
import { Notification } from '@core/models/company.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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
                  (click)="markAsRead(notification)">
                  <mat-icon matListItemIcon [class]="'type-' + notification.type">
                    {{ getIcon(notification.type) }}
                  </mat-icon>
                  <div matListItemTitle>{{ getTitle(notification.type) }}</div>
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
  private router = inject(Router);

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

  getIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'company_validated': 'check_circle',
      'company_rejected': 'error',
      'payment_success': 'check_circle',
      'payment_failed': 'error',
      'subscription_expiring': 'warning'
    };
    return icons[type] || 'notifications';
  }

  getTitle(type: string): string {
    const titles: { [key: string]: string } = {
      'company_validated': 'Company Approved',
      'company_rejected': 'Company Rejected',
      'company_suspended': 'Company Suspended',
      'company_reactivated': 'Company Reactivated',
      'subscription_activated': 'Subscription Activated',
      'subscription_cancelled': 'Subscription Cancelled',
      'payment_success': 'Payment Successful',
      'payment_failed': 'Payment Failed',
      'subscription_expiring': 'Subscription Expiring Soon'
    };
    return titles[type] || type;
  }

  markAsRead(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe();
    }
    if (notification.link) {
      this.router.navigateByUrl(notification.link);
    }
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