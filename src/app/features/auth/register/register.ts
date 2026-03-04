import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);

  public registerForm: FormGroup;
  public isSubmitting: boolean = false;
  public errorMessage: string | null = null;

  public roles: string[] = [
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
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = null;

    this.userService.requestAccess(this.registerForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
      },
      error: (err: any) => {
        this.errorMessage = err.error?.error || 'Failed to submit request.';
        this.isSubmitting = false;
      }
    });
  }
}
