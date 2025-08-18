import { Injectable } from '@angular/core';
import { ConfirmationDialogComponent } from '../confirmation-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Injectable()
export class ConfirmationDialogService {

  constructor(private dialog:MatDialog,) { }

  openConfirmationDialog(confirmationAlertData?: any) {
    return new Promise((resolve, reject) => {
      const matDialogConfig: MatDialogConfig = {
        // width: confirmationAlertData && confirmationAlertData.width ? confirmationAlertData.width : COMMON.DELETE_ALERT_WIDTH,
        height: confirmationAlertData && confirmationAlertData.height ? confirmationAlertData.height : "auto",
        data: confirmationAlertData,
        panelClass: [
          'animated',
          'slideInDown'
        ],
      };

      const dialogRef = this.dialog.open(ConfirmationDialogComponent, matDialogConfig);
      dialogRef.afterClosed().subscribe(result => {
        resolve(result ? true : false);
      });
    })
  }
}