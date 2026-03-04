import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BreedingService {
  private apiUrl = `${environment.apiUrl}/breeding/`; // Adjust if your Flask route is different!

  constructor(private http: HttpClient) {}

  getAllBreedingRecords(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getBreedingRecord(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${id}`);
  }

  createBreedingRecord(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateBreedingRecord(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}${id}`, data);
  }

  deleteBreedingRecord(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}${id}`);
  }
}