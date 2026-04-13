import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { Notification } from '@core/models/company.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #sidenav mode="over" class="sidenav">
        <div class="sidenav-header">
          <h2>Annuaire Congo</h2>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/" (click)="sidenav.close()">
            <mat-icon matListItemIcon>home</mat-icon>
            <span matListItemTitle>Home</span>
          </a>
          <a mat-list-item routerLink="/companies" (click)="sidenav.close()">
            <mat-icon matListItemIcon>business</mat-icon>
            <span matListItemTitle>Companies</span>
          </a>
          <a mat-list-item routerLink="/cart" (click)="sidenav.close()">
            <mat-icon matListItemIcon>public</mat-icon>
            <span matListItemTitle>Regions</span>
          </a>
          <a mat-list-item routerLink="/subscription" (click)="sidenav.close()">
            <mat-icon matListItemIcon>shopping_cart</mat-icon>
            <span matListItemTitle>Plans</span>
          </a>
          @if (!authService.isAuthenticated()) {
            <mat-divider></mat-divider>
            <a mat-list-item routerLink="/login" (click)="sidenav.close()">
              <mat-icon matListItemIcon>login</mat-icon>
              <span matListItemTitle>Login</span>
            </a>
            <a mat-list-item routerLink="/register" (click)="sidenav.close()">
              <mat-icon matListItemIcon>person_add</mat-icon>
              <span matListItemTitle>Register</span>
            </a>
          }
          @if (authService.isAuthenticated()) {
            <mat-divider></mat-divider>
            <a mat-list-item routerLink="/notifications" (click)="sidenav.close()">
              <mat-icon matListItemIcon [matBadge]="unreadCount() > 0 ? unreadCount() : ''" matBadgeColor="warn">notifications</mat-icon>
              <span matListItemTitle>Notifications</span>
            </a>
            <a mat-list-item routerLink="/profile" (click)="sidenav.close()">
              <mat-icon matListItemIcon>person</mat-icon>
              <span matListItemTitle>Profile</span>
            </a>
            <a mat-list-item routerLink="/payment-history" (click)="sidenav.close()">
              <mat-icon matListItemIcon>receipt_long</mat-icon>
              <span matListItemTitle>Payments</span>
            </a>
            @if (authService.isAdmin()) {
              <mat-divider></mat-divider>
              <div class="sidenav-section-title">Administration</div>
              <a mat-list-item routerLink="/admin/sectors" (click)="sidenav.close()">
                <mat-icon matListItemIcon>category</mat-icon>
                <span matListItemTitle>Sectors</span>
              </a>
              <a mat-list-item routerLink="/admin/geography" (click)="sidenav.close()">
                <mat-icon matListItemIcon>public</mat-icon>
                <span matListItemTitle>Geography</span>
              </a>
              <a mat-list-item routerLink="/admin/companies" (click)="sidenav.close()">
                <mat-icon matListItemIcon>admin_panel_settings</mat-icon>
                <span matListItemTitle>Companies</span>
              </a>
              <a mat-list-item routerLink="/admin/plans" (click)="sidenav.close()">
                <mat-icon matListItemIcon>layers</mat-icon>
                <span matListItemTitle>Plans</span>
              </a>
            }
            @if (authService.isEntrepriseOwner()) {
              <mat-divider></mat-divider>
              <div class="sidenav-section-title">My Company</div>
              <a mat-list-item routerLink="/dashboard" (click)="sidenav.close()">
                <mat-icon matListItemIcon>dashboard</mat-icon>
                <span matListItemTitle>Dashboard</span>
              </a>
            }
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="toolbar">
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="logo" routerLink="/">Annuaire Congo</span>
          <span class="spacer"></span>
          
          <button mat-icon-button routerLink="/cart" matTooltip="Regions">
            <mat-icon>public</mat-icon>
          </button>
          <button mat-icon-button routerLink="/subscription" matTooltip="Subscription Plans">
            <mat-icon>shopping_cart</mat-icon>
          </button>
          
          @if (authService.isAuthenticated()) {
            <button mat-icon-button routerLink="/notifications" [matBadge]="unreadCount() > 0 ? unreadCount() : ''" matBadgeColor="warn">
              <mat-icon>notifications</mat-icon>
            </button>
             <button mat-button [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon>
              {{ authService.currentUser()?.email }}
            </button>
            <mat-menu #userMenu="matMenu">
              <button mat-menu-item routerLink="/dashboard">
                <mat-icon>dashboard</mat-icon>
                <span>Dashboard</span>
              </button>
              <button mat-menu-item routerLink="/profile">
                <mat-icon>person</mat-icon>
                <span>Profile</span>
              </button>
              <button mat-menu-item routerLink="/payment-history">
                <mat-icon>receipt_long</mat-icon>
                <span>Payments</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Logout</span>
              </button>
            </mat-menu>
          } @else {
            <button mat-button routerLink="/login">
              <mat-icon>login</mat-icon>
              Login
            </button>
            <button mat-stroked-button routerLink="/register">
              <mat-icon>person_add</mat-icon>
              Register
            </button>
          }
        </mat-toolbar>

        <main class="content">
          <router-outlet></router-outlet>
        </main>

        <footer class="footer">
          <div class="footer-content">
            <div class="footer-logo">
              <mat-icon>business</mat-icon>
              <span>Annuaire Congo</span>
            </div>
            <p>&copy; 2026 Annuaire Congo. All rights reserved.</p>
            <div class="footer-links">
              <a routerLink="/">Home</a>
              <a routerLink="/companies">Companies</a>
              <a routerLink="/cart">Regions</a>
              <a routerLink="/subscription">Plans</a>
            </div>
          </div>
        </footer>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 300px;
      background: var(--surface-elevated);
    }

    .sidenav-header {
      padding: 24px 16px;
      background: var(--primary-gradient);
      color: white;
      display: flex;
      align-items: center;
      gap: 12px;

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }

      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
    }

    .sidenav-section-title {
      padding: 16px 16px 8px;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: var(--shadow-md);
    }

    .logo {
      margin-left: 8px;
      font-size: 20px;
      font-weight: 600;
      cursor: pointer;
      color: white;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .content {
      min-height: calc(100vh - 64px - 80px);
      padding: 24px;
      background-color: var(--background-color);
    }

    .footer {
      padding: 32px 24px;
      text-align: center;
      background: var(--surface-elevated);
      border-top: 1px solid var(--border-light);

      .footer-content {
        max-width: 800px;
        margin: 0 auto;
      }

      .footer-logo {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-bottom: 12px;
        
        mat-icon {
          color: var(--primary-color);
        }
        
        span {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
        }
      }

      p {
        margin: 0 0 16px 0;
        color: var(--text-muted);
        font-size: 14px;
      }

      .footer-links {
        display: flex;
        justify-content: center;
        gap: 24px;
        
        a {
          color: var(--text-secondary);
          font-size: 14px;
          transition: color 0.2s ease;
          
          &:hover {
            color: var(--primary-color);
          }
        }
      }
    }

    mat-divider {
      margin: 8px 0;
    }

    @media (max-width: 768px) {
      .content {
        padding: 16px;
      }
      
      .footer {
        padding: 24px 16px;
        
        .footer-links {
          flex-wrap: wrap;
          gap: 16px;
        }
      }
    }
  `]
})
export class LayoutComponent implements OnInit {
  authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  unreadCount = signal(0);

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.loadNotifications();
    }
  }

  loadNotifications(): void {
    this.notificationService.getMyNotifications().subscribe(data => {
      this.unreadCount.set(data.filter(n => !n.isRead).length);
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
