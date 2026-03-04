import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private apiUrl = `${environment.apiUrl}/audit/`;

  constructor(private http: HttpClient) {}

  // We add an optional limit parameter, defaulting to 50 just like your backend
  getAuditLogs(limit: number = 50): Observable<any[]> {
    let params = new HttpParams().set('limit', limit.toString());
    return this.http.get<any[]>(this.apiUrl, { params });
  }
}