import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreedingService } from '../../../core/services/breeding.service';
import { AuthService } from '../../../core/auth/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-breeding-records',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './breeding-records.component.html',
  styleUrls: ['./breeding-records.component.scss']
})
export class BreedingRecordsComponent implements OnInit {
  private authService = inject(AuthService);
  private breedingService = inject(BreedingService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  
  public allRecords: any[] = [];
  public filteredRecords: any[] = [];
  public isLoading: boolean = true;
  public errorMessage: string | null = null;
  public canEdit: boolean = false;

  public filterTag: string = '';
  public filterOutcome: string = '';

  constructor() {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUserValue();
    const role = user?.role;
    
    const isVet = ['Veterinary Assistant', 'Veterinary Surgeon', 'AI Technician'].includes(role);
    const isFarm = ['Admin', 'Farm Manager', 'Farm Owner', 'Farm Assistant'].includes(role);
    this.canEdit = isFarm || isVet;

    if (isPlatformBrowser(this.platformId)) {
      this.loadRecords();
    }
  }

  loadRecords(): void {
    this.breedingService.getAllBreedingRecords().subscribe({
      next: (data: any) => {
        this.allRecords = data;
        this.filteredRecords = [...this.allRecords];
        this.isLoading = false;
        this.applyFilters();
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to load breeding records.';
        this.isLoading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  applyFilters(): void {
    this.filteredRecords = this.allRecords.filter(record => {
      const matchTag = !this.filterTag || record.tag_number.toLowerCase().includes(this.filterTag.toLowerCase());
      
      const outcomeVal = (record.outcome || 'Pending').toLowerCase();
      const matchOutcome = !this.filterOutcome || outcomeVal === this.filterOutcome.toLowerCase();
      
      return matchTag && matchOutcome;
    });
  }

  clearFilters(): void {
    this.filterTag = '';
    this.filterOutcome = '';
    this.applyFilters();
  }

  deleteRecord(id: number): void {
    if (confirm('Are you sure you want to delete this breeding record?')) {
      this.breedingService.deleteBreedingRecord(id).subscribe({
        next: () => {
          this.allRecords = this.allRecords.filter((r: any) => r.breeding_id !== id);
          this.applyFilters();
          this.cdr.detectChanges();
          alert('Record deleted successfully.');
        },
        error: (err: any) => {
          alert('Failed to delete record.');
          console.error(err);
        }
      });
    }
  }

  formatOutcome(outcome: string): string {
    if (!outcome) return 'Pending Outcome';
    return outcome.replace('_', ' '); 
  }
}
