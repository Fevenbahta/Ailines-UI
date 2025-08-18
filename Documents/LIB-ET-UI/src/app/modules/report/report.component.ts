import { Component } from '@angular/core';
import { AuthService } from 'app/service/auth.service';
import { OrderService } from 'app/service/order.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent {
  orders: any[] = [];
  filteredOrders: any[] = [];
  selectedStartDate: string | null = null;
  selectedEndDate: string | null = null;
  searchOrderId: string | null = null;
  searchAccountNo: string | null = null;

  constructor(
    private orderService: OrderService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

ngOnInit(): void {
  // If no dates are selected, use today's date as default
  const today = new Date();

  if (!this.selectedStartDate && !this.selectedEndDate) {
    // Set both start and end date to today
    this.selectedStartDate = this.formatDate(today);
    this.selectedEndDate = this.formatDate(today);
  }

  // Load orders if dates are selected
  if (this.selectedStartDate && this.selectedEndDate) {
    this.searchOrders();
  }
}

// Format the date as needed (example: 'yyyy-MM-dd')
formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}


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

  searchOrders(): void {
    if (!this.selectedStartDate || !this.selectedEndDate) {
      this.showSuccessMessage('Start date and End date are required.', true);
      return;
    }

    const finalStartDate = this.selectedStartDate;
    const finalEndDate = this.selectedEndDate;

    this.orderService.getApproved(finalStartDate, finalEndDate).subscribe({
      next: (data) => {
        this.orders = data;
        this.applyFilters();
      },
      error: (err) => {
        const feedbacks = err?.error?.feedbacks;
        if (Array.isArray(feedbacks) && feedbacks.some(f => f.code === 'SB_DS_005')) {
          // If specific "No approved orders found" error, just set empty list
          this.orders = [];
          this.filteredOrders = [];
          console.warn('No approved orders found for the given date range.');
        } else {
          console.error('Error fetching orders by status:', err);
              }
      }
    });
  }

  applyFilters(): void {
    this.filteredOrders = this.orders.filter(order => {
      const matchesOrderId = this.searchOrderId ? order.orderId.includes(this.searchOrderId) : true;
      const matchesAccountNo = this.searchAccountNo ? order.dAccountNo.includes(this.searchAccountNo) : true;

      return matchesOrderId && matchesAccountNo;
    });

    // If no orders match the filter, display a "No Data Found" message
    if (this.filteredOrders.length === 0) {
      this.showSuccessMessage('No orders found for the selected criteria.', true);
    }
  }
}
