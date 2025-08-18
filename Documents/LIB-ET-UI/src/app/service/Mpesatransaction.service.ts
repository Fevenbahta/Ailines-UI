import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUrlService } from './apiurl.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MpesaTransactionService {
  // Define default headers
  private defaultHeaders: HttpHeaders;

  constructor(private http: HttpClient, private apiUrlService: ApiUrlService,private authService:AuthService) {
    this.defaultHeaders = new HttpHeaders({
      'Content-Type': 'application/json', // Set the content type

    });
  }

  // Check Agent ID
  checkAgentId(agentId: string): Observable<any> {
    const body = { AgentId: agentId }; // Send parameters in the request body
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post(`/MpesaAgentIdCheck`, body
    //   , {
    //   headers: this.defaultHeaders
    // }
    ,
    httpOptions);
  }

  // Check LIB Account
  checkLibAccount(creatorBranchId: string, amount: number): Observable<any> {
    const body = {
      creatorbranchid: creatorBranchId,
      amt: amount
    };
    return this.http.post(`$/LibaccountchecklibCash`, body, {
      headers: this.defaultHeaders
    });
  }

  // Initiate Cash Transaction
  initiateCashTransaction(data: {
    creatorbranchid: string;
    AgentId: string;
    amt: number;
    email: string;
    branchName: string;
    agentname: string;
  }): Observable<any> {
    return this.http.post(
      `$/IntiateCashTransaction`,
      data,
      { headers: this.defaultHeaders }
    );
  }

  // Check Debitor Account
  checkDebitorAccount(debitorAccount: string): Observable<any> {
    const body = { DebitorAccount: debitorAccount }; // Send parameters in the request body
    return this.http.post(`$/CheckDebitorAccount`, body, {
      headers: this.defaultHeaders
    });
  }

  // Initiate Transfer Transaction
  initiateTransferTransaction(data: {
    AgentId: string;
    creatorbranchid: string;
    DebitorAccount: string;
    DebitorAccountbranchcode: string;
    amt: number;
    MakerbranchName: string;
    DebitorName: string;
    agentnamet: string;
  })
  
  : Observable<any> {

    console.log(data,"data")
    return this.http.post(
      `$/IntiateTransferTransaction`,
      data,
      { headers: this.defaultHeaders }
    );
  }

  // Post Mpesa Transaction
  postMpesaTransaction(data: {
    AuthorizedBy: string;
    Approvalbranchid: string;
    id: string;
    Agent_Lib_Acct: string;
    Mpesa_Lib_Acct: string;
    Creater_Branch_Code: string;
    Agent_Lib_Branchcode: string;
    Amount: number;
    trnstype: string;
    TrnsNo: string;
    msg: string;
    CreatedBy: string;
    ReferrenceId: string;
    checkerbranchname: string;
    Agent_Code: string;
  }): Observable<any> {
    return this.http.post(
      `$/PostMpesaTransaction`,
      data,
      { headers: this.defaultHeaders }
    );
  }

  // Post Cancel Mpesa Transaction Request
  postCancelMpesaTransactionRequest(id: string): Observable<any> {
    const body = { id }; // Send parameters in the request body
    return this.http.post(
      `$/PostCancelMpesaTransactionRequest`,
      body,
      { headers: this.defaultHeaders }
    );
  }

  // Get Transaction Start
  getTransactionStart(branchId: string): Observable<any> {
    const body = { branchid: branchId }; // Send parameters in the request body
    return this.http.post(`$/getTransactionstart`, body, {
      headers: this.defaultHeaders
    });
  }
    // Get Transaction Start
    getTransactions(): Observable<any> {
 // Send parameters in the request body
      return this.http.get(`$/getTransactionsforreceipt`, {
        headers: this.defaultHeaders
      });
    }
 

    changePassword(oldPassword: string, newPassword: string): Observable<any> {
      const url = `${this.apiUrlService.apiUrlUser}/Account/ChangePassword`;
      const token = localStorage.getItem('token'); // Retrieve the token
      console.log("Token:", token);
    
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Pass token in Authorization header
      });
    
      const body = { 
        newPassword: newPassword , 
        oldPassword:oldPassword}; // Payload
      console.log("Request Body:", body);
    
      return this.http.put(url, body, { headers });
    }
    getSuperAgentIdCheck(branchId: string): Observable<any> {
      const body = { branchid: branchId }; // Send parameters in the request body
      return this.http.post(`$/SuperAgentIdCheck`, body, {
        headers: this.defaultHeaders
      });
    }
  }
