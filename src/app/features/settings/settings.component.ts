import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { LocationService } from '../../core/services/location.services';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private locationService = inject(LocationService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);

  public profileForm: FormGroup;
  public isDarkMode: boolean = false;
  public successMessage: string | null = null;
  public errorMessage: string | null = null;
  public isLoading: boolean = true;
  public isSubmitting: boolean = false;

  public user: any = null;
  public mainFarm: any = null;
  public officePhone: string = '';
  public officeEmail: string = '';

  constructor() {
    this.profileForm = this.fb.group({
      username: [{ value: '', disabled: true }],
      email: ['', [Validators.required, Validators.email]],
      password: ['']
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadProfile();
      this.loadFarm();
      
      const savedTheme = localStorage.getItem('theme');
      this.isDarkMode = savedTheme === 'dark';
      this.applyTheme();
    }
  }

  loadProfile(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;
        this.profileForm.patchValue({
          username: user.username,
          email: user.email
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadFarm(): void {
    this.locationService.getLocations().subscribe({
      next: (locs: any[]) => {
        if (locs && locs.length > 0) {
          this.mainFarm = locs[0];
          this.generateFarmContact(this.user?.username || 'admin');
        }
        this.cdr.detectChanges();
      }
    });
  }

  onSubmitProfile(): void {
    if (this.profileForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    const formData = { ...this.profileForm.value };
    if (!formData.password) delete formData.password;

    this.userService.updateMe(formData).subscribe({
      next: (updated: any) => {
        this.successMessage = 'Profile updated successfully!';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.error || 'Failed to update profile.';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  generateFarmContact(username: string): void {
    this.officePhone = `028 90${Math.floor(10 + Math.random() * 90)} ${Math.floor(1000 + Math.random() * 9000)}`;
    const cleanName = username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    this.officeEmail = `admin@${cleanName}farms.co.uk`;
  }

  applyTheme(): void {
    if (this.isDarkMode) {
      this.document.body.classList.add('dark-theme');
    } else {
      this.document.body.classList.remove('dark-theme');
    }
  }
}
