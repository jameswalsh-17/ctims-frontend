import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LocationService } from '../../../core/services/location.services';
import { AuthService } from '../../../core/auth/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-locations-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './locations-list.component.html',
  styleUrls: ['./locations-list.component.scss']
})
export class LocationsListComponent implements OnInit {
  private authService = inject(AuthService);
  
  public locations: any[] = [];
  public isLoading: boolean = true;
  public errorMessage: string | null = null;
  public canEdit: boolean = false;

  constructor(
    private locationService: LocationService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUserValue();
    const role = user?.role;
    
    this.canEdit = ['Admin', 'Farm Manager', 'Farm Owner', 'Farm Assistant'].includes(role);

    if (isPlatformBrowser(this.platformId)) {
      this.loadLocations();
    }
  }

  loadLocations(): void {
    this.locationService.getLocations().subscribe({
      next: (data: any) => {
        this.locations = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to load locations.';
        this.isLoading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  deleteLocation(id: number): void {
    if (confirm('Are you sure you want to delete this farm location?')) {
      this.locationService.deleteLocation(id).subscribe({
        next: () => {
          this.locations = this.locations.filter((loc: any) => loc.location_id !== id);
          this.cdr.detectChanges();
          alert('Location deleted successfully.');
        },
        error: (err: any) => {
          alert('Failed to delete location.');
          console.error(err);
        }
      });
    }
  }
}
