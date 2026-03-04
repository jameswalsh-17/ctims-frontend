import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CowService } from '../../../core/services/cow.service';
import { LocationService } from '../../../core/services/location.services';

@Component({
  selector: 'app-add-cattle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-cattle.component.html',
  styleUrls: ['./add-cattle.component.scss']
})
export class AddCattleComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cowService = inject(CowService);
  private locationService = inject(LocationService);
  private router = inject(Router);

  public cowForm: FormGroup;
  public locations: any[] = [];
  public isSubmitting: boolean = false;
  public errorMessage: string | null = null;
  public selectedFile: File | null = null;

  public allowedBreeds: string[] = [
    'Holstein Friesian', 'Jersey', 'Guernsey', 'Ayrshire', 'Brown Swiss',
    'Aberdeen Angus', 'Hereford', 'Charolais', 'Limousin', 'Simmental',
    'Belgian Blue', 'Other'
  ];

  constructor() {
    this.cowForm = this.fb.group({
      tag_number: ['', [Validators.required, this.tagNumberValidator]],
      breed: ['', Validators.required],
      sex: ['female', Validators.required],
      date_of_birth: ['', Validators.required],
      status: ['active', Validators.required],
      farm_name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.locationService.getLocations().subscribe({
      next: (locs) => this.locations = locs,
      error: (err) => console.error('Failed to load locations', err)
    });
  }

  tagNumberValidator(control: AbstractControl): ValidationErrors | null {
    const value = (control.value || '').replace(/\s+/g, '').toUpperCase();
    const validPattern = /^(UK|XI)\d{13}$/;
    return validPattern.test(value) ? null : { invalidTagFormat: true };
  }

  formatTagNumber(raw: string): string {
    const clean = raw.replace(/\s+/g, '').toUpperCase();
    const prefix = clean.substring(0, 2); // UK or XI
    const d1 = clean.substring(2, 3);     // 1 digit
    const d2 = clean.substring(3, 10);    // 7 digits
    const d3 = clean.substring(10, 14);   // 4 digits
    const d4 = clean.substring(14, 15);   // 1 digit
    return `${prefix} ${d1} ${d2} ${d3} ${d4}`;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  cancel(): void {
    this.router.navigate(['/my-cattle']);
  }

  onSubmit(): void {
    if (this.cowForm.invalid) return;

    this.isSubmitting = true;
    
    const rawData = { ...this.cowForm.value };
    rawData.tag_number = this.formatTagNumber(rawData.tag_number);

    this.cowService.addCow(rawData).subscribe({
      next: (response: any) => {
        const cowId = response.cow_id;
        if (this.selectedFile && cowId) {
          this.cowService.uploadCowImage(cowId, this.selectedFile).subscribe({
            next: () => {
              alert('Cattle record created successfully!');
              this.router.navigate(['/my-cattle']);
            },
            error: () => {
              alert('Cattle record created, but image upload failed.');
              this.router.navigate(['/my-cattle']);
            }
          });
        } else {
          alert('Cattle record created successfully!');
          this.router.navigate(['/my-cattle']);
        }
      },
      error: (err: any) => {
        this.errorMessage = err.error?.error || 'Failed to create record.';
        this.isSubmitting = false;
      }
    });
  }
}
