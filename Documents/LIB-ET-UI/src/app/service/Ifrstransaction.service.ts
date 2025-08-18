import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { ApiUrlService } from './apiurl.service';
import {   UserData, ValidAccount } from 'app/models/data.model';


@Injectable({
  providedIn: 'root'
})
export class IfrsTransactionService {
 
  //readonly apiUrl = 'https://localhost:7008/';
  
  padNumber(num: string, targetLength: number): string {
    return num.padStart(targetLength, '0');
  }
  padNumberS(num: String, targetLength: number): string {
    return num.padStart(targetLength, '0');
  }
  constructor(private http: HttpClient,private apiUrlService: ApiUrlService) { }

 

  deleteIfrsTransaction(Id: number): Observable<string> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.delete<string>(this.apiUrlService.apiUrl + 'IfrsTransaction/' + Id+'/' , httpOptions);
  }
validateAccount(accountNo: string): Observable<ValidAccount> {
    return this.http.get<ValidAccount>(`${this.apiUrlService.apiUrl}V3/validate-account/${accountNo}`);
  }
 getUserDetails(branch: string, userName: string, role: string): Observable<any> {
  const paddedBranch = this.padNumber(branch, 5);
  const paddedRole = this.padNumberS(role, 4);

  const params = new HttpParams()
    .set('branch', branch)
    .set('userName', userName)
    .set('role', role);
  const url = `${this.apiUrlService.apiValidUserUrl}IfrsTransaction/GetUserDetail`;

  return this.http.get<any>(url, { params })
    .pipe(
   
    );
}

GetUserDetailByUserName(userName: string): Observable<any> {


  const params = new HttpParams()
   
    .set('userName', userName)

  const url = `${this.apiUrlService.apiUrl}IfrsTransaction/GetUserDetailByUserName`;

  return this.http.get<any>(url, { params })
    .pipe(
   
    );
}
CheckAccountBalance(branch: string, account: string, amount: number): Observable<any> {
  // Prepare query parameters
  let params = new HttpParams()
    .set('branch', branch)
    .set('account', account)
    .set('amount', amount.toString());

  // Make GET request to API endpoint
  return this.http.get<any>(`${this.apiUrlService.apiUrl}IfrsTransaction/CheckAccountBalance`, { params: params });
}
getAllOutRtgs(): Observable<any> {
  return this.http.get<any>(this.apiUrlService.apiUrl + 'IfrsTransaction/GetAllOutRtgs');
}


}
