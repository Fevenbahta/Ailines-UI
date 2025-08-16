using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Threading;
using System.Threading.Tasks;
using LIB.API.Application.Contracts.Persistent;

namespace LIB.API.Persistence.Services
{
    public class ETCoreTransactionTaskService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public ETCoreTransactionTaskService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _scopeFactory.CreateScope())
                    {
                        //var transactionRepo = scope.ServiceProvider.GetRequiredService<ICoreTransactionRepository>();

                        //await transactionRepo.SyncCoreTransactionsToMSSQLAsync();
                    }
                }
                catch (Exception)
                {
                    // Optionally handle errors, but no logging as requested.
                }

                // Wait for 5 minutes before running again
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }
    }
}
