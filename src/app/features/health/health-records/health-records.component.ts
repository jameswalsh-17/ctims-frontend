import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HealthService } from '../../../core/services/health.service';
import { AuthService } from '../../../core/auth/auth.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-health-records',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './health-records.component.html',
  styleUrls: ['./health-records.component.scss']
})
export class HealthRecordsComponent implements OnInit {
  private authService = inject(AuthService);
  private healthService = inject(HealthService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  public allRecords: any[] = [];
  public filteredRecords: any[] = [];
  public isLoading: boolean = true;
  public errorMessage: string | null = null;
  public canEdit: boolean = false;

  public filterTag: string = '';
  public filterVet: string = '';
  public filterDiagnosis: string = '';

  public vets: string[] = [];

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
    this.healthService.getAllHealthRecords().subscribe({
      next: (data: any) => {
        this.allRecords = data;
        this.filteredRecords = [...this.allRecords];
        
        this.vets = [...new Set(this.allRecords.map(r => r.vet_username))].filter(v => v).sort();

        this.isLoading = false;
        this.applyFilters();
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to load health records.';
        this.isLoading = false;
        this.cdr.detectChanges(); 
        console.error('Error loading health records:', err);
      }
    });
  }

  applyFilters(): void {
    this.filteredRecords = this.allRecords.filter(record => {
      const matchTag = !this.filterTag || record.tag_number.toLowerCase().includes(this.filterTag.toLowerCase());
      const matchVet = !this.filterVet || record.vet_username === this.filterVet;
      const matchDiagnosis = !this.filterDiagnosis || 
        (record.diagnosis && record.diagnosis.toLowerCase().includes(this.filterDiagnosis.toLowerCase())) ||
        (record.reason && record.reason.toLowerCase().includes(this.filterDiagnosis.toLowerCase()));
      
      return matchTag && matchVet && matchDiagnosis;
    });
  }

  clearFilters(): void {
    this.filterTag = '';
    this.filterVet = '';
    this.filterDiagnosis = '';
    this.applyFilters();
  }

  deleteRecord(id: number): void {
    if (confirm('Are you sure you want to delete this health record? This action cannot be undone.')) {
      this.healthService.deleteHealthRecord(id).subscribe({
        next: () => {
          this.allRecords = this.allRecords.filter((r: any) => r.health_id !== id);
          this.applyFilters();
          this.cdr.detectChanges(); 
          alert('Record deleted successfully.');
        },
        error: (err: any) => {
          alert(err.error?.error || 'Failed to delete record.');
          console.error(err);
        }
      });
    }
  }
}
