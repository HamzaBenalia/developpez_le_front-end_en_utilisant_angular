// olympic.service.ts
import { Injectable, ErrorHandler } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Country } from '../models/Country';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  private loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandler,
    private router: Router
  ) {}

  loadInitialData(): Observable<Country[]> {
    return this.http.get<Country[]>(this.olympicUrl);
  }

  getOlympics(): Observable<Country[]> {
    return this.http.get<Country[]>(this.olympicUrl);
  }

  getLoadingState(): Observable<boolean> {
    return this.loading$.asObservable();
  }
  private handleError(error: any): void {
    console.error('An error occurred:', error);
    this.errorHandler.handleError(error);
  }
}
