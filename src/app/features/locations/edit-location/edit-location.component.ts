import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LocationService } from '../../../core/services/location.services';

@Component({
  selector: 'app-edit-location',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-location.component.html',
  styleUrls: ['./edit-location.component.scss']
})
export class EditLocationComponent implements OnInit {
  public locationForm: FormGroup;
  public locationId!: number;
  public isLoading: boolean = true;
  public isSubmitting: boolean = false;
  public errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private locationService: LocationService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {
    this.locationForm = this.fb.group({
      farm_name: ['', Validators.required],
      address_line: ['', Validators.required],
      town: ['', Validators.required],
      county: ['', Validators.required],
      postcode: ['', Validators.required],
      last_inspection_date: ['']
    });
  }

  ngOnInit(): void {
    this.locationId = Number(this.route.snapshot.paramMap.get('id'));
    if (isPlatformBrowser(this.platformId)) {
      this.loadLocation();
    }
  }

  loadLocation(): void {
    this.locationService.getLocation(this.locationId).subscribe({
      next: (loc: any) => {
        const formattedDate = loc.last_inspection_date ? new Date(loc.last_inspection_date).toISOString().split('T')[0] : '';
        
        this.locationForm.patchValue({
          farm_name: loc.farm_name,
          address_line: loc.address_line,
          town: loc.town,
          county: loc.county,
          postcode: loc.postcode,
          last_inspection_date: formattedDate
        });
        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        this.errorMessage = 'Failed to load location details.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (this.locationForm.invalid) return;

    this.isSubmitting = true;
    this.locationService.updateLocation(this.locationId, this.locationForm.value).subscribe({
      next: () => {
        alert('Location updated successfully!');
        this.router.navigate(['/locations']);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to update location.';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }
}
