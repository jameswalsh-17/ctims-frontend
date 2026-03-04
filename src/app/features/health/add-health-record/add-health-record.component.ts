import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HealthService } from '../../../core/services/health.service';
import { CowService } from '../../../core/services/cow.service';

@Component({
  selector: 'app-add-health-record',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-health-record.component.html',
  styleUrls: ['./add-health-record.component.scss']
})
export class AddHealthRecordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private healthService = inject(HealthService);
  private cowService = inject(CowService);
  private router = inject(Router);

  public healthForm: FormGroup;
  public cows: any[] = [];
  public surgeons: any[] = [];
  public assistants: any[] = [];
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
      cow_id: ['', Validators.required],
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
    this.cowService.getCows().subscribe({
      next: (data) => this.cows = data.cows || data,
      error: (err) => console.error('Failed to load cows', err)
    });

    this.healthService.getVets().subscribe({
      next: (vets: any[]) => {
        this.surgeons = vets.filter(v => v.role === 'Veterinary Surgeon');
        this.assistants = vets.filter(v => v.role === 'Veterinary Assistance');
      },
      error: (err) => console.error('Failed to load vets', err)
    });
  }

  onSubmit(): void {
    if (this.healthForm.invalid) return;

    this.isSubmitting = true;
    this.healthService.createHealthRecord(this.healthForm.value).subscribe({
      next: () => {
        alert('Health record logged successfully!');
        this.router.navigate(['/health-records']);
      },
      error: (err: any) => {
        this.errorMessage = err.error?.error || 'Failed to log health record.';
        this.isSubmitting = false;
      }
    });
  }
}
