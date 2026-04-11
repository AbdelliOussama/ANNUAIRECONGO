import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '@core/services/auth.service';

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
    MatListModule
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
          @if (!authService.isAuthenticated()) {
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
            @if (authService.isAdmin()) {
              <mat-divider></mat-divider>
              <div class="sidenav-section-title">Administration</div>
              <a mat-list-item routerLink="/admin/sectors" (click)="sidenav.close()">
                <mat-icon matListItemIcon>category</mat-icon>
                <span matListItemTitle>Sectors</span>
              </a>
              <a mat-list-item routerLink="/admin/companies" (click)="sidenav.close()">
                <mat-icon matListItemIcon>admin_panel_settings</mat-icon>
                <span matListItemTitle>Manage Companies</span>
              </a>
            }
            @if (authService.isEntrepriseOwner()) {
              <mat-divider></mat-divider>
              <div class="sidenav-section-title">My Company</div>
              <a mat-list-item routerLink="/dashboard" (click)="sidenav.close()">
                <mat-icon matListItemIcon>dashboard</mat-icon>
                <span matListItemTitle>Dashboard</span>
              </a>
              <a mat-list-item routerLink="/my-company" (click)="sidenav.close()">
                <mat-icon matListItemIcon>business</mat-icon>
                <span matListItemTitle>My Profile</span>
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
          @if (authService.isAuthenticated()) {
            <button mat-button [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon>
              {{ authService.currentUser()?.firstName }}
            </button>
            <mat-menu #userMenu="matMenu">
              <button mat-menu-item routerLink="/dashboard">
                <mat-icon>dashboard</mat-icon>
                <span>Dashboard</span>
              </button>
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
          <p>&copy; 2024 Annuaire Congo. All rights reserved.</p>
        </footer>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 280px;
      background: #fff;
    }

    .sidenav-header {
      padding: 24px 16px;
      background: linear-gradient(135deg, #1e88e5, #43a047);
      color: white;
      
      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }
    }

    .sidenav-section-title {
      padding: 16px 16px 8px;
      font-size: 12px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.54);
      text-transform: uppercase;
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .logo {
      margin-left: 8px;
      font-size: 20px;
      font-weight: 500;
      cursor: pointer;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .content {
      min-height: calc(100vh - 64px - 60px);
      padding: 24px;
      background-color: #f5f5f5;
    }

    .footer {
      padding: 20px;
      text-align: center;
      background: #fff;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
      
      p {
        margin: 0;
        color: rgba(0, 0, 0, 0.54);
        font-size: 14px;
      }
    }

    mat-divider {
      margin: 8px 0;
    }
  `]
})
export class LayoutComponent {
  authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}