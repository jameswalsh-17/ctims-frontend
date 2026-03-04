import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { HealthService } from '../../../core/services/health.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-view-health-record',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './view-health-record.component.html',
  styleUrls: ['./view-health-record.component.scss']
})
export class ViewHealthRecordComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  public record: any = null;
  public isLoading: boolean = true;
  public errorMessage: string | null = null;
  public canEdit: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private healthService: HealthService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUserValue();
    const role = user?.role;
    
    // Admin, Farm, and Vets can edit health records
    const isVet = ['Veterinary Assistant', 'Veterinary Surgeon', 'AI Technician'].includes(role);
    const isFarm = ['Admin', 'Farm Manager', 'Farm Owner', 'Farm Assistant'].includes(role);
    this.canEdit = isFarm || isVet;

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (isPlatformBrowser(this.platformId)) {
      this.healthService.getHealthRecord(id).subscribe({
        next: (data: any) => {
          this.record = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.errorMessage = "Failed to load record details.";
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/health-records']);
  }
}
