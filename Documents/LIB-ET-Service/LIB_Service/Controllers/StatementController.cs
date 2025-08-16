
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

using global::LIB.API.Application.Contracts.Persistence.LIB.API.Repositories;
using global::LIB.API.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using LIB.API.Application.Contracts.Persistent;

namespace LIB.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatementConrtoller : ControllerBase
    {
        private readonly IRefundRepository _refundRepository;
        private readonly ICoreTransactionRepository _coreTransactionRepository;

        public StatementConrtoller(IRefundRepository refundRepository, ICoreTransactionRepository coreTransactionRepository)
        {
            _refundRepository = refundRepository;
            _coreTransactionRepository = coreTransactionRepository;
        }


        [HttpGet("statements")]
        public async Task<IActionResult> GetStatementsByDateRange(DateTime startDate, DateTime endDate)
        {
            var statements = await _coreTransactionRepository.GetCoreTransactionsByDateRangeAsync(startDate, endDate);
            return Ok(statements);
        }
    }
}


