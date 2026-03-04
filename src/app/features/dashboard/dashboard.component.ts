import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CowService } from '../../core/services/cow.service';
import { LocationService } from '../../core/services/location.services'; 
import { HealthService } from '../../core/services/health.service';     
import { BreedingService } from '../../core/services/breeding.service'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private cowService = inject(CowService);
  private locationService = inject(LocationService);
  private healthService = inject(HealthService);
  private breedingService = inject(BreedingService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  totalCattle: number = 0;
  totalMale: number = 0;
  totalFemale: number = 0;

  allCows: any[] = [];
  selectedCowId: string = '';
  cowProfile: any = null;
  isLoadingProfile: boolean = false;

  recentCows: any[] = [];
  recentHealth: any[] = [];
  recentBreeding: any[] = [];
  nextInspectionFarm: any = null;

  breedStats: { name: string, count: number, percentage: number }[] = [];
  statusStats: { name: string, count: number, color: string, percentage: number }[] = [];

  isLoading: boolean = true;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isLoading = false;
      this.loadDashboardData();
    }
  }

  loadDashboardData(): void {
    this.cowService.getCows().subscribe({
      next: (cows: any) => {
        const cowArray = Array.isArray(cows) ? cows : cows.data || cows.cows || [];
        this.allCows = cowArray;
        
        this.totalCattle = cowArray.length;
        this.totalMale = cowArray.filter((c: any) => c.sex?.toLowerCase() === 'male').length;
        this.totalFemale = cowArray.filter((c: any) => c.sex?.toLowerCase() === 'female').length;

        this.calculateAnalytics(cowArray);

        this.recentCows = cowArray.sort((a: any, b: any) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        }).slice(0, 3);
        
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Failed to load cows', err)
    });

    this.locationService.getLocations().subscribe({
      next: (locations: any) => {
        const locArray = Array.isArray(locations) ? locations : locations.data || locations.locations || [];
        const farmsWithDates = locArray.filter((l: any) => l.last_inspection_date);
        
        farmsWithDates.sort((a: any, b: any) => {
          return new Date(a.last_inspection_date).getTime() - new Date(b.last_inspection_date).getTime();
        });

        if (farmsWithDates.length > 0) {
          this.nextInspectionFarm = farmsWithDates[0];
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Failed to load locations', err)
    });

    this.healthService.getAllHealthRecords().subscribe({
      next: (records: any) => {
        const healthArray = Array.isArray(records) ? records : records.data || records.records || [];
        this.recentHealth = healthArray.sort((a: any, b: any) => {
          const dateA = a.visit_date ? new Date(a.visit_date).getTime() : 0;
          const dateB = b.visit_date ? new Date(b.visit_date).getTime() : 0;
          return dateB - dateA;
        }).slice(0, 3);
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Failed to load health records', err)
    });

    this.breedingService.getAllBreedingRecords().subscribe({
      next: (records: any) => {
        const breedArray = Array.isArray(records) ? records : records.data || records.records || [];
        this.recentBreeding = breedArray.sort((a: any, b: any) => {
          const dateA = a.service_date ? new Date(a.service_date).getTime() : 0;
          const dateB = b.service_date ? new Date(b.service_date).getTime() : 0;
          return dateB - dateA;
        }).slice(0, 3);
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Failed to load breeding records', err)
    });
  }

  calculateAnalytics(cows: any[]): void {
    const total = cows.length;
    if (total === 0) return;

    const breedCounts: any = {};
    const statusCounts: any = { 'active': 0, 'sold': 0, 'deceased': 0 };

    cows.forEach(cow => {
      const b = cow.breed || 'Unknown';
      breedCounts[b] = (breedCounts[b] || 0) + 1;

      const s = (cow.status || 'active').toLowerCase();
      if (statusCounts.hasOwnProperty(s)) {
        statusCounts[s]++;
      } else {
        statusCounts[s] = (statusCounts[s] || 0) + 1;
      }
    });

    this.breedStats = Object.keys(breedCounts).map(name => ({
      name,
      count: breedCounts[name],
      percentage: Math.round((breedCounts[name] / total) * 100)
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    const statusColors: any = {
      'active': '#40c057',
      'sold': '#339af0',
      'deceased': '#fa5252'
    };

    this.statusStats = Object.keys(statusCounts).map(name => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count: statusCounts[name],
      color: statusColors[name] || '#adb5bd',
      percentage: Math.round((statusCounts[name] / total) * 100)
    })).filter(s => s.count > 0);
  }

  onCowSelected(): void {
    if (!this.selectedCowId) {
      this.cowProfile = null;
      return;
    }

    const selectedCowFromList = this.allCows.find(c => (c.cow_id || (c as any).id) === +this.selectedCowId);

    this.isLoadingProfile = true;
    this.cowService.getCowProfile(+this.selectedCowId).subscribe({
      next: (profile: any) => {
        this.cowProfile = profile;
        
        if (this.cowProfile.cow && selectedCowFromList && !this.cowProfile.cow.farm_name) {
          this.cowProfile.cow.farm_name = selectedCowFromList.farm_name;
        }

        this.isLoadingProfile = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load cow profile', err);
        this.isLoadingProfile = false;
        this.cdr.detectChanges();
      }
    });
  }

  downloadReport(): void {
    window.print();
  }

  clearSearch(): void {
    this.selectedCowId = '';
    this.cowProfile = null;
  }
}
