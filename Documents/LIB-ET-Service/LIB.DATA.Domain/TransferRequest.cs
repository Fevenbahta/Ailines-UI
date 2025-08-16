using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LIB.API.Domain
{
    public class TransferRequest
    {
        [Required]
        public string AccountId { get; set; }

        public string? ReservationId { get; set; }
       
        [Required]
        public string? ReferenceId { get; set; }

        [Required]
        public Amount? Amount { get; set; }

        public string? RequestedExecutionDate { get; set; }

   
        public string? Subject { get; set; }

        public Payee? Payee { get; set; }

        [Required]
        public PaymentInformation? PaymentInformation { get; set; }

        public List<CustomField>? CustomFields { get; set; }
    }
}
