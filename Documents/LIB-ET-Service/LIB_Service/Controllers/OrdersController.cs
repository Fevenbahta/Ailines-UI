using Microsoft.AspNetCore.Mvc;
using LIB.API.Application.Contracts.Persistence;
using LIB.API.Application.DTOs;
using LIB.API.Domain;
using System;
using System.Threading.Tasks;
using LIB.API.Persistence;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Authorization;
using Mysqlx.Crud;
using LIB.API.Persistence.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using LIB.API.Application.Contracts.Persistent;
using Microsoft.EntityFrameworkCore;

namespace LIB.API.Controllers
{
    [ApiController]
    [Route("api/v3/")]
    public class OrdersController : ControllerBase
    {
        private readonly IAirlinesOrderService _orderService;
        private readonly IDetailRepository _detailRepository;
        private readonly ICoreTransactionRepository _coreTransactionRepository;
        private readonly IConfirmOrderService _confirmOrderService;
        private readonly IConfirmOrderRepository _confirmOrderRepository;
        private readonly LIBAPIDbSQLContext _dbContext;

        public OrdersController(IAirlinesOrderService orderService, IDetailRepository detailRepository,ICoreTransactionRepository coreTransactionRepository, IConfirmOrderService confirmOrderService,IConfirmOrderRepository confirmOrderRepository, LIBAPIDbSQLContext dbContext)
        {
            _orderService = orderService;
            _detailRepository = detailRepository;
            _coreTransactionRepository = coreTransactionRepository;
            _confirmOrderService = confirmOrderService;
           _confirmOrderRepository = confirmOrderRepository;
            _dbContext = dbContext;
        }

        // Get Order

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]  // Ensures the endpoint requires a valid token

