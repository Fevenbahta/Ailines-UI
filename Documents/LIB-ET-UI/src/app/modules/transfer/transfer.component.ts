import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderRequestDto } from 'app/models/order.model';
import { AuthService } from 'app/service/auth.service';
import { IfrsTransactionService } from 'app/service/Ifrstransaction.service';
import { OrderService } from 'app/service/order.service';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.css']
})
export class TransferComponent {
  searchForm!: FormGroup;
  requestForm!: FormGroup;
  showRequestForm = false;
  step: number = 1;
  selectedCustomer: string = '';
  role: string;
  branch: string;
  services: string;
  user: string;
  errorMessage: string = ''; // ✅ Error message variable

  constructor(
    private ngxService: NgxUiLoaderService,
    private fb: FormBuilder,
    private orderService: OrderService,
    private toastr: ToastrService,
    private authService: AuthService,
    private ifrsTransactionService: IfrsTransactionService
  ) {}

  ngOnInit(): void {
       if (localStorage.getItem('reloadOnce') === 'true') {
      localStorage.removeItem('reloadOnce'); // Prevent further reloads
    } else{window.location.reload(); // Reloads the page
    localStorage.setItem('reloadOnce', 'true'); // Set flag
    }
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData) {
      this.role = userData.role;
      this.services = userData.services || [];
      this.user = userData.userName;
    }

    this.searchForm = this.fb.group({
      CustomerCode: ['', Validators.required]
    });

    this.requestForm = this.fb.group({
      BillerType: [''],
      CustomerCode: [''],
      ReferenceNo: [''],
      PaymentAmount: ['', Validators.required],
      AccountNo: ['', Validators.required],
      InvoiceId: [''],
      updatedBy: [this.user],
      approvedBy: [''],
      requestedBy: [this.branch]
    });
  }

  generateReferenceId(): string {
    const digits = Math.floor(1000000000 + Math.random() * 9000000000);
    return `ETBR${digits}`;
  }

  accountInfo: {
    customer_Id?: string;
    fulL_NAME?: string;
    accountnumber?: string;
    branch?: string;
    telephonenumber?: string;
  } = {};

  verifyAccount(): void {
    this.ngxService.start();
    const accountNo = this.requestForm.get('AccountNo')?.value;
    if (!accountNo) {
      this.showError('Please enter an account number.');
      return;
    }

    this.ifrsTransactionService.validateAccount(accountNo).subscribe({
      next: (data) => {
        console.log('Account verification response:', data);
        this.accountInfo = {
          customer_Id: data.customer_Id,
          fulL_NAME: data.fulL_NAME,
          accountnumber: data.accountnumber,
          branch: data.branch,
          telephonenumber: data.telephonenumber
        };
            if (this.accountInfo.accountnumber) {
      this.goToStep(3);
    } else {
      this.showError('Invalid Account No');
    }
        this.toastr.success('Account verified successfully!', 'Success');
        this.ngxService.stop();
      },
      error: (err) => {
        console.error(err);
        this.accountInfo = {};
        this.showError(err.error.message || 'Account verification failed');
        this.ngxService.stop();
      }
    });
  }

  goToStep3(): void {
    this.ngxService.start();
    if (!this.requestForm.get('AccountNo')?.value) {
      this.showError('Please enter Account No before continuing.');
      this.ngxService.stop();
      return;
    }

    this.verifyAccount();

    this.ngxService.stop();
  }

  fetchOrder(): void {
    this.ngxService.start();
    const dto: OrderRequestDto = {
      orderId: this.searchForm.value.CustomerCode,
      referenceId: this.generateReferenceId(),
      billerType: "Airlines",
      phoneNumber: "",
      accountNo: " "
    };

    this.orderService.getOrder(dto).subscribe({
      next: (data) => {
        this.requestForm.patchValue({
          BillerType: "Airlines",
          CustomerCode: dto.orderId,
          ReferenceNo: dto.referenceId,
          PaymentAmount: data.amount,
          InvoiceId: " "
        });
        this.selectedCustomer = data.customerName;
        this.showRequestForm = true;
        this.goToStep(2);
        this.toastr.success('Order details fetched successfully!', 'Success', {
          timeOut: 2000,
          positionClass: 'toast-top-right',
          closeButton: true
        });
        this.ngxService.stop();
      },
      error: (err) => {
        this.selectedCustomer = "";
        this.ngxService.stop();
        this.showRequestForm = true;
        this.showError(err.error.feedbacks?.[0]?.label || 'Error fetching order details');
      }
    });
  }

  goToStep(stepNum: number): void {
    this.step = stepNum;
  }

  submitRequest(): void {
    this.ngxService.start();
    this.requestForm.value.customerCode = this.requestForm.value.customerCode?.trim();

    console.log(this.requestForm.value);
    this.orderService.addRequest(this.requestForm.value).subscribe({
      next: () => {
        this.clearFormAndGoToStep1();
        this.toastr.success('Request successfully added!', 'Success', {
          timeOut: 2000,
          positionClass: 'toast-top-right',
          closeButton: true
        });
        this.ngxService.stop();
      },
      error: (err) => {
        console.error(err);
        this.ngxService.stop();
        this.showError(err.error.feedbacks?.[0]?.label || 'Error submitting request');
      }
    });
  }

  clearFormAndGoToStep1(): void {
    this.searchForm = this.fb.group({
      CustomerCode: ['', Validators.required]
    });

    this.requestForm = this.fb.group({
      BillerType: [''],
      CustomerCode: [''],
      ReferenceNo: [''],
      PaymentAmount: ['', Validators.required],
      AccountNo: ['', Validators.required],
      InvoiceId: [''],
      updatedBy: [this.user],
      approvedBy: [''],
      requestedBy: [this.branch]
    });

    this.showRequestForm = false;
    this.goToStep(1);
    this.selectedCustomer = '';
  }

  showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }
}
