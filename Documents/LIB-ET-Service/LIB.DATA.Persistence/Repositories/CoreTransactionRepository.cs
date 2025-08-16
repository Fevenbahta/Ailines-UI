
using LIB.API.Application.Contracts.Persistent;
using LIB.API.Domain;
using LIB.API.Persistence;
using LIBPROPERTY.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Oracle.ManagedDataAccess.Client;
using Org.BouncyCastle.Asn1.X509;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace LIB.API.Persistence.Repositories
{
    public class CoreTransactionRepository : GenericRepositoryOracle<EtStatement>, ICoreTransactionRepository
    {
        private readonly LIBAPIDbContext _context;
        private readonly LIBAPIDbSQLContext _contextsql;

        private readonly HttpClient _httpClient;
        public CoreTransactionRepository(LIBAPIDbContext context, LIBAPIDbSQLContext contextsql) : base(context)
        {
            _context = context;
            _contextsql = contextsql;

        }


        public async Task<List<CoreOracleETStatement>> GetallcoreAsync()
        {
            try
            {
                var query = @"
        SELECT *
        FROM anbesaprod.et_history";

                var CoreTransactionList = await _context.CoreOracleETStatement
                    .FromSqlRaw(query)
                    .ToListAsync();

                return CoreTransactionList;
            }
            catch (Exception ex)
            {
                // Log the error properly (replace with ILogger if available)
                Console.WriteLine($"Error in GetallcoreAsync: {ex.Message}");

                // Return an empty list to avoid breaking the application
                return new List<CoreOracleETStatement>();
            }
        }


        public async Task SyncCoreTransactionsToMSSQLAsync()
        {
            try
            {
                Console.WriteLine("Starting transaction synchronization from Oracle to MSSQL...");

                // Step 1: Fetch transactions from Oracle
                var oracleTransactions = await GetallcoreAsync();

                if (!oracleTransactions.Any())
                {
                    Console.WriteLine("No transactions found in Oracle.");
                    return;
                }

                var existingTransactionIds = await _contextsql.EtStatement
                    .Select(t => t.REFNO) // Assuming TransactionId is a unique identifier
                    .ToListAsync();

                // Step 3: Filter out already existing records
                var newTransactions = oracleTransactions
                    .Where(t => !existingTransactionIds.Contains(t.REFNO))
                    .ToList();

                if (newTransactions.Any())
                {
                    var mappedTransactions = newTransactions.Select(transaction => new EtStatement
                    {
                        REFNO = transaction.REFNO,
                        OPERATION = transaction.OPERATION,
                        DEBIT_ACC_BRANCH = transaction.DEBIT_ACC_BRANCH,
                        DEBITED_ACCNO = transaction.DEBITED_ACCNO,
                        DEBITED_ACCNAME = transaction.DEBITED_ACCNAME,
                        CREDITED_ACCOUNT = transaction.CREDITED_ACCOUNT,
                        CEDITED_ACC_BRACH = transaction.CEDITED_ACC_BRACH, // 1:1 name match, typo preserved
                        CREDITED_NAME = transaction.CREDITED_NAME,
                        SIDE = transaction.SIDE,
                        AMOUNT = transaction.AMOUNT,
                        USER1 = transaction.USER1,
                        DATE1 = transaction.DATE1.HasValue
    ? DateTime.SpecifyKind(transaction.DATE1.Value, DateTimeKind.Local).ToUniversalTime()
    : (DateTime?)null,

                        TIME1 = transaction.TIME1,
                        RunningTotal = 0,
                        UpdatedDate =DateTime.UtcNow,
                    }).ToList();
                    // Step 5: Insert new transactions into MSSQL
                    await _contextsql.EtStatement.AddRangeAsync(mappedTransactions);
                    await _contextsql.SaveChangesAsync();
                    //await _contextsql.Database.ExecuteSqlRawAsync("EXEC UpdateRunningTotal");

                    Console.WriteLine($"Inserted {newTransactions.Count} new transactions into MSSQL.");
                }
                else
                {
                    Console.WriteLine("No new transactions to insert.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error occurred while synchronizing transactions: {ex.Message}");
                throw;
            }
        }
        public async Task<List<EtStatement>> GetCoreTransactionsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                // Ensure the DateTime values are UTC
                if (startDate.Kind == DateTimeKind.Unspecified)
                    startDate = DateTime.SpecifyKind(startDate, DateTimeKind.Utc);
                else
                    startDate = startDate.ToUniversalTime();

                if (endDate.Kind == DateTimeKind.Unspecified)
                    endDate = DateTime.SpecifyKind(endDate, DateTimeKind.Utc);
                else
                    endDate = endDate.ToUniversalTime();

                // Query CoreTransactions by date range and order by DATE1 only
                var transactions = await _contextsql.EtStatement
                    .Where(t => t.DATE1 >= startDate && t.DATE1 <= endDate)
                    .OrderByDescending(t => t.DATE1)
                    .ToListAsync();

                return transactions;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetCoreTransactionsByDateRangeAsync: {ex.Message}");
                return new List<EtStatement>();
            }
        }




    }
}
