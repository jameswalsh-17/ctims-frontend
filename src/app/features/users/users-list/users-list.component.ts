import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/farm.models';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit {
  public users: User[] = [];
  public pendingUsers: User[] = [];
  public isLoading: boolean = true;
  public errorMessage: string | null = null;

  constructor(
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadAll();
    }
  }

  loadAll(): void {
    this.isLoading = true;
    this.loadUsers();
    this.loadPending();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data: any) => {
        this.users = data;
        this.checkLoadingComplete();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load user records.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadPending(): void {
    this.userService.getPendingUsers().subscribe({
      next: (data: any) => {
        this.pendingUsers = data;
        this.checkLoadingComplete();
      },
      error: (err) => console.error('Failed to load pending users', err)
    });
  }

  checkLoadingComplete(): void {
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  approveUser(userId: number, username: string): void {
    if (confirm(`Approve access for "${username}"?`)) {
      this.userService.approveUser(userId).subscribe({
        next: () => {
          alert('User approved!');
          this.loadAll();
        },
        error: (err) => alert('Failed to approve user.')
      });
    }
  }

  rejectUser(userId: number, username: string): void {
    if (confirm(`Reject and delete the request from "${username}"?`)) {
      this.userService.rejectUser(userId).subscribe({
        next: () => {
          alert('Request rejected.');
          this.loadAll();
        },
        error: (err) => alert('Failed to reject user.')
      });
    }
  }

  deleteUser(userId: number, username: string): void {
    if (confirm(`Are you sure you want to delete user "${username}"? This cannot be undone.`)) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.loadUsers();
          alert('User deleted successfully.');
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          alert('Failed to delete user.');
        }
      });
    }
  }
}
