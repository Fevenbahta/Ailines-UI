using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LIB.API.Application.DTOs;
using LIB.API.Domain;

namespace LIB.API.Application.Contracts.Persistence
{
    public interface IConfirmOrderRepository
    {
        Task<TransactionResponseDto> CreateTransferAsync(decimal Amount, string DAccountNo, string OrderId, string ReferenceNo, string traceNumber,string user, string branch);
        Task<List<AirlinesTransfer>> GetTransfersByDateRangeAsync(DateTime startDate, DateTime endDate);

        Task<AccountInfos> GetUserDetailsByAccountNumberAsync(string accountNumber);

    }

}
