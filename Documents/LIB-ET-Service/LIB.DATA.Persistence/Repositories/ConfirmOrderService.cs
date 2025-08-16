using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using LIB.API.Application.Contracts.Persistence;
using LIB.API.Application.DTOs;
using LIB.API.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Mysqlx.Crud;


    namespace LIB.API.Persistence.Repositories
    {
        public class ConfirmOrderService : IConfirmOrderService
        {
            private readonly IConfirmOrderRepository _confirmOrderRepository;
        private readonly LIBAPIDbSQLContext _context;

        public ConfirmOrderService(IConfirmOrderRepository confirmOrderRepository, LIBAPIDbSQLContext context)
            {
                _confirmOrderRepository = confirmOrderRepository;
            _context = context;
        }

            public async Task<TransactionResponseDto> CreateTransferAsync(decimal Amount, string DAccountNo, string OrderId, string ReferenceNo, string traceNumber, string user, string branch)
        {
                try
                {
                // Call repository method to handle the full flow (saving request, calling API, saving response)
                    return await _confirmOrderRepository.CreateTransferAsync( Amount,  DAccountNo,  OrderId,  ReferenceNo,  traceNumber,user,branch);
            }
            catch (Exception ex)
            {
                // Handle errors or log them as needed
                    throw new Exception("Error in ConfirmOrderAsync: " + ex.Message);
                }
            }

        public async Task<bool> IsReferenceNoUniqueAsync(string referenceNo)
        {
            // Check if the ReferenceNo already exists in the database
            var existingRequest = await _context.airlinestransfer
                .FirstOrDefaultAsync(b => b.ReferenceNo == referenceNo );

            return existingRequest == null; // Return true if not found, false otherwise
        }


        public async Task<AirlinesTransfer?> GetByReferenceAsync(string referenceNo)
        {
            return await _context.airlinestransfer
                .FirstOrDefaultAsync(x => x.ReferenceNo == referenceNo &&( x.ResponseStatus == "Pending" || x.ResponseStatus == "Faild"));
        }
        public async Task<List<AirlinesTransfer>> GetPendings()
        {
            return await _context.airlinestransfer
                .Where(x => x.ResponseStatus == "Pending" || x.ResponseStatus=="Faild")
                .Select(x => new AirlinesTransfer
                {
                    Id = x.Id,
                    OrderId = x.OrderId ?? "",
                    ReferenceNo = x.ReferenceNo ?? "",
                    TraceNumber = x.TraceNumber ?? "",
                    MerchantCode = x.MerchantCode ?? "",
                    RequestId = x.RequestId ?? "",
                    MsgId = x.MsgId ?? "",
                    PmtInfId = x.PmtInfId ?? "",
                    InstrId = x.InstrId ?? "",
                    EndToEndId = x.EndToEndId ?? "",
                    Amount = x.Amount,
                    DAccountNo = x.DAccountNo ?? "",
                    DAccountName = x.DAccountName ?? "",
                    CAccountNo = x.CAccountNo ?? "",
                    DAccountBranch = x.DAccountBranch ?? "",
                    CAccountName = x.CAccountName ?? "",
                    TransferDate = x.TransferDate,
                    ResponseStatus = x.ResponseStatus ?? "",
                    ErrorReason = x.ErrorReason ?? "",
                    RequestTimestamp = x.RequestTimestamp,
                    ResponseTimestamp = x.ResponseTimestamp,
                    IsSuccessful = x.IsSuccessful,
                    updatedBy = x.updatedBy ?? "",
                    approvedBy = x.approvedBy ?? "",
                    requestedBy = x.requestedBy ?? ""
                })
                .ToListAsync();
        }
        public async Task<List<AirlinesTransfer>> GetApproveds(DateTime? startDate, DateTime? endDate)
        {
            // Ensure dates are converted to UTC (with Kind set correctly)
            if (startDate.HasValue)
                startDate = DateTime.SpecifyKind(startDate.Value, DateTimeKind.Utc);

            if (endDate.HasValue)
            {
                // Set end date to the last moment of the selected day (23:59:59)
                endDate = DateTime.SpecifyKind(endDate.Value.Date.AddDays(1).AddMilliseconds(-1), DateTimeKind.Utc);
            }

            var query = _context.airlinestransfer
                .Where(x => x.ResponseStatus == "Success");

            if (startDate.HasValue)
                query = query.Where(x => x.TransferDate.HasValue && x.TransferDate.Value >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(x => x.TransferDate.HasValue && x.TransferDate.Value <= endDate.Value);

            return await query.Select(x => new AirlinesTransfer
            {
                Id = x.Id,
                OrderId = x.OrderId ?? "",
                ReferenceNo = x.ReferenceNo ?? "",
                TraceNumber = x.TraceNumber ?? "",
                MerchantCode = x.MerchantCode ?? "",
                RequestId = x.RequestId ?? "",
                MsgId = x.MsgId ?? "",
                PmtInfId = x.PmtInfId ?? "",
                InstrId = x.InstrId ?? "",
                EndToEndId = x.EndToEndId ?? "",
                Amount = x.Amount,
                DAccountNo = x.DAccountNo ?? "",
                DAccountName = x.DAccountName ?? "",
                CAccountNo = x.CAccountNo ?? "",
                DAccountBranch = x.DAccountBranch ?? "",
                CAccountName = x.CAccountName ?? "",
                TransferDate = x.TransferDate,
                ResponseStatus = x.ResponseStatus ?? "",
                ErrorReason = x.ErrorReason ?? "",
                RequestTimestamp = x.RequestTimestamp,
                ResponseTimestamp = x.ResponseTimestamp,
                IsSuccessful = x.IsSuccessful,
                updatedBy = x.updatedBy ?? "",
                approvedBy = x.approvedBy ?? "",
                requestedBy = x.requestedBy ?? ""
            }).ToListAsync();
        }

    }
}



