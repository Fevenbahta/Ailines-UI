


export interface Login {
  id: number;
  branch: string;
 fullName: string;
  userName: string;
  password: String;
  role: String;
  roles: String[];
  branchCode:string
  updatedBy:string;
  updatedDate:String;
  status:string,
 

}
export interface TokenResponse {
  token: string;
userData:{
  id: number;
  branch: string;
 fullName: string;
  userName: string;
  password: string;
  role: string;
  branchCode:string
  updatedBy:string;
  updatedDate:String;
  status:string
}  

}

export interface UserData {
  branch:number;
   branchName:number;
   userName:number ;
  fullName:string;
  role :string;
  createdDate:string; 
  updatedDate :string;
status:string

}


export interface ValidAccount {
  customer_Id: string;
  fulL_NAME: string;
  accountnumber: string;
  branch: string;
  telephonenumber: string;

}

export interface ECPaymentRequestDTO {
  BillerType: string;
  CustomerCode: string;
  ReferenceNo: string;
  PaymentAmount: number;
  AccountNo: string;
  InvoiceId: string;
  updatedBy: string;
  approvedBy: string;
  requestedBy: string;
}
