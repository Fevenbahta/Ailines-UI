using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading.Tasks;
using LIB.API.Application.Contracts.Persistence;
using LIB.API.Application.DTOs;
using LIB.API.Domain;
using Microsoft.EntityFrameworkCore;
using Mysqlx.Crud;

namespace LIB.API.Persistence.Repositories
{

    public class AirlinesOrderService : IAirlinesOrderService
    {
        private readonly IAirlinesOrderRepository _orderRepository;
        private readonly LIBAPIDbSQLContext _context;

        public AirlinesOrderService(IAirlinesOrderRepository orderRepository, LIBAPIDbSQLContext context)
        {
            _orderRepository = orderRepository;
            _context = context;
        }

        public async Task<OrderResponseDto?> FetchOrderAsync(OrderRequestDto request)
        {
            return await _orderRepository.GetOrderAsync( request);
        }
        public async Task<bool> IsReferenceNoUniqueAsync(string referenceNo)
        {
            // Check if the ReferenceNo already exists in the database
            var existingRequest = await _context.airlinesorder
                .FirstOrDefaultAsync(b => b.ReferenceId == referenceNo);

            return existingRequest == null; // Return true if not found, false otherwise
        }


        public async Task<IEnumerable<AirlinesOrder>> GetOrdersByStatusAsync(int status)
        {
            var orders = await _context.airlinesorder
                .Where(o => o.StatusCodeResponse == status)
                .ToListAsync();

            // Map to DTO if needed
            var result = orders.Select(o => new AirlinesOrder
            {
                Id = o.Id,
                BillerType = o.BillerType,
                PhoneNumber = o.PhoneNumber,
                AccountNo = o.AccountNo,
                OrderId = o.OrderId,
                ShortCode = o.ShortCode,
                Amount = o.Amount,
                TraceNumber = o.TraceNumber,
                StatusCodeResponse = o.StatusCodeResponse,
                StatusCodeResponseDescription = o.StatusCodeResponseDescription,
                ExpireDate = o.ExpireDate,
                CustomerName = o.CustomerName,
                MerchantId = o.MerchantId,
                MerchantCode = o.MerchantCode,
                MerchantName = o.MerchantName,
                Message = o.Message,
                Status = o.Status,
                BusinessErrorCode = o.BusinessErrorCode,
                StatusCode = o.StatusCode,
                MessageList = o.MessageList,
                LionTransactionNo = o.LionTransactionNo,
                Errors = o.Errors,
                UtilityName = o.UtilityName,
                RequestDate = o.RequestDate,
                ReferenceId = o.ReferenceId
            });


            return orders;
        }
    }
}
