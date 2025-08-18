import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationCommonDialogData } from './model/ConfirmationCommonDialogData ';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent implements OnInit {
  
  constructor(public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public confirmCommonDialogData: ConfirmationCommonDialogData) {

    //set confirmation dialog input parameters
    // this.confirmCommonDialogData.title = this.confirmCommonDialogData.title ? this.confirmCommonDialogData.title : COMMON.DELETE_DIALOG_TITLE;
    // this.confirmCommonDialogData.type = this.confirmCommonDialogData.type ? this.confirmCommonDialogData.type : COMMON.CONFIRMATION_DIALOG_TYPE.DELETE_WITH_LIST;
    // this.confirmCommonDialogData.message = this.confirmCommonDialogData.message ? this.confirmCommonDialogData.message : COMMON.DELETE_DIALOG_CONTENT;
    // this.confirmCommonDialogData.submitButtonText = this.confirmCommonDialogData.submitButtonText ? this.confirmCommonDialogData.submitButtonText : COMMON.DIALOG_CONFIRM;
    // this.confirmCommonDialogData.cancelButtonText = this.confirmCommonDialogData.cancelButtonText ? this.confirmCommonDialogData.cancelButtonText : COMMON.DIALOG_CANCEL;
    this.confirmCommonDialogData.submitButtonStatus = this.confirmCommonDialogData.submitButtonStatus === false ? this.confirmCommonDialogData.submitButtonStatus : true;
    this.confirmCommonDialogData.cancelButtonStatus = this.confirmCommonDialogData.cancelButtonStatus === false ? false : true;
    this.confirmCommonDialogData.titleTooltip = this.confirmCommonDialogData.titleTooltip ? this.confirmCommonDialogData.titleTooltip : '';
}
  
  ngOnInit() {
  }
}