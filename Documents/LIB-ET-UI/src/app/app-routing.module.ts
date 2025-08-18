import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DefaultComponent } from './layouts/default/default.component';
import { LoginComponent } from './modules/login/login.component';
import { AuthGuardService } from './service/auth-guard.service';
import { AdminAuthGuardService } from './service/admin-auth-guard.service';
import { ChangePasswordComponent } from './modules/change-password/change-password.component';

import { AdminAuthGuardSecondService } from './service/admin-auth-guard-second.service';
import { AdminComponent } from './modules/admin/admin.component';
import { AdminAuthAdminGuardService } from './service/admin-auth-admin-guard.service';
import { TransferComponent } from './modules/transfer/transfer.component';
import { TransferApprovalComponent } from './modules/transfer-approval/transfer-approval.component';
import { ReportComponent } from './modules/report/report.component';





const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: DefaultComponent,
    canActivate: [AuthGuardService],
    children: [
      { path: 'Change', component: ChangePasswordComponent },
   
     
      {
        path: 'Admin',
        component: AdminComponent,
        canActivate: [AdminAuthAdminGuardService],
      },
      {
        path: 'Transfer',
        component: TransferComponent,
        canActivate: [AdminAuthGuardService],
      },
      {
        path: 'TransferApproval',
        component: TransferApprovalComponent,
        canActivate: [AdminAuthGuardService]
      }, 
      {
        path: 'Report',
        component: ReportComponent,
        canActivate: [AdminAuthGuardService]
      }
   
    ]
  },
  ,
  //  {
  //       path: 'awach',
  //       loadChildren:()=>import('./modules/awach/awach.module').then(m=>m.AwachModule)
  // },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
