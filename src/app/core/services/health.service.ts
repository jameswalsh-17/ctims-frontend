import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HealthService {
  private apiUrl = `${environment.apiUrl}/health/`;

  constructor(private http: HttpClient) {}

  getAllHealthRecords(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getHealthRecord(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${id}`);
  }

  createHealthRecord(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateHealthRecord(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}${id}`, data);
  }

  deleteHealthRecord(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}${id}`);
  }

  getVets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}vets`);
  }
}
