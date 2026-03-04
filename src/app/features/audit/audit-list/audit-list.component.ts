import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuditService } from '../../../core/services/audit.service';

@Component({
  selector: 'app-audit-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-list.component.html',
  styleUrls: ['./audit-list.component.scss']
})
export class AuditListComponent implements OnInit {
  public logs: any[] = [];
  public isLoading: boolean = true;
  public errorMessage: string | null = null;
  public limit: number = 50;

  constructor(
    private auditService: AuditService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadAuditLogs();
    }
  }

  loadAuditLogs(): void {
    this.isLoading = true;
    this.auditService.getAuditLogs(this.limit).subscribe({
      next: (data: any) => {
        this.logs = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to load system audit logs.';
        this.isLoading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  onLimitChange(event: any): void {
    const newLimit = event.target.value;
    this.limit = Number(newLimit);
    this.loadAuditLogs();
  }
}
