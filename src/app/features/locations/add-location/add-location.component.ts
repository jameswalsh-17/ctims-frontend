import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LocationService } from '../../../core/services/location.services';

@Component({
  selector: 'app-add-location',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-location.component.html',
  styleUrls: ['./add-location.component.scss']
})
export class AddLocationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private locationService = inject(LocationService);
  private router = inject(Router);

  public locationForm: FormGroup;
  public isSubmitting: boolean = false;
  public errorMessage: string | null = null;

  constructor() {
    this.locationForm = this.fb.group({
      farm_name: ['', Validators.required],
      address_line: ['', Validators.required],
      town: ['', Validators.required],
      county: ['', Validators.required],
      postcode: ['', Validators.required],
      last_inspection_date: ['']
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.locationForm.invalid) return;

    this.isSubmitting = true;
    this.locationService.createLocation(this.locationForm.value).subscribe({
      next: () => {
        alert('Location added successfully!');
        this.router.navigate(['/locations']);
      },
      error: (err: any) => {
        this.errorMessage = err.error?.error || 'Failed to add location.';
        this.isSubmitting = false;
      }
    });
  }
}
