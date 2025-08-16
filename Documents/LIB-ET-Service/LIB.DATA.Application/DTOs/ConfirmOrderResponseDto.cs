using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LIB.API.Application.DTOs
{
    public class ConfirmOrderResponseDto
    {
        public string orderId { get; set; }
        public string shortCode { get; set; }
        public double amount { get; set; }
        public string currency { get; set; }
        public int status { get; set; } // 1 = Success, 0 = Error
        public string remark { get; set; }
        public string traceNumber { get; set; }
        public string referenceNumber { get; set; }
        public string paidAccountNumber { get; set; }
        public string payerCustomerName { get; set; }

        // Response Fields
        public string expireDate { get; set; }
        public int statusCodeResponse { get; set; }
        public string statusCodeResponseDescription { get; set; }
        public string customerName { get; set; }
        public long merchantId { get; set; }
        public string merchantCode { get; set; }
        public string merchantName { get; set; }

        // Optional Message Field for Additional Response Info
        public string message { get; set; }
    }

}
