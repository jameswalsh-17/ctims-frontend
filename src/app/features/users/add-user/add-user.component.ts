import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);

  public userForm: FormGroup;
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
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.userForm.invalid) return;

    this.isSubmitting = true;
    this.userService.createUser(this.userForm.value).subscribe({
      next: () => {
        alert('User created successfully!');
        this.router.navigate(['/users']);
      },
      error: (err: any) => {
        this.errorMessage = err.error?.error || 'Failed to create user.';
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }
}
