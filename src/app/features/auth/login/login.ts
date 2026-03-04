import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html', 
  styleUrls: ['./login.scss']  
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;

  private route = inject(ActivatedRoute);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'true') {
        this.successMessage = 'Access request submitted! Status: Request Pending.';
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
          this.document.body.classList.add('dark-theme');
        } else {
          this.document.body.classList.remove('dark-theme');
        }

        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Invalid username or password. Please try again.';
        console.error('Login error:', err);
      }
    });
  }
}
