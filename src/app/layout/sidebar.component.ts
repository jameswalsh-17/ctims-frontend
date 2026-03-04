import { Component, Inject, inject, OnDestroy } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private document = inject(DOCUMENT);

  public isAdmin: boolean = false;
  public canViewAudit: boolean = false;
  public canViewUsers: boolean = false;

  private userSub: Subscription;

  constructor() {
    this.userSub = this.authService.currentUser$.subscribe((user: any) => {
      if (user) {
        const role = user.role;
        this.isAdmin = role === 'Admin';
        
        const isFarmManagement = ['Farm Manager', 'Farm Owner', 'Farm Assistant'].includes(role);
        
        this.canViewUsers = this.isAdmin; 
        this.canViewAudit = this.isAdmin || isFarmManagement;
      } else {
        this.isAdmin = false;
        this.canViewAudit = false;
        this.canViewUsers = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  onLogout(event: Event): void {
    event.preventDefault(); 
    
    this.authService.logout().subscribe({
      next: () => {
        localStorage.setItem('theme', 'light');
        this.document.body.classList.remove('dark-theme');
        
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error('Logout failed on the server:', err);
        localStorage.setItem('theme', 'light');
        this.document.body.classList.remove('dark-theme');
        this.router.navigate(['/login']);
      }
    });
  }
}
