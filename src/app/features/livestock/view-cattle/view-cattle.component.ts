import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CowService } from '../../../core/services/cow.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-view-cattle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './view-cattle.component.html',
  styleUrls: ['./view-cattle.component.scss']
})
export class ViewCattleComponent implements OnInit {
  private authService = inject(AuthService);
  
  public cowId!: number;
  public cow: any = null; 
  public isLoading: boolean = true;
  public errorMessage: string | null = null;
  public canEdit: boolean = false;

  constructor(
    private cowService: CowService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUserValue();
    const role = user?.role;
    this.canEdit = ['Admin', 'Farm Manager', 'Farm Owner', 'Farm Assistant'].includes(role);

    this.cowId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (isPlatformBrowser(this.platformId)) {
      this.loadCowDetails();
    }
  }

  loadCowDetails(): void {
    this.cowService.getCow(this.cowId).subscribe({
      next: (data: any) => {
        this.cow = data;
        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        this.errorMessage = "Failed to load animal details.";
        this.isLoading = false;
        this.cdr.detectChanges();
        console.error('Error fetching cow:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/my-cattle']);
  }
}
