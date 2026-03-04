import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = `${environment.apiUrl}/locations/`; 

  constructor(private http: HttpClient) {}

  getLocations(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getLocation(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${id}`);
  }

  createLocation(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateLocation(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}${id}`, data);
  }

  deleteLocation(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}${id}`);
  }
}