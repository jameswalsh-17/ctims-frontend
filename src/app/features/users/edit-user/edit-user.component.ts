import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  public userForm: FormGroup;
  public userId!: number;
  public isLoading: boolean = true;
  public isSubmitting: boolean = false;
  public errorMessage: string | null = null;

  public availableRoles: string[] = [
    'Admin',
    'Farm Owner',
    'Farm Manager',
    'Farm Assistant',
    'Veterinary Surgeon',
    'Veterinary Assistant',
    'AI Technician',
    'Farm Labourer',
    'Tractor & Machinery Operator',
    'Milker'
  ];

  constructor() {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      password: [''] 
    });
  }

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    if (isPlatformBrowser(this.platformId)) {
      this.loadUser();
    }
  }

  loadUser(): void {
    this.userService.getUser(this.userId).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          role: user.role,
          password: '' 
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load user details.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    this.isSubmitting = true;
    const formData = { ...this.userForm.value };

    if (!formData.password) {
      delete formData.password;
    }

    this.userService.updateUser(this.userId, formData).subscribe({
      next: () => {
        alert('User updated successfully!');
        this.router.navigate(['/users']);
      },
      error: (err: any) => {
        this.errorMessage = err.error?.error || 'Failed to update user.';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }
}
