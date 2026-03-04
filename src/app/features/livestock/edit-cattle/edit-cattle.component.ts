import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CowService } from '../../../core/services/cow.service';
import { LocationService } from '../../../core/services/location.services';

@Component({
  selector: 'app-edit-cattle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-cattle.component.html',
  styleUrls: ['./edit-cattle.component.scss']
})
export class EditCattleComponent implements OnInit {
  public cowForm: FormGroup;
  public cowId!: number;
  public locations: any[] = [];
  public isLoading: boolean = true;
  public isSubmitting: boolean = false;
  public errorMessage: string | null = null;

  public currentImageUrl: string | null = null;
  public selectedFile: File | null = null;

  public allowedBreeds: string[] = [
    'Holstein Friesian', 'Jersey', 'Guernsey', 'Ayrshire', 'Brown Swiss',
    'Aberdeen Angus', 'Hereford', 'Charolais', 'Limousin', 'Simmental',
    'Belgian Blue', 'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cowService: CowService,
    private locationService: LocationService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {
    this.cowForm = this.fb.group({
      tag_number: ['', [Validators.required, this.tagNumberValidator]],
      breed: ['', Validators.required],
      sex: ['', Validators.required],
      date_of_birth: ['', Validators.required],
      status: ['', Validators.required],
      farm_name: ['', Validators.required]
    });
  }

  tagNumberValidator(control: AbstractControl): ValidationErrors | null {
    const value = (control.value || '').replace(/\s+/g, '').toUpperCase();
    if (!value) return null;
    const validPattern = /^(UK|XI)\d{13}$/;
    return validPattern.test(value) ? null : { invalidTagFormat: true };
  }

  formatTagNumber(raw: string): string {
    const clean = raw.replace(/\s+/g, '').toUpperCase();
    const prefix = clean.substring(0, 2);
    const d1 = clean.substring(2, 3);
    const d2 = clean.substring(3, 10);
    const d3 = clean.substring(10, 14);
    const d4 = clean.substring(14, 15);
    return `${prefix} ${d1} ${d2} ${d3} ${d4}`;
  }

  ngOnInit(): void {
    this.cowId = Number(this.route.snapshot.paramMap.get('id'));
    if (isPlatformBrowser(this.platformId)) {
      this.loadInitialData();
    }
  }

  loadInitialData(): void {
    this.locationService.getLocations().subscribe({
      next: (locs) => {
        this.locations = locs;
        this.loadCattleDetails();
      },
      error: (err) => {
        this.errorMessage = "Failed to load locations.";
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadCattleDetails(): void {
    this.cowService.getCow(this.cowId).subscribe({
      next: (cow: any) => {
        const formattedDate = cow.date_of_birth ? new Date(cow.date_of_birth).toISOString().split('T')[0] : '';
        
        this.cowForm.patchValue({
          tag_number: cow.tag_number.replace(/\s+/g, ''), // Strip spaces for the edit field
          breed: cow.breed,
          sex: cow.sex,
          date_of_birth: formattedDate,
          status: cow.status,
          farm_name: cow.farm_name
        });

        this.currentImageUrl = cow.image_url || null;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = "Failed to load cattle details.";
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  cancel(): void {
    this.router.navigate(['/view-cattle', this.cowId]);
  }

  onSubmit(): void {
    if (this.cowForm.invalid) return;

    this.isSubmitting = true;
    const rawData = { ...this.cowForm.value };
    rawData.tag_number = this.formatTagNumber(rawData.tag_number);

    this.cowService.updateCow(this.cowId, rawData).subscribe({
      next: () => {
        if (this.selectedFile) {
          this.cowService.uploadCowImage(this.cowId, this.selectedFile).subscribe({
            next: () => {
              alert('Cattle record and image updated successfully!');
              this.router.navigate(['/view-cattle', this.cowId]);
            },
            error: () => {
              alert('Data updated, but image upload failed.');
              this.router.navigate(['/view-cattle', this.cowId]);
            }
          });
        } else {
          alert('Cattle record updated successfully!');
          this.router.navigate(['/view-cattle', this.cowId]);
        }
      },
      error: (err) => {
        this.errorMessage = "Failed to update record.";
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }
}
