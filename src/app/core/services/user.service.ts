import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users/`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getPendingUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}pending`);
  }

  getUser(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${id}`);
  }

  createUser(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}register`, data);
  }

  requestAccess(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}request-access`, data);
  }

  approveUser(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}${id}/approve`, {});
  }

  rejectUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}${id}/reject`);
  }

  updateUser(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}${id}`, data);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}${id}`);
  }

  getMe(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}me`);
  }

  updateMe(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}me`, data);
  }
}
