
using LIB.API.Application.Contracts.Persistent;
using LIB.API.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LIB.API.Application.Contracts.Persistent
{
    public interface ICoreTransactionRepository : IGenericRepositoryOracle<EtStatement>
    {
        Task<List<CoreOracleETStatement>> GetallcoreAsync();
        Task SyncCoreTransactionsToMSSQLAsync();
        Task<List<EtStatement>> GetCoreTransactionsByDateRangeAsync(DateTime startDate, DateTime endDate);

    }
}
