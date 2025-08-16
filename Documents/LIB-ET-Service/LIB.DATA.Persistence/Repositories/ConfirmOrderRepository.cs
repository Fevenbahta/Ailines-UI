using System;
using System.Buffers;
using System.Drawing;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using LIB.API.Application.Contracts.Persistence;
using LIB.API.Application.Contracts.Persistent;
using LIB.API.Application.DTOs;
using LIB.API.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.Extensions.Configuration;
using Oracle.ManagedDataAccess.Client;
using static Microsoft.AspNetCore.Hosting.Internal.HostingApplication;

namespace LIB.API.Persistence.Repositories
{
    public class ConfirmOrderRepository : IConfirmOrderRepository
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly LIBAPIDbSQLContext _context;
        private readonly LIBAPIDbContext _context2;
        private readonly IConfiguration _configuration;
        private readonly SoapClient _soapClient;
        private readonly IDetailRepository _detailRepository;

        // Constructor to inject dependencies
        public ConfirmOrderRepository(IHttpClientFactory httpClientFactory, LIBAPIDbSQLContext context, LIBAPIDbContext context2, IConfiguration configuration,
             SoapClient soapClient, IDetailRepository detailRepository)
        {
            _httpClientFactory = httpClientFactory;
            _context = context;
            _context2 = context2;
            _configuration = configuration;
          _soapClient = soapClient;
            _detailRepository = detailRepository;
        }

