import { Component, signal, inject, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { SidebarComponent } from './layout/sidebar.component'; 
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  
  currentUser$ = this.authService.currentUser$;
  protected readonly title = signal('ctims-frontend');

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // 1. Check if user is already logged in (session check)
      this.authService.checkSession().subscribe();

      // 2. Apply theme preference
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        this.document.body.classList.add('dark-theme');
      }
    }
  }
}