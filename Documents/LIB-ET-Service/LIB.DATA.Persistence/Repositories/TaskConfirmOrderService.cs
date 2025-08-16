using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using LIB.API.Application.DTOs;
using LIB.API.Domain;
using Microsoft.EntityFrameworkCore;

namespace LIB.API.Persistence.Repositories
{
    public class TaskConfirmOrderService
    {
        private readonly LIBAPIDbSQLContext _context;
        private readonly IHttpClientFactory _httpClientFactory;

        public TaskConfirmOrderService(LIBAPIDbSQLContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
        }
        string shortcode = "858682";
        public async Task<bool> ProcessConfirmOrdersAsync()
        {
            List<ConfirmOrders> ordersToConfirm;

            try
            {
                // Use projection to safely handle possible nulls
                ordersToConfirm = await _context.confirmorders
                                                .Where(o => o.Status == "0") // unconfirmed
                                                .Select(o => new ConfirmOrders
                                                {
                                                    OrderId = o.OrderId ?? "",
                                                    Amount = o.Amount, // ensure decimal/double match
                                                    Currency = o.Currency ?? "ETB",
                                                    Status = o.Status ?? "",
                                                    Remark = o.Remark ?? "",
                                                    TraceNumber = o.TraceNumber??"",
                                                    ReferenceNumber = o.ReferenceNumber ?? "",
                                                    PaidAccountNumber = o.PaidAccountNumber ?? "",
                                                    PayerCustomerName = o.PayerCustomerName ?? "",
                                                    ShortCode = o.ShortCode ?? shortcode,
                                                    RequestDate =  DateTime.UtcNow,
                                                    ExpireDate = o.ExpireDate ??""
                                                })
                                                .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching orders: {ex.Message}");
                ordersToConfirm = new List<ConfirmOrders>();
            }

            if (ordersToConfirm == null || !ordersToConfirm.Any())
            {
                return false; // no orders
            }

            foreach (var order in ordersToConfirm)
            {
                var confirmOrderRequest = new ConfirmOrders
                {
                    OrderId = order.OrderId,
                    Amount = order.Amount,
                    Currency = "ETB",
                    Status = "1",
                    Remark = "Transfer Successful",
                    TraceNumber = order.TraceNumber,
                    ReferenceNumber = order.ReferenceNumber,
                    PaidAccountNumber = order.PaidAccountNumber,
                    PayerCustomerName = order.PayerCustomerName,
                    ShortCode = shortcode,
                    RequestDate = DateTime.UtcNow
                };

                bool confirmationResult = await ConfirmOrderAsync(confirmOrderRequest);

                if (confirmationResult)
                {
                    order.Status = "1"; // mark as confirmed
                    order.RequestDate = DateTime.UtcNow;
                    _context.Update(order);
                    await _context.SaveChangesAsync();
                }
            }

            return true;
        }

        private async Task<bool> ConfirmOrderAsync(ConfirmOrders confirmOrder)
        {
            string apiUrl = " https://flyprod.ethiopianairlines.com/Lion/api/V1.0/Lion/ConfirmOrder";

            string username = "LionProd@ethiopianairlines.com";
            string password = "Lion@28#2&FJD*Q!03390";
            string credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{username}:{password}"));

            var request = new HttpRequestMessage(HttpMethod.Post, apiUrl);
            var jsonContent = JsonSerializer.Serialize(confirmOrder);
            request.Content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", credentials);
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var response = await client.SendAsync(request);
            var jsonResponse = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                // Log error if API call fails
                await LogErrorToAirlinesErrorAsync(
                    "API Error",
                    confirmOrder.OrderId.ToString(),
                    "Failed",
                    jsonResponse,
                    "ConfirmOrder",
                    confirmOrder.OrderId.ToString()
                );

                return false;
            }

            var confirmOrderResponse = JsonSerializer.Deserialize<ConfirmOrderResponseDto>(jsonResponse);

            if (confirmOrderResponse == null)
            {
                // Log error if the response deserialization fails
                await LogErrorToAirlinesErrorAsync(
                    "Deserialization Error",
                    confirmOrder.OrderId.ToString(),
                    "Failed",
                    "Invalid JSON response",
                    "ConfirmOrder",
                    confirmOrder.OrderId.ToString()
                );

                return false;
            }

            // Update order with API response
            confirmOrder.ExpireDate = confirmOrderResponse?.expireDate;
            confirmOrder.StatusCodeResponse = confirmOrderResponse?.statusCodeResponse ?? 0;
            confirmOrder.StatusCodeResponseDescription = confirmOrderResponse?.statusCodeResponseDescription ?? "Empty response";
            confirmOrder.CustomerName = confirmOrderResponse?.customerName ?? "Empty response";
            confirmOrder.MerchantId = confirmOrderResponse?.merchantId ?? 0;
            confirmOrder.MerchantCode = confirmOrderResponse?.merchantCode ?? "Empty response";
            confirmOrder.MerchantName = confirmOrderResponse?.merchantName ?? "Empty response";
            confirmOrder.Message = confirmOrderResponse?.message ?? "Empty response";
            confirmOrder.ResponseDate = DateTime.UtcNow;
            confirmOrder.Status = confirmOrderResponse?.status != null ? "1" : "0";
            // Save updates to the database
            _context.Update(confirmOrder);
            await _context.SaveChangesAsync();

            return true;
        }

        // Error logging method
        private async Task LogErrorToAirlinesErrorAsync(string errorType, string orderId, string result, string errorMessage, string function, string refundReferenceCode)
        {
            // Implement logging logic here (e.g., write to a log file, database, or external service)
            await Task.CompletedTask;
        }
    }

}
