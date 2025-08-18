import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CreateTransferBody, OrderRequestDto } from 'app/models/order.model';
import { ApiUrlService } from './apiurl.service';
import { ECPaymentRequestDTO } from 'app/models/data.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private token: string | null = null;

  constructor(private http: HttpClient, private apiUrlService: ApiUrlService) { }

  private getBasicAuthHeader(): string {
    // const username = 'LibET_SecureUser_2024_XYZ!@#';
    // const password = 'LibET@2024!SuperSecure#X9%^&*A1b2C3d4E5';
        const username = 'libair_Xv9Qz31nLmT_adminA5';
    const password = 'libair$G7!rNpZx#v04TqLu';
    const credentials = btoa(`${username}:${password}`);
    return `Basic ${credentials}`;
  }

  private fetchToken(): Promise<string> {


    const headers = new HttpHeaders({
      Authorization: this.getBasicAuthHeader()
    });

    return this.http
      .post<any>(`${this.apiUrlService.apiUrl}Auth/GenerateToken`, {}, { headers })
      .toPromise()
      .then(res => {
        this.token = res?.token || res?.Token;
        return this.token!;
      });
  }

  getOrder(dto: OrderRequestDto): Observable<any> {
    return from(this.fetchToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.http.post(`${this.apiUrlService.apiUrl}v3/get-order`, dto, { headers });
      })
    );
  }
cancelTransfer(requestId: string, user: string): Observable<any> {
  return from(this.fetchToken()).pipe(
    switchMap(token => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      // Construct URL with query parameters
      const url = `${this.apiUrlService.apiUrl}v3/CancelTransfer?requestId=${encodeURIComponent(requestId)}&user=${encodeURIComponent(user)}`;
      // POST with empty body (since parameters are in query)
      return this.http.post(url, {}, { headers });
    })
  );
}

  getTransfersByDateRange(startDate: string, endDate: string): Observable<any> {
    return from(this.fetchToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        let params = new HttpParams().set('startDate', startDate).set('endDate', endDate);
        return this.http.get(`${this.apiUrlService.apiUrl}v3/transfers-by-date-range`, { headers, params });
      })
    );
  }

  addRequest(request: ECPaymentRequestDTO): Observable<any> {
    return from(this.fetchToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.http.post(`${this.apiUrlService.apiUrl}v3/add-request`, request, { headers });
      })
    );
  }

approveTransfer(referenceNo: string, user: string, branch: string): Observable<any> {
  return from(this.fetchToken()).pipe(
    switchMap(token => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

      const url = `${this.apiUrlService.apiUrl}v3/approve?referenceNo=${encodeURIComponent(referenceNo)}&user=${encodeURIComponent(user)}&branch=${encodeURIComponent(branch)}`;

      return this.http.post(url, {}, { headers });
    })
  );
}


  getOrdersByStatus(): Observable<any> {
    return from(this.fetchToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`
        });
        return this.http.get(`${this.apiUrlService.apiUrl}v3/ordersbystatus`, { headers });
      })
    );
  }
getApproved(startDate?: string, endDate?: string): Observable<any> {
  return from(this.fetchToken()).pipe(
    switchMap(token => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });

      let params = new HttpParams();
      if (startDate) {
        params = params.set('startDate', startDate);
      }
      if (endDate) {
        params = params.set('endDate', endDate);
      }

      return this.http.get(`${this.apiUrlService.apiUrl}v3/approved`, { headers, params });
    })
  );
}

}
