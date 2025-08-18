export interface OrderRequestDto {
    orderId: string;
    referenceId: string;
    billerType: string
    phoneNumber: string,
    accountNo: string
  }
  
  export interface CreateTransferBody {
    amount: number;
    dAccountNo: string;
    orderId: string;
    referenceNo: string;
    traceNumber: string;
  }
  