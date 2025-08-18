import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationDialogService } from './services/confirmation-dialog.service';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';



@NgModule({
  declarations: [ConfirmationDialogComponent],
  exports:[ConfirmationDialogComponent],
  imports: [
    CommonModule,
    MatDialogModule
  ],
  providers: [ ConfirmationDialogService ]
})
export class ConfirmationDialogModule { }
