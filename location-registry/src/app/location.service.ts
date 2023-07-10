import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private baseUrl = 'http://api.example.com'; // Replace with your API URL

  constructor(private http: HttpClient) {}

  getStates(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/states`);
  }

  getDistricts(stateId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/districts?stateId=${stateId}`);
  }

  getCities(pinCode: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/cities?pinCode=${pinCode}`);
  }
}
