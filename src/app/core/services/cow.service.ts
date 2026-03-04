import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cow } from '../models/farm.models';

@Injectable({
  providedIn: 'root'
})
export class CowService {
  private apiUrl = `${environment.apiUrl}/cows/`; 

  constructor(private http: HttpClient) { }

  getCows(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getCow(id: number): Observable<Cow> {
    return this.http.get<Cow>(`${this.apiUrl}${id}`);
  }

  addCow(cowData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, cowData);
  }

  updateCow(id: number, cowData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}${id}`, cowData);
  }

  deleteCow(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}${id}`);
  }

  getCowProfile(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${id}/profile`);
  }

  uploadCowImage(cowId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file); 
    
    return this.http.post<any>(`${this.apiUrl}${cowId}/image`, formData);
  }
}
