import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BreedingService } from '../../../core/services/breeding.service';
import { CowService } from '../../../core/services/cow.service';

@Component({
  selector: 'app-edit-breeding-record',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-breeding-record.component.html',
  styleUrls: ['./edit-breeding-record.component.scss']
})
export class EditBreedingRecordComponent implements OnInit {
  breedingForm: FormGroup;
  recordId!: number;
  femaleCows: any[] = [];
  isLoading: boolean = true;
  isSaving: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private breedingService: BreedingService,
    private cowService: CowService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {
    this.breedingForm = this.fb.group({
      cow_id: [{ value: '', disabled: true }, Validators.required],
      service_date: ['', Validators.required],
      outcome: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.recordId = Number(this.route.snapshot.paramMap.get('id'));
    if (isPlatformBrowser(this.platformId)) {
      this.loadInitialData();
    }
  }

  loadInitialData(): void {
    this.cowService.getCows().subscribe({
      next: (data: any) => {
        const cows = data.cows || data;
        this.femaleCows = cows.filter((c: any) => c.sex?.toLowerCase() === 'female');
        this.loadRecordDetails();
      },
      error: (err: any) => {
        this.errorMessage = "Failed to load cows.";
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadRecordDetails(): void {
    this.breedingService.getBreedingRecord(this.recordId).subscribe({
      next: (record: any) => {
        const formattedDate = record.service_date ? new Date(record.service_date).toISOString().split('T')[0] : '';
        
        this.breedingForm.patchValue({
          cow_id: String(record.cow_id),
          service_date: formattedDate,
          outcome: record.outcome
        });

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = "Failed to load breeding record details.";
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (this.breedingForm.invalid) return;

    this.isSubmitting = true;
    const formData = this.breedingForm.getRawValue();

    this.breedingService.updateBreedingRecord(this.recordId, formData).subscribe({
      next: () => {
        alert('Breeding record updated successfully!');
        this.router.navigate(['/breeding-records']);
      },
      error: (err: any) => {
        this.errorMessage = err.error?.error || "Failed to update record.";
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }
}
