import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BreedingService } from '../../../core/services/breeding.service';
import { CowService } from '../../../core/services/cow.service';

@Component({
  selector: 'app-add-breeding-record',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-breeding-record.component.html',
  styleUrls: ['./add-breeding-record.component.scss']
})
export class AddBreedingRecordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private breedingService = inject(BreedingService);
  private cowService = inject(CowService);
  private router = inject(Router);

  public breedingForm: FormGroup;
  public femaleCows: any[] = [];
  public isSubmitting: boolean = false;
  public errorMessage: string | null = null;

  constructor() {
    this.breedingForm = this.fb.group({
      cow_id: ['', Validators.required],
      service_date: ['', Validators.required],
      outcome: ['pending', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cowService.getCows().subscribe({
      next: (data: any) => {
        const cows = data.cows || data;
        this.femaleCows = cows.filter((c: any) => c.sex?.toLowerCase() === 'female');
      },
      error: (err: any) => console.error('Failed to load cows', err)
    });
  }

  onSubmit(): void {
    if (this.breedingForm.invalid) return;

    this.isSubmitting = true;
    const payload = { ...this.breedingForm.value };
    payload.cow_id = Number(payload.cow_id);

    this.breedingService.createBreedingRecord(payload).subscribe({
      next: () => {
        alert('Breeding record added successfully!');
        this.router.navigate(['/breeding-records']);
      },
      error: (err: any) => {
        this.errorMessage = err.error?.error || 'Failed to add record.';
        this.isSubmitting = false;
      }
    });
  }
}
