import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DefaultModule } from './layouts/default/default.module';
import { HttpClientModule } from '@angular/common/http';
import { DeleteconfirmationComponent } from './modules/deleteconfirmation/deleteconfirmation.component';
import { LoginComponent } from './modules/login/login.component';


//import { ToastrModule } from 'ngx-toastr';
import {  NgxUiLoaderModule, NgxUiLoaderRouterModule, SPINNER} from 'ngx-ui-loader';
import {ngxUiLoaderConfig} from './shared/NgxUiLoaderConfig'
import { ConfirmationDialogModule } from './shared/components/confirmation-dialog/confirmation-dialog.module';


@NgModule({
  declarations: [
    AppComponent,

    


  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    DefaultModule,
    HttpClientModule,
    
    NgxUiLoaderModule.forRoot({
      bgsType: SPINNER.threeStrings,
    }),
    NgxUiLoaderRouterModule,
    ConfirmationDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  
 }

 

