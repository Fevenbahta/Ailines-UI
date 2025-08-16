using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LIB.API.Domain
{
    public class EtStatement
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }  // Primary key, non-nullable

        public string? OPERATION { get; set; }               // CHAR(3), nullable
        public string? DEBIT_ACC_BRANCH { get; set; }        // CHAR(5), nullable
        public string? DEBITED_ACCNO { get; set; }           // CHAR(11), nullable
        public string? DEBITED_ACCNAME { get; set; }         // CHAR(36), nullable
        public string? CEDITED_ACC_BRACH { get; set; }       // CHAR(5), nullable (keep typo or fix)
        public string? CREDITED_ACCOUNT { get; set; }        // CHAR(11), nullable
        public string? CREDITED_NAME { get; set; }           // CHAR(36), nullable
        public string? SIDE { get; set; }                     // CHAR(1), nullable
        public decimal? AMOUNT { get; set; }                  // NUMBER(19,4), nullable
        public string? REFNO { get; set; }                    // CHAR(40), nullable
        public string? USER1 { get; set; }                    // CHAR(10), nullable
        public DateTime? DATE1 { get; set; }                   // DATE, already nullable
        public string? TIME1 { get; set; }                    // CHAR(12), nullable
        public decimal RunningTotal { get; set; }
        public DateTime? UpdatedDate { get; set; } = DateTime.UtcNow; // Nullable with default value
    }
}
