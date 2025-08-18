import { Component, ElementRef, ViewChild } from '@angular/core';
import { OrderService } from 'app/service/order.service';
import { ToastrService } from 'ngx-toastr';  // Import ToastrService
import { AuthService } from 'app/service/auth.service';  // Import AuthService
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-transfer-approval',
  templateUrl: './transfer-approval.component.html',
  styleUrls: ['./transfer-approval.component.css']
})
export class TransferApprovalComponent {
  orders: any[] = [];
   approvalSlips: any[] = [];
  @ViewChild('printSection') printSection!: ElementRef;
  constructor(
     private ngxService: NgxUiLoaderService,
    private orderService: OrderService,
    private toastr: ToastrService,
    private authService: AuthService,
  ) {}
 role: string;
  branch: string;
  services: string;
  user: string;
  errorMessage: string = '';

  ngOnInit(): void {
       if (localStorage.getItem('reloadOnce') === 'true') {
      localStorage.removeItem('reloadOnce'); // Prevent further reloads
    } else{window.location.reload(); // Reloads the page
    localStorage.setItem('reloadOnce', 'true'); // Set flag
    }
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');

    if (userData ) {
      this.role = userData.role;
      this.services = userData.services || [];
      this.user = userData.userName;
    }
 this.orderService.getOrdersByStatus().subscribe({
      next: (data) => {
        this.orders = data;
        console.log('Orders:', data);
        this.ngxService.stop();
      },
      error: (err) => {
        this.ngxService.stop();
        console.error('Error fetching orders by status:', err);
      }
    });
 
  }

  // Success and error notification method
  showSuccessMessage(message: string, isError: boolean = false): void {
    if (isError) {
      this.toastr.error(message, 'Error', {
        timeOut: 1000,
        positionClass: 'toast-top-right',
        closeButton: true
      });
    } else {
      this.toastr.success(message, 'Success', {
        timeOut: 1000,
        positionClass: 'toast-top-right',
        closeButton: true
      });
    }
  }
cancelOrder(order: any): void {
  this.ngxService.start();
  console.log('Cancelling order:', order);

  this.orderService.cancelTransfer(order.referenceNo, this.user).subscribe({
    
    next: (response) => {
      console.log(response,"respo")
      this.ngxService.stop();
      
      this.loadOrdersByStatus();  // refresh orders list
      this.showSuccessMessage('Order cancelled successfully!');
    },
    error: (error) => {
         console.log(error,"respo")
 
      this.ngxService.stop();
      this.errorMessage = error?.error || 'Error cancelling the order.';
      this.showSuccessMessage(this.errorMessage, true);
    }
  });
}

  loadOrdersByStatus(): void {
    this.ngxService.start();
     this.orderService.getOrdersByStatus().subscribe({
      next: (data) => {
        this.orders = data;
        console.log('Orders:', data);
        
        this.ngxService.stop();
      },
      error: (err) => {
         this.orders = [];
        this.ngxService.stop();
        console.error('Error fetching orders by status:', err);
      }
    });
  }
printSlip(order: any): void {
  const printContent = `
    <div class="approval-slip">
      <a>
        <img src="/assets/img/LIBLogo2.jpg" class="logo-img" />
        <span class="slip-title">LION INTERNATIONAL BANK S.C</span>
      </a>
      <p class="date">Date .....: ${new Date(order.transferDate).toLocaleString('en-GB', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
        hour12: false
      })}</p>

      <div class="left-section">
        <h6 class="cooperative-name">${order.referenceNo === 'Cash' ? 'CASH DEPOSIT SAVING' : 'ACCOUNT TO ACCOUNT TRANSFER'} ACC. SLIP No. ${order.orderId}</h6>
        <p class="teller">Inputing Branch .....: ${order.dAccountBranch}</p>
        <p class="currency">Currency ...: ETB ETHIOPIAN BIRR</p>
        <p class="teller">Authorized By .....: ${order.updatedBy}</p>
        <hr class="slip-divider">
        <div class="slip-section">
          <p>MR / MRS ......: ${order.dAccountName}</p>
          <p>Debit Account No ....... ${order.dAccountNo}</p>
          <p>Debited Account Branch ......: ${order.dAccountBranch}</p>
          <p>Depositor Phone  ......: </p>
          <p>Member ID ........: </p>
        </div>
      </div>

      <div class="right-section">
        <div class="slip-section">
          <p>Credit Account Owner .......: ${order.cAccountName}</p>
          <p>Credit Account Number .....: ${order.cAccountNo}</p>
          <p>Credit Account Branch .....: ${order.dAccountBranch}</p>
          <p>Amount ......: ${Number(order.amount).toFixed(2)} ETB</p>
          <p>Transaction Type .....: ${order.referenceNo}</p>
        </div>
      </div>

      <div class="clear"></div>

      <div style="text-align:center; margin-top: 30px;">
        <button onclick="window.print()">🖨️ Print Slip</button>
      </div>
    </div>
  `;

  const printWindow = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=1,status=0');

  printWindow!.document.open();
  printWindow!.document.write(`
    <html>
      <head>
        <title>Print Slip</title>
        <style>
          body { margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 14px; }
          .approval-slip { max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #000; }
          .logo-img { width: 10%; height: 5%; margin-left: 120px; }
          .slip-title, .cooperative-name, .branch, .date, .teller { font-size: 14px; font-weight: normal; color: black; }
          .header { display: flex; align-items: center; justify-content: center; }
          .slip-divider { border: 0; height: 1px; background: #000; margin: 10px 0; }
          .slip-section { box-sizing: border-box; padding: 10px; }
          .slip-section p { margin: 5px 0; text-align: left; }
          .clear { clear: both; }
          .right-align { text-align: right; }
          .left-section { float: left; width: 50%; }
          .right-section { float: left; width: 50%; margin-top: 27%; }
          .slip-title span { text-align: center; font-size: 16px; font-weight: bold; }
          .date { text-align: right; font-size: 14px; font-family: 'Courier New', Courier, monospace; }
          button { font-size: 14px; padding: 8px 16px; cursor: pointer; }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
    </html>
  `);
  printWindow!.document.close();
}




approveOrder(order: any): void {
  this.ngxService.start();
  console.log('Approving order:', order);

  order.approvedBy = this.user;
  order.requestedBy = this.branch;

  this.orderService.approveTransfer(order.referenceNo, this.user, this.branch).subscribe({
    next: (response) => {
      this.ngxService.stop();
       this.approvalSlips = [order];
      this.loadOrdersByStatus();
      this.showSuccessMessage('Order approved successfully!');
  this.approvalSlips = [order];
    },
    error: (error) => {
      this.ngxService.stop();
      this.errorMessage = error?.error?.feedbacks?.[0]?.label || 'Error approving the order.';
    }
  });
}


}
