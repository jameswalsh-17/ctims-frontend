import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HealthService } from '../../../core/services/health.service';
import { CowService } from '../../../core/services/cow.service';

@Component({
  selector: 'app-edit-health-record',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-health-record.component.html',
  styleUrls: ['./edit-health-record.component.scss']
})
export class EditHealthRecordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private healthService = inject(HealthService);
  private cowService = inject(CowService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  public healthForm: FormGroup;
  public recordId!: number;
  public cows: any[] = [];
  public surgeons: any[] = [];
  public assistants: any[] = [];
  public isLoading: boolean = true;
  public isSubmitting: boolean = false;
  public errorMessage: string | null = null;

  public vaccinationTypes: string[] = [
    'BVD (Bovine Viral Diarrhoea)',
    'IBR (Infectious Bovine Rhinotracheitis)',
    'Leptospirosis',
    'Blackleg / Clostridial',
    'Salmonella',
    'Pneumonia',
    'Rotavirus / Coronavirus',
    'Other'
  ];

  constructor() {
    this.healthForm = this.fb.group({
      cow_id: [{ value: '', disabled: true }, Validators.required],
      diagnosis: [''],
      treatment: ['', Validators.required],
      last_visit: ['', Validators.required],
      follow_up_date: [''],
      reason: ['', Validators.required],
      vet: ['', Validators.required],
      vet_assistant: [''],
      weight: [''],
      notes: [''],
      vaccination_type: ['']
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
      next: (data) => {
        this.cows = data.cows || data;
        this.loadVets();
      },
      error: (err) => console.error(err)
    });
  }

  loadVets(): void {
    this.healthService.getVets().subscribe({
      next: (vets: any[]) => {
        this.surgeons = vets.filter(v => v.role === 'Veterinary Surgeon');
        this.assistants = vets.filter(v => v.role === 'Veterinary Assistance');
        this.loadRecord();
      },
      error: (err) => console.error(err)
    });
  }

  loadRecord(): void {
    this.healthService.getHealthRecord(this.recordId).subscribe({
      next: (record) => {
        const visitDate = record.last_visit ? new Date(record.last_visit).toISOString().split('T')[0] : '';
        const followUpDate = record.follow_up_date ? new Date(record.follow_up_date).toISOString().split('T')[0] : '';

        this.healthForm.patchValue({
          cow_id: record.cow_id,
          diagnosis: record.diagnosis,
          treatment: record.treatment,
          last_visit: visitDate,
          follow_up_date: followUpDate,
          reason: record.reason,
          vet: record.vet_username,
          vet_assistant: record.vet_assistant_username,
          weight: record.weight,
          notes: record.notes,
          vaccination_type: record.vaccination_type
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = "Failed to load health record details.";
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (this.healthForm.invalid) return;

    this.isSubmitting = true;
    this.healthService.updateHealthRecord(this.recordId, this.healthForm.getRawValue()).subscribe({
      next: () => {
        alert('Health record updated successfully!');
        this.router.navigate(['/view-health-record', this.recordId]);
      },
      error: (err: any) => {
        this.errorMessage = err.error?.error || "Failed to update record.";
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }
}
