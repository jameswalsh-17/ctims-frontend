import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LocationService } from '../../../core/services/location.services';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-view-location',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './view-location.component.html',
  styleUrls: ['./view-location.component.scss']
})
export class ViewLocationComponent implements OnInit {
  location: any = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  mapUrl: SafeResourceUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private locationService: LocationService,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (isPlatformBrowser(this.platformId)) {
      this.loadLocation(id);
    }
  }

  loadLocation(id: number): void {
    this.locationService.getLocation(id).subscribe({
      next: (data) => {
        this.location = data;
        
        const addressQuery = `${data.address || ''} ${data.town} ${data.postcode}`;
        const encodedQuery = encodeURIComponent(addressQuery.trim());
        
        const rawUrl = `https://maps.google.com/maps?q=${encodedQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
        this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = "Failed to load location details.";
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/locations']);
  }
}