        // Method to confirm order asynchronously
        public async Task<TransactionResponseDto> CreateTransferAsync(
        decimal Amount,
        string DAccountNo,
        string OrderId,
        string ReferenceNo,
        string traceNumber,
         string user,
        string branch
  )
        {
            try
            {
                var userDetails = await _detailRepository.GetUserDetailsByAccountNumberAsync(DAccountNo);

                if (userDetails == null || string.IsNullOrEmpty(userDetails.BRANCH))
                {
                    await LogErrorToAirlinesErrorAsync("UserDetailsCheck", DAccountNo, "Account Number is invalid", "", "CreateTransfer", ReferenceNo);
                    throw new Exception("User Account Number  is Invalid. Transaction aborted.");
                }

                string DAccountBranch = userDetails?.BRANCH;
                string DAccountName = userDetails?.FULL_NAME?.TrimEnd();
                string CAccountNo = "00110611283";
                string MerchantCode = "858682";

                bool transferSuccess = await CreateTransferAsync(Amount, DAccountNo, DAccountBranch, CAccountNo, ReferenceNo
       , traceNumber, MerchantCode, OrderId,user,branch);

                if (!transferSuccess)
                {
                    await LogErrorToAirlinesErrorAsync("Transfer", DAccountNo, "reason", "", "CreateTransfer", ReferenceNo);
                    throw new Exception("Transfer failed. Transaction aborted.");
                }

                var confirmOrder = new ConfirmOrders
                {
                    OrderId = OrderId,
                    Amount =(double)Amount,
                    Currency = "ETB",
                    Status = "1",
                    Remark = "Transfer Successful",
                    TraceNumber = traceNumber,
                    ReferenceNumber = ReferenceNo,
                    PaidAccountNumber = DAccountNo,
                    PayerCustomerName = DAccountName,
                    ShortCode = MerchantCode,
                    RequestDate = DateTime.UtcNow
                };

                await _context.confirmorders.AddAsync(confirmOrder);
                await _context.SaveChangesAsync();

                string baseUrl = "https://flyprod.ethiopianairlines.com/";
               // string baseUrl = "http://flygateapitestvpn.azurewebsites.net/";
                string url = $"{baseUrl}Lion/api/V1.0/Lion/ConfirmOrder";
                string username = "LionProd@ethiopianairlines.com";
                string password = "Lion@28#2&FJD*Q!03390";

               // string username = "lionbanktest @ethiopianairlines.com";
                //string password = "LI*&%@54778Ba";
                // Encode username and password for Basic Authentication

                string credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{username}:{password}"));

                var request = new HttpRequestMessage(HttpMethod.Post, url);
                var jsonContent = JsonSerializer.Serialize(confirmOrder);
                request.Content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                // Create HttpClient and set authorization header
                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", credentials);
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                var response = await client.SendAsync(request);
                var jsonResponse = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    // Handle API error logging
                    await LogErrorToAirlinesErrorAsync(
                        "API Error",
                        confirmOrder.OrderId.ToString(),
                        "Failed",
                        jsonResponse,
                        "ConfirmOrder", ReferenceNo

                    );
                  
                }

                var confirmOrderResponse = JsonSerializer.Deserialize<ConfirmOrderResponseDto>(jsonResponse);

                // Map response fields
                confirmOrder.ExpireDate = confirmOrderResponse?.expireDate ?? "";


                confirmOrder.StatusCodeResponse = confirmOrderResponse?.statusCodeResponse ?? 0;
                confirmOrder.StatusCodeResponseDescription = confirmOrderResponse?.statusCodeResponseDescription ?? "Empty response";
                confirmOrder.CustomerName = confirmOrderResponse?.customerName ?? "Empty response";
                confirmOrder.MerchantId = confirmOrderResponse?.merchantId ?? 0;
                confirmOrder.MerchantCode = confirmOrderResponse?.merchantCode ?? "Empty response";
                confirmOrder.MerchantName = confirmOrderResponse?.merchantName ?? "Empty response";
                confirmOrder.Message = confirmOrderResponse?.message ?? "Empty response";
                confirmOrder.ResponseDate = DateTime.UtcNow;
                confirmOrder.Status = confirmOrderResponse?.status != null ? "1" : "0";

                // Update database
                _context.confirmorders.Update(confirmOrder);
                await _context.SaveChangesAsync();
                // Return only the StatusCodeResponse and OrderId
                return new TransactionResponseDto
                {
                    Status ="Successful Transaction",
                       Id = ReferenceNo
                };
            }
            catch (Exception ex)
            {
                await LogErrorToAirlinesErrorAsync("ConfirmOrderAsync", DAccountNo, "ShortCode", ex.Message, "ConfirmOrder", ReferenceNo);
                throw new Exception("Error in ConfirmOrderAsync: " + ex.Message);
            }
        }


        public async Task<bool> CreateTransferAsync(
           decimal Amount,
           string DAccountNo,
           string DAccountBranch,
           string CAccountNo,
           string RefrenceNo, string TraceNumber,
           string MerchantCode,
           string OrderId,
           string user,
           string branch)
        {
            // Generate unique identifiers for the transfer
            string requestId = GenerateRequestId();
            string msgId = GenerateMsgId();
            string pmtInfId = RefrenceNo;
            string pmtInfId2 = GeneratePmtInfId();
            string instrId = GenerateInstrId();
            string endToEndId = GenerateEndToEndId();

            // Get current timestamp
            var formattedDate = GetCurrentTimestamp();

            // Define SOAP Action
            string soapAction = "createTransfer";

            // Create the XML request (same as your current code)
            string xmlRequest = $@"

        <soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' xmlns:amp='http://soprabanking.com/amplitude'>
          <soapenv:Header/>
          <soapenv:Body>
            <amp:createTransferRequestFlow>
              <amp:requestHeader>
                <amp:requestId>{requestId}</amp:requestId>
                <amp:serviceName>createTransfer</amp:serviceName>
                <amp:timestamp>{formattedDate}</amp:timestamp>
              <amp:originalName>TRASAPI</amp:originalName>
                <amp:userCode>LIBTRANAPP</amp:userCode>
              </amp:requestHeader>
              <amp:createTransferRequest>
                <amp:canal>TRANSPORT_CHANNEL</amp:canal>
                <amp:pain001><![CDATA[
                <Document xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns='urn:iso:std:iso:20022:tech:xsd:pain.001.001.03DB'>
                  <CstmrCdtTrfInitn>
                    <GrpHdr>
                      <MsgId>{msgId}</MsgId>
                      <CreDtTm>{formattedDate}</CreDtTm>
                      <NbOfTxs>1</NbOfTxs>
                      <CtrlSum>{Amount}</CtrlSum>
                      <InitgPty/>
                      <DltPrvtData>
                        <FlwInd>PROD</FlwInd>
                        <DltPrvtDataDtl>
                          <PrvtDtInf>TRANSPORT_CHANNEL</PrvtDtInf>
                          <Tp>
                            <CdOrPrtry>
                              <Cd>CHANNEL</Cd>
                            </CdOrPrtry>
                          </Tp>
                        </DltPrvtDataDtl>
                      </DltPrvtData>
                    </GrpHdr>
                    <PmtInf>
                      <PmtInfId>{pmtInfId2}</PmtInfId> <!-- Unique PmtInfId for each request -->
                      <PmtMtd>TRF</PmtMtd>
                      <BtchBookg>0</BtchBookg>
                      <NbOfTxs>1</NbOfTxs>
                      <CtrlSum>{Amount}</CtrlSum>
                      <DltPrvtData>
                        <OrdrPrties>
                          <Tp>IMM</Tp>
                          <Md>CREATE</Md>
                        </OrdrPrties>
                      </DltPrvtData>
                      <PmtTpInf>
                        <InstrPrty>NORM</InstrPrty>
                        <SvcLvl>
                          <Prtry>INTERNAL</Prtry>
                        </SvcLvl>
                      </PmtTpInf>
                      <ReqdExctnDt>1901-01-01</ReqdExctnDt>
                      <Dbtr>
                      </Dbtr>
                      <DbtrAcct>
                        <Id>
                          <Othr>
                            <Id>{DAccountNo}</Id>
                            <SchmeNm>
                              <Prtry>BKCOM_ACCOUNT</Prtry>
                            </SchmeNm>
                          </Othr>
                        </Id>
                        <Ccy>ETB</Ccy>
                      </DbtrAcct>
                      <DbtrAgt>
                        <FinInstnId>
                          <Nm>BANQUE</Nm>
                          <Othr>
                            <Id>00011</Id>
                            <SchmeNm>
                              <Prtry>ITF_DELTAMOP_IDETAB</Prtry>
                            </SchmeNm>
                          </Othr>
                        </FinInstnId>
                        <BrnchId>
                          <Id>{DAccountBranch}</Id>
                          <Nm>Agence</Nm>
                        </BrnchId>
                      </DbtrAgt>
                      <CdtTrfTxInf>
                        <PmtId>
                          <InstrId>{instrId}</InstrId>
                          <EndToEndId>{endToEndId}</EndToEndId>
                        </PmtId>
                        <Amt>
                          <InstdAmt Ccy='ETB'>{Amount}</InstdAmt>
                        </Amt>
                        <CdtrAgt>
                          <FinInstnId>
                            <Nm>BANQUE</Nm>
                            <Othr>
                              <Id>00011</Id>
                              <SchmeNm>
                                <Prtry>ITF_DELTAMOP_IDETAB</Prtry>
                              </SchmeNm>
                            </Othr>
                          </FinInstnId>
                          <BrnchId>
                            <Id>00129</Id>
                            <Nm>Agence</Nm>
                          </BrnchId>
                        </CdtrAgt>
                        <Cdtr>
                        </Cdtr>
                        <CdtrAcct>
                          <Id>
                            <Othr>
                              <Id>{CAccountNo}</Id>
                              <SchmeNm>
                                <Prtry>BKCOM_ACCOUNT</Prtry>
                              </SchmeNm>
                            </Othr>
                          </Id>
                          <Ccy>ETB</Ccy>
                        </CdtrAcct>
                        <RmtInf>
                          <Ustrd>{pmtInfId}</Ustrd>
                        </RmtInf>
                      </CdtTrfTxInf>
                    </PmtInf>
                  </CstmrCdtTrfInitn>
                </Document>
                ]]></amp:pain001>
              </amp:createTransferRequest>
            </amp:createTransferRequestFlow>
          </soapenv:Body>
        </soapenv:Envelope>";


            // Send the SOAP request
            //var soapResponse = await _soapClient.SendSoapRequestAsync("https://10.1.7.85:8095/createTransfer", xmlRequest, soapAction);
            var soapResponse = await _soapClient.SendSoapRequestAsync("https://10.1.10.12:8095/createTransfer", xmlRequest, soapAction);

            // Handle the SOAP response
            var (isSuccess, reason) = _soapClient.IsSuccessfulResponse(soapResponse);

            // Save transfer data to AirlinesTransferTable
            var existingTransfer = await _context.airlinestransfer
           .FirstOrDefaultAsync(x => x.ReferenceNo == RefrenceNo);

            if (existingTransfer != null)
            {
                // ✏️ Update existing record
                existingTransfer.MsgId = msgId;
                existingTransfer.PmtInfId = pmtInfId2;
                existingTransfer.InstrId = instrId;
                existingTransfer.EndToEndId = endToEndId;
                existingTransfer.Amount = Amount;
                existingTransfer.DAccountNo = DAccountNo;
                existingTransfer.DAccountBranch = DAccountBranch;
                existingTransfer.CAccountNo = CAccountNo;
                existingTransfer.ResponseStatus = isSuccess ? "Success" : "Faild";
                existingTransfer.TransferDate = DateTime.UtcNow;
                existingTransfer.TraceNumber = TraceNumber;
                existingTransfer.MerchantCode = MerchantCode;
                existingTransfer.OrderId = OrderId;
                existingTransfer.ErrorReason = reason;
                existingTransfer.IsSuccessful = isSuccess;
                existingTransfer.approvedBy = user;
                existingTransfer.requestedBy = branch;
                existingTransfer.ResponseTimestamp = DateTime.UtcNow;
                existingTransfer.RequestTimestamp= DateTime.SpecifyKind(existingTransfer.RequestTimestamp, DateTimeKind.Utc);
                _context.airlinestransfer.Update(existingTransfer);
            }
            else
            {
                // 🚨 Throw exception if transfer does not exist
                throw new ArgumentException($"Invalid ReferenceNo: {RefrenceNo}. Transfer not found.");
            }

            if (!isSuccess)
            {
                // Log the error if the response is not successful

               await LogErrorToAirlinesErrorAsync("Transfer", DAccountNo, "reason", reason, "CreateTransfer", RefrenceNo);
            }

     
            await _context.SaveChangesAsync();
            return isSuccess;
        }


        private async Task LogErrorToAirlinesErrorAsync(string methodName, string orderId, string shortCode, string errorMessage, string errorType, string reference)
        {
            var feedback = new
            {
                Code = "SB_DS_003",  // Custom error code
                Label = errorMessage,
                Severity = "ERROR",
                Type = "BUS",
                Source = methodName,  // Log the method name where the error occurred
                Origin = "AirlinesConfirmOrderRepository",  // This is where the error happened
                SpanId = orderId,
                Parameters = new List<object>
        {
            new { Code = "0", Value = $"Error in {methodName} for OrderId: {orderId}, ShortCode: {shortCode}" }
        }
            };

            // Serialize the feedback object to JSON or a custom format
            string feedbackJson = JsonSerializer.Serialize(feedback);

            var errorRecord = new AirlinesError
            {
                ReturnCode = "ERROR",
                TicketId = Guid.NewGuid().ToString(),
                TraceId = reference,
                Feedbacks = feedbackJson,  // Store serialized feedback
                RequestDate = DateTime.UtcNow,
                ErrorType = errorType
            };

            _context.airlineserror.Add(errorRecord);
            await _context.SaveChangesAsync();
        }


        private string GenerateRequestId() => GenerateNumericId(17);

        private string GenerateMsgId() => GenerateAlphanumericId(24);


        private string GeneratePmtInfId()
        {
            string alphanumericId = GenerateAlphanumericId(10); // Generate 17 alphanumeric characters
            return "ET" + alphanumericId;
        }


        private string GenerateInstrId() => GenerateAlphanumericId(32);

        private string GenerateEndToEndId() => GenerateAlphanumericId(30);

        private string GenerateNumericId(int length)
        {
            Random random = new Random();
            return new string(Enumerable.Range(0, length)
                .Select(_ => (char)('0' + random.Next(10))).ToArray());
        }

        private string GenerateAlphanumericId(int length)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            Random random = new Random();
            return new string(Enumerable.Range(0, length)
                .Select(_ => chars[random.Next(chars.Length)]).ToArray());
        }

        private string GetCurrentTimestamp() => DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:sszzz");
        public async Task<List<AirlinesTransfer>> GetTransfersByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            // Ensure the dates are in UTC
            var utcStartDate = DateTime.SpecifyKind(startDate, DateTimeKind.Utc);
            var utcEndDate = DateTime.SpecifyKind(endDate, DateTimeKind.Utc);

            // Get the transfers from the database
            var transfers = await _context.airlinestransfer
                .Where(at => (at.TransferDate >= utcStartDate && at.TransferDate <= utcEndDate) || at.TransferDate == null)
                .ToListAsync();


            // Ensure null values are replaced with empty strings or default values
            foreach (var transfer in transfers)
            {
                transfer.OrderId = transfer.OrderId ?? string.Empty;
                transfer.ReferenceNo = transfer.ReferenceNo ?? string.Empty;
                transfer.TraceNumber = transfer.TraceNumber ?? string.Empty;
                transfer.MerchantCode = transfer.MerchantCode ?? string.Empty;
                transfer.RequestId = transfer.RequestId ?? string.Empty;
                transfer.MsgId = transfer.MsgId ?? string.Empty;
                transfer.PmtInfId = transfer.PmtInfId ?? string.Empty;
                transfer.InstrId = transfer.InstrId ?? string.Empty;
                transfer.EndToEndId = transfer.EndToEndId ?? string.Empty;
                transfer.DAccountNo = transfer.DAccountNo ?? string.Empty;
                transfer.CAccountNo = transfer.CAccountNo ?? string.Empty;
                transfer.DAccountBranch = transfer.DAccountBranch ?? string.Empty;
                transfer.CAccountName = transfer.CAccountName ?? string.Empty;
                transfer.ResponseStatus = transfer.ResponseStatus ?? string.Empty;
                transfer.ErrorReason = transfer.ErrorReason ?? string.Empty;
                transfer.ResponseTimestamp = transfer.ResponseTimestamp ?? default(DateTime); // default DateTime value
            }

            return transfers;
        }


        public async Task<AccountInfos> GetUserDetailsByAccountNumberAsync(string accountNumber)
        {


            var query2 = @"
SELECT *
FROM anbesaprod.valid_accounts2
WHERE ACCOUNTNUMBER = :accountNumber"
            ;

            var accountNumberParameter = new OracleParameter("accountNumber", accountNumber);
            var userDetails2 = await _context2.AccountInfos
                .FromSqlRaw(query2, accountNumberParameter)
                .FirstOrDefaultAsync();




            return (userDetails2);
        }



    }
}