        [HttpPost("get-order")]
        public async Task<IActionResult> GetOrder([FromBody] OrderRequestDto request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.OrderId) || string.IsNullOrWhiteSpace(request.ReferenceId))
            {
                await SaveErrorToAirlinesErrorAsync(request?.OrderId, "OrderId is required.", "GetOrder", request?.ReferenceId);
                return BadRequest(GenerateErrorResponse("SB_DS_001", "OrderId is required.", "Request Validation", "Invalid Input"));
            }

            bool isReferenceNoUnique = await _orderService.IsReferenceNoUniqueAsync(request.ReferenceId);
            if (!isReferenceNoUnique)
            {
                await SaveErrorToAirlinesErrorAsync(request.OrderId, "Error: ReferenceNo must be unique.", "GetOrder", request.ReferenceId);
                return NotFound(GenerateErrorResponse("SB_DS_002", "Error: ReferenceNo must be unique.", "GetOrder", "ReferenceNo not unique"));
            }

            var order = await _orderService.FetchOrderAsync(request);
            if (order == null)
            {
                await SaveErrorToAirlinesErrorAsync(request.OrderId, "Order not found or failed to fetch.", "GetOrder", request.ReferenceId);
                return NotFound(GenerateErrorResponse("SB_DS_003", "Order not found or failed to fetch.", "Order Fetching", "Order not found"));
            }

            // If order is Expired (2), Already Paid (3), or Pending (1), return the error format
            if (order.StatusCodeResponse != 1)
            {
                return BadRequest(GenerateErrorResponse("SB_DS_004", $"Order is {order.StatusCodeResponseDescription}.", "Order Processing", order.OrderId));
            }

            return Ok(order);
        }

        private object GenerateErrorResponse(string errorCode, string message, string source, string parameterValue)
        {
            return new
            {
                returnCode = "ERROR",
                ticketId = Guid.NewGuid().ToString(),
                traceId = HttpContext.TraceIdentifier,
                feedbacks = new[]
                {
            new
            {
                code = errorCode,
                label = message,
                severity = "ERROR",
                type = "BUS",
                source = source,
                origin = "OrdersController",
                spanId = HttpContext.TraceIdentifier,
                parameters = new[]
                {
                    new { code = "0", value = parameterValue }
                }
            }
        }
            };
        }





        // Confirm Order

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]  // Ensures the endpoint requires a valid token

        [AllowAnonymous]
        [HttpPost("CreateTransfer")]

        public async Task<IActionResult> CreateTransfer([FromBody] CreateBody body)
        {
            ModelState.Clear();
            List<string> errorMessages = new List<string>();

            // Validate input fields
            if (body.Amount <= 0) errorMessages.Add("Amount must be greater than zero.");
            if (string.IsNullOrEmpty(body.DAccountNo)) errorMessages.Add("DAccountNo is required.");
            if (string.IsNullOrEmpty(body.OrderId)) errorMessages.Add("OrderId is required.");
            if (string.IsNullOrEmpty(body.ReferenceNo)) errorMessages.Add("ReferenceNo is required.");
            if (string.IsNullOrEmpty(body.TraceNumber)) errorMessages.Add("TraceNumber is required.");

            bool isReferenceNoUnique = await _confirmOrderService.IsReferenceNoUniqueAsync(body.ReferenceNo);
            if (!isReferenceNoUnique)
            {
                errorMessages.Add("Error: ReferenceNo must be unique.");
            }

            // If validation errors exist, return BadRequest
            if (errorMessages.Any())
            {
                return BadRequest(GenerateErrorResponse("SB_DS_001", "Validation failed", "Order Create Transfer", string.Join(", ", errorMessages)));
            }

            // Step 1: Fetch Order Status Before Processing Transfer
            var orderRequest = new OrderRequestDto
            {
                OrderId = body.OrderId,
                ReferenceId = body.ReferenceNo
            };

            var order = await _orderService.FetchOrderAsync(orderRequest);

            if (order == null)
            {
                return NotFound(GenerateErrorResponse("SB_DS_003", "Order not found or failed to fetch.", "CreateTransfer", "Order not found"));
            }

            // Step 2: Ensure Order Status Code is 0 Before Proceeding
            if (order.StatusCodeResponse != 1)
            {
                return BadRequest(GenerateErrorResponse("SB_DS_004", $"Order is {order.StatusCodeResponseDescription}. Cannot proceed with transfer.", "CreateTransfer", order.OrderId));
            }

            try
            {
                // Proceed with transfer
                var response = await _confirmOrderService.CreateTransferAsync(
                    body.Amount,
                    body.DAccountNo,
                    body.OrderId,
                    body.ReferenceNo,
                    body.TraceNumber,"fg","ffg"
                );

                return Ok(response);
            }
            catch (Exception ex)
            {
                await SaveErrorToAirlinesErrorAsync(body.OrderId, ex.Message, "CreateTransfer", body.ReferenceNo);

                return StatusCode(500, GenerateErrorResponse("SB_DS_003", ex.Message, "Order CreateTransfer", "Internal server error"));
            }
        }

        private async Task SaveErrorToAirlinesErrorAsync( string orderId,string errorMessage, string errorType,string refrence)
        {
            var feedback = new
            {
                Code = "SB_DS_003",  // Custom error code
                Label = errorMessage,
                Severity = "ERROR",
                Type = "BUS",
                Source = "Controller",  // Log the method name where the error occurred
                Origin = errorType,  // This is where the error happened
                SpanId = orderId,
                Parameters = new List<object>
        {
            new { Code = "0", Value = $"Error in controller for OrderId: {orderId}" }
        }
            };

            // Serialize the feedback object to JSON or a custom format
            string feedbackJson = JsonConvert.SerializeObject(feedback);
            var errorRecord = new AirlinesError
            {
                ReturnCode = "ERROR",
                TicketId = Guid.NewGuid().ToString(),
                TraceId = refrence,
                Feedbacks = feedbackJson,  // Store serialized feedback
                RequestDate = DateTime.UtcNow,
                ErrorType = errorType
            };

            _dbContext.airlineserror.Add(errorRecord);
            await _dbContext.SaveChangesAsync();
        }




        [HttpGet("transfers-by-date-range")]
        public async Task<IActionResult> GetTransfersByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            // Convert query dates to UTC to ensure consistency
            var utcStartDate = DateTime.SpecifyKind(startDate, DateTimeKind.Utc);
            var utcEndDate = DateTime.SpecifyKind(endDate, DateTimeKind.Utc);

            var transfers = await _confirmOrderRepository.GetTransfersByDateRangeAsync(utcStartDate, utcEndDate);
            return Ok(transfers);
        }


        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]  // Ensures the endpoint requires a valid token


        [HttpPost("add-request")]
        public async Task<IActionResult> AddRequest([FromBody] ECPaymentRequestDTO request)
        {
            var MerchantCode = "858682";

           

            if (request.BillerType == "Airlines")
            {
                var orderRequest = new OrderRequestDto
                {
                    OrderId = request.CustomerCode, // Adjust based on actual mapping
                    ReferenceId = request.ReferenceNo // Adjust based on actual mapping
                };

                var orderResponse = await _orderService.FetchOrderAsync(orderRequest);

                if (orderResponse == null)
                {
                    string errorMessage = "Order not found or failed to fetch.";
                
                    await SaveErrorToAirlinesErrorAsync(request.ReferenceNo, errorMessage, "OrderFetch", "ProcessTransaction");

                    return StatusCode(500, GenerateErrorResponse(request.ReferenceNo, errorMessage, "OrderFetch", "ProcessTransaction"));

                }

                // Check the order status and handle accordingly
                if (orderResponse.StatusCodeResponse != 1)
                {
                    string errorMessage = $"Order {orderResponse.StatusCodeResponseDescription}.";
                       
                    await SaveErrorToAirlinesErrorAsync(request.ReferenceNo, errorMessage, "OrderStatus", "ProcessTransaction");

                    return StatusCode(500, GenerateErrorResponse(request.ReferenceNo, errorMessage, "OrderFetch", "ProcessTransaction"));

                }

                if (orderResponse.StatusCodeResponse == 1)
                {
                    try
                    {
                        var userDetails = await _detailRepository.GetUserDetailsByAccountNumberAsync(request.AccountNo.ToString());

                        if (userDetails == null || string.IsNullOrEmpty(userDetails.BRANCH))
                        {
                            await SaveErrorToAirlinesErrorAsync("UserDetailsCheck", request.PaymentAmount.ToString(), "Account Number is invalid", request.ReferenceNo);
                            throw new Exception("User Account Number is Invalid. Transaction aborted.");
                        }

                        string DAccountBranch = userDetails?.BRANCH;
                        string DAccountName = userDetails?.FULL_NAME?.TrimEnd();
                        string CAccountNo = "00110611283";

                        // Save transfer data to AirlinesTransferTable
                        var transferRecord = new AirlinesTransfer
                        {
                            RequestId = request.ReferenceNo,
                            MsgId = "",
                            PmtInfId = "",
                            InstrId = "",
                            EndToEndId = "",
                            Amount = request.PaymentAmount,
                            DAccountNo = request.AccountNo,
                            DAccountBranch = DAccountBranch,
                            CAccountNo = CAccountNo,
                            CAccountName = "Airlines Gl",
                            ResponseStatus = "Pending", // Set status based on success or failure
                            TransferDate = DateTime.UtcNow,  // Current timestamp for when the transfer was initiated
                            OrderId = request.CustomerCode,
                            ReferenceNo = request.ReferenceNo,
                            TraceNumber = orderResponse.TraceNumber,
                            MerchantCode = MerchantCode,
                            ErrorReason = "", // Set status based on success or failure
                            IsSuccessful = false,
                            updatedBy = request.updatedBy,
                            approvedBy = request.approvedBy, // Set status based on success or failure
                            requestedBy = request.requestedBy,
                            DAccountName= DAccountName
                        };

                        // Save the transfer record to the database
                        await _dbContext.airlinestransfer.AddAsync(transferRecord);
                        await _dbContext.SaveChangesAsync();

                        var response = new { status = "success", message = "Request added successfully to the database." };
                        return Ok(response);

                    }
                    catch (Exception ex)
                    {
                        await SaveErrorToAirlinesErrorAsync(request.CustomerCode, ex.Message, "Order CreateTransfer", request.ReferenceNo);

                        return StatusCode(500, GenerateErrorResponse(request.CustomerCode, ex.Message, "Order CreateTransfer", request.ReferenceNo));

                    }
                }
            }


            // Fallback if no other conditions are met
            await SaveErrorToAirlinesErrorAsync(request.ReferenceNo, "Invalid biller type or missing conditions.", "InvalidRequest", "AddRequest");

            return StatusCode(500, GenerateErrorResponse("SB_DS_003", "Invalid biller type or missing conditions.", "Order CreateTransfer", "Internal server error"));

     

        }


        [HttpGet("validate-account/{accountNo}")]
        public async Task<ActionResult<AccountInfos>> ValidateAccount(string accountNo)
        {
            try
            {
                var accountDetails = await _confirmOrderRepository.GetUserDetailsByAccountNumberAsync(accountNo);

                if (accountDetails == null)
                {
                    return Ok(null); // Return null instead of NotFound
                }


                return Ok(accountDetails);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while validating the account.", Details = ex.Message });
            }
        }


        
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]  // Ensures the endpoint requires a valid token
                   
        [HttpPost("approve")]
            public async Task<IActionResult> SendSoap([FromQuery] string referenceNo, [FromQuery] string user, [FromQuery] string branch)
{
    var Request = await _confirmOrderService.GetByReferenceAsync(referenceNo);
    if (Request == null)
        return NotFound($"No Unpaid request found with ReferenceNo {referenceNo}");

    var orderRequest = new OrderRequestDto
    {
        OrderId = Request.OrderId,
        ReferenceId = Request.ReferenceNo
    };

    var orderResponse = await _orderService.FetchOrderAsync(orderRequest);

    if (orderResponse == null)
    {
        string errorMessage = "Order not found or failed to fetch.";

        await SaveErrorToAirlinesErrorAsync(Request.ReferenceNo, errorMessage, "OrderFetch", "ProcessTransaction");

        return StatusCode(500, GenerateErrorResponse(Request.ReferenceNo, errorMessage, "OrderFetch", "ProcessTransaction"));
    }

    if (orderResponse.StatusCodeResponse != 1)
    {
        string errorMessage = $"Order {orderResponse.StatusCodeResponseDescription}.";

        await SaveErrorToAirlinesErrorAsync(Request.ReferenceNo, errorMessage, "OrderStatus", "ProcessTransaction");

        return StatusCode(500, GenerateErrorResponse(Request.ReferenceNo, errorMessage, "OrderFetch", "ProcessTransaction"));
    }

    if (orderResponse.StatusCodeResponse == 1)
    {
        try
        {
            var responses = await _confirmOrderService.CreateTransferAsync(
                Request.Amount,
                Request.DAccountNo,
                Request.OrderId,
                Request.ReferenceNo,
                Request.TraceNumber,
                user,
                branch
            );

            return Ok(responses);
        }
        catch (Exception ex)
        {
            await SaveErrorToAirlinesErrorAsync(Request.OrderId, ex.Message, "CreateTransfer", Request.ReferenceNo);

            return StatusCode(500, GenerateErrorResponse(Request.OrderId, ex.Message, "CreateTransfer", Request.ReferenceNo));
        }
    }

    await SaveErrorToAirlinesErrorAsync(Request.ReferenceNo, "Invalid biller type or missing conditions.", "InvalidRequest", "AddRequest");

    return StatusCode(500, GenerateErrorResponse("SB_DS_003", "Invalid biller type or missing conditions.", "Order CreateTransfer", "Internal server error"));
}


        [HttpGet("ordersbystatus")]
        public async Task<IActionResult> GetOrdersByStatus()
        {
            try
            {
                var orders = await _confirmOrderService.GetPendings();

                if (orders == null || !orders.Any())  // Check if the list is null or empty
                {
                    return NotFound(GenerateErrorResponse("SB_DS_005", "No orders found with the given status.", "GetOrdersByStatus", "Status: Pending"));
                }

                return Ok(orders);
            }
            catch (Exception ex)
            {
                await SaveErrorToAirlinesErrorAsync("N/A", ex.Message, "GetOrdersByStatus", "Status: Pending");
                return StatusCode(500, GenerateErrorResponse("SB_DS_006", ex.Message, "GetOrdersByStatus", "Internal Server Error"));
            }
        }

        [HttpGet("approved")]
        public async Task<IActionResult> GetApprovedOrders([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            try
            {
                var orders = await _confirmOrderService.GetApproveds(startDate, endDate);

                if (orders == null || !orders.Any())
                {
                    return NotFound(GenerateErrorResponse("SB_DS_005", "No approved orders found in the given date range.", "GetApprovedOrders", $"StartDate: {startDate}, EndDate: {endDate}"));
                }

                return Ok(orders);
            }
            catch (Exception ex)
            {
                await SaveErrorToAirlinesErrorAsync("N/A", ex.Message, "GetApprovedOrders", $"StartDate: {startDate}, EndDate: {endDate}");
                return StatusCode(500, GenerateErrorResponse("SB_DS_006", ex.Message, "GetApprovedOrders", "Internal Server Error"));
            }
        }




        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpPost("airlinesTransfer")]
        public async Task<IActionResult> RequestAndApprove([FromBody] ECPaymentRequestDTO request)
        {
            var MerchantCode = "858682";




            if (!await _orderService.IsReferenceNoUniqueAsync(request.ReferenceNo))
            {
                string errorMessage = $"ReferenceNo {request.ReferenceNo} already exists. Duplicate not allowed.";
                await SaveErrorToAirlinesErrorAsync(request.ReferenceNo, errorMessage, "DuplicateCheck", "ProcessTransaction");

                return Conflict(GenerateErrorResponse(request.ReferenceNo, errorMessage, "DuplicateCheck", "ProcessTransaction"));
            }
            if (request.PaymentAmount <= 0)
            {
                string errorMessage = "Invalid amount. Payment amount must be greater than zero.";
                await SaveErrorToAirlinesErrorAsync(request.ReferenceNo, errorMessage, "Validation", "ProcessTransaction");
                return BadRequest(GenerateErrorResponse(request.ReferenceNo, errorMessage, "Validation", "ProcessTransaction"));
            }


            var orderRequest = new OrderRequestDto
                {
                    OrderId = request.CustomerCode,
                    ReferenceId = request.ReferenceNo
                };

                var orderResponse = await _orderService.FetchOrderAsync(orderRequest);

                if (orderResponse == null)
                {
                    string errorMessage = "Order not found or failed to fetch.";
                    await SaveErrorToAirlinesErrorAsync(request.ReferenceNo, errorMessage, "OrderFetch", "ProcessTransaction");
                    return StatusCode(500, GenerateErrorResponse(request.ReferenceNo, errorMessage, "OrderFetch", "ProcessTransaction"));
                }

                if (orderResponse.StatusCodeResponse != 1)
                {
                    string errorMessage = $"Order {orderResponse.StatusCodeResponseDescription}.";
                    await SaveErrorToAirlinesErrorAsync(request.ReferenceNo, errorMessage, "OrderStatus", "ProcessTransaction");
                    return StatusCode(500, GenerateErrorResponse(request.ReferenceNo, errorMessage, "OrderStatus", "ProcessTransaction"));
                }

                try
                {
                    // 1. Get user details
                    var userDetails = await _detailRepository.GetUserDetailsByAccountNumberAsync(request.AccountNo.ToString());
                    if (userDetails == null || string.IsNullOrEmpty(userDetails.BRANCH))
                    {
                        await SaveErrorToAirlinesErrorAsync("UserDetailsCheck", request.PaymentAmount.ToString(), "Account Number is invalid", request.ReferenceNo);
                        throw new Exception("User Account Number is Invalid. Transaction aborted.");
                    }

                    string DAccountBranch = userDetails.BRANCH;
                string DAccountName = userDetails?.FULL_NAME?.TrimEnd();
                string CAccountNo = "";

                    // 2. Save transfer record
                    var transferRecord = new AirlinesTransfer
                    {
                        RequestId = request.ReferenceNo,
                        MsgId = "",
                        PmtInfId = "",
                        InstrId = "",
                        EndToEndId = "",
                        Amount = request.PaymentAmount,
                        DAccountNo = request.AccountNo,
                        DAccountBranch = DAccountBranch,
                        CAccountNo = CAccountNo,
                        CAccountName = "Airlines Gl",
                        ResponseStatus = "Pending",
                        TransferDate = DateTime.UtcNow,
                        OrderId = request.CustomerCode,
                        ReferenceNo = request.ReferenceNo,
                        TraceNumber = request.InvoiceId,
                        MerchantCode = MerchantCode,
                        ErrorReason = "",
                        IsSuccessful = false,
                        updatedBy = request.updatedBy,
                        approvedBy = request.approvedBy,
                        requestedBy = request.requestedBy,
                        DAccountName = DAccountName
                    };

                    await _dbContext.airlinestransfer.AddAsync(transferRecord);
                    await _dbContext.SaveChangesAsync();

                    // 3. Immediately approve by calling CreateTransfer
                    var approveResponse = await _confirmOrderService.CreateTransferAsync(
                        request.PaymentAmount,
                        request.AccountNo,
                        request.CustomerCode,
                        request.ReferenceNo,
                        request.InvoiceId,
                        request.approvedBy, // assuming this is the user
                        DAccountBranch
                    );

                    return Ok(new
                    {
                        status = "success",
                        message = "Request and approval processed successfully.",
               
                    });
                }
                catch (Exception ex)
                {
                    await SaveErrorToAirlinesErrorAsync(request.CustomerCode, ex.Message, "UnifiedRequestAndApprove", request.ReferenceNo);
                    return StatusCode(500, GenerateErrorResponse(request.CustomerCode, ex.Message, "UnifiedRequestAndApprove", request.ReferenceNo));
                }
            

          
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpPost("CancelTransfer")]
        public async Task<IActionResult> CancelTransfer(string requestId, string user)
        {
            var transferRecord = await _dbContext.airlinestransfer
                .FirstOrDefaultAsync(t => t.RequestId == requestId);

            if (transferRecord == null)
            {
                return NotFound($"Transfer with RequestId {requestId} not found.");
            }

            try
            {
                // Normalize RequestTimestamp
                if (transferRecord.RequestTimestamp.Kind != DateTimeKind.Utc)
                    transferRecord.RequestTimestamp = DateTime.SpecifyKind(transferRecord.RequestTimestamp, DateTimeKind.Utc);

                // Normalize ResponseTimestamp if it has a value
                if (transferRecord.ResponseTimestamp.HasValue && transferRecord.ResponseTimestamp.Value.Kind != DateTimeKind.Utc)
                    transferRecord.ResponseTimestamp = DateTime.SpecifyKind(transferRecord.ResponseTimestamp.Value, DateTimeKind.Utc);

                // Normalize TransferDate (make sure it is UTC)
         
                // Update cancellation info
                transferRecord.ResponseStatus = "Cancelled";
                transferRecord.IsSuccessful = false;
                transferRecord.ErrorReason = "Cancelled";
                transferRecord.updatedBy = user;
                transferRecord.TransferDate = DateTime.UtcNow;

                _dbContext.airlinestransfer.Update(transferRecord);
                await _dbContext.SaveChangesAsync();

                return Ok(transferRecord);
            }
            catch (Exception ex)
            {
                // Check each datetime separately to identify the problematic field
                try
                {
                    if (transferRecord.RequestTimestamp.Kind != DateTimeKind.Utc)
                        throw new Exception("RequestTimestamp is not UTC");
                }
                catch { return BadRequest("Invalid DateTime in RequestTimestamp"); }

                try
                {
                    if (transferRecord.ResponseTimestamp.HasValue && transferRecord.ResponseTimestamp.Value.Kind != DateTimeKind.Utc)
                        throw new Exception("ResponseTimestamp is not UTC");
                }
                catch { return BadRequest("Invalid DateTime in ResponseTimestamp"); }

              
                // If none above caught, return general error with message
                return StatusCode(500, $"Error cancelling transfer: {ex.Message}");
            }
        }


        [HttpGet("statements")]
        public async Task<IActionResult> GetStatementsByDateRange(DateTime startDate, DateTime endDate)
        {
            var statements = await _coreTransactionRepository.GetCoreTransactionsByDateRangeAsync(startDate, endDate);
            return Ok(statements);
        }

    }
}
