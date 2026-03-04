import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CowService } from '../../../core/services/cow.service';
import { Cow } from '../../../core/models/farm.models';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-cattle',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './my-cattle.component.html',
  styleUrls: ['./my-cattle.component.scss']
})
export class MyCattleComponent implements OnInit {
  private authService = inject(AuthService);
  private cowService = inject(CowService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  public allCows: Cow[] = [];
  public filteredCows: Cow[] = [];
  public isLoading: boolean = true;
  public errorMessage: string | null = null;
  public canEdit: boolean = false;

  public filterTag: string = '';
  public filterBreed: string = '';
  public filterSex: string = '';
  public filterStatus: string = '';

  public breeds: string[] = [];

  constructor() {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUserValue();
    const role = user?.role;
    this.canEdit = ['Admin', 'Farm Manager', 'Farm Owner', 'Farm Assistant'].includes(role);

    if (isPlatformBrowser(this.platformId)) {
      this.loadCows();
    } else {
      this.isLoading = true; 
    }
  }

  loadCows(): void {
    this.cowService.getCows().subscribe({
      next: (data: any) => {
        const cowData = data.cows ? data.cows : data;
        this.allCows = cowData;
        this.filteredCows = [...this.allCows];
        
        this.breeds = [...new Set(this.allCows.map(c => c.breed))].sort();

        this.isLoading = false;
        this.applyFilters();
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to load cattle records. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges(); 
      }
    });
  }

  applyFilters(): void {
    this.filteredCows = this.allCows.filter(cow => {
      const matchTag = !this.filterTag || cow.tag_number.toLowerCase().includes(this.filterTag.toLowerCase());
      const matchBreed = !this.filterBreed || cow.breed === this.filterBreed;
      const matchSex = !this.filterSex || cow.sex.toLowerCase() === this.filterSex.toLowerCase();
      const matchStatus = !this.filterStatus || cow.status.toLowerCase() === this.filterStatus.toLowerCase();
      
      return matchTag && matchBreed && matchSex && matchStatus;
    });
  }

  clearFilters(): void {
    this.filterTag = '';
    this.filterBreed = '';
    this.filterSex = '';
    this.filterStatus = '';
    this.applyFilters();
  }

  deleteCow(cowId: number): void {
    const confirmDelete = window.confirm('Are you sure you want to delete this animal? This cannot be undone.');
    
    if (confirmDelete) {
      this.cowService.deleteCow(cowId).subscribe({
        next: () => {
          this.loadCows(); 
          alert('Cattle record deleted successfully.');
        },
        error: (err: any) => {
          console.error('Error deleting record:', err);
          alert('Failed to delete the record. Please try again.');
        }
      });
    }
  }
}
