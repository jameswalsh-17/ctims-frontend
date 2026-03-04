import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Since environment.apiUrl is '/api', we append '/users' to match your Flask blueprint
  private usersUrl = `${environment.apiUrl}/users`; 
  
  // This holds the current logged-in user's state
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCurrentUserValue(): any {
    return this.currentUserSubject.value;
  }

  hasRole(allowedRoles: string[]): boolean {
    const user = this.getCurrentUserValue();
    if (!user || !user.role) return false;
    return allowedRoles.includes(user.role);
  }

  // POST /api/users/login
  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.usersUrl}/login`, credentials).pipe(
      tap(response => {
        // When Flask sends back the user data, we store it in our app
        this.currentUserSubject.next(response.user || response);
      })
    );
  }

  // POST /api/users/logout
  logout(): Observable<any> {
    return this.http.post<any>(`${this.usersUrl}/logout`, {}).pipe(
      tap(() => {
        // Clear the user from Angular's memory on logout
        this.currentUserSubject.next(null);
      })
    );
  }

  // GET /api/users/me -> Great for checking if the session is still valid when the page refreshes
  checkSession(): Observable<any> {
    return this.http.get<any>(`${this.usersUrl}/me`).pipe(
      tap(response => {
        if (response) {
          this.currentUserSubject.next(response);
        } else {
          this.currentUserSubject.next(null);
        }
      })
    );
  }
}