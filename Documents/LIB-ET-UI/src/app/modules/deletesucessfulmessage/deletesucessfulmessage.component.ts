import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-deletesucessfulmessage',
  templateUrl: './deletesucessfulmessage.component.html',
  styleUrls: ['./deletesucessfulmessage.component.css']
})
export class DeletesucessfulmessageComponent {
  constructor(
    public dialogRef: MatDialogRef<DeletesucessfulmessageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onOk(): void {
    this.dialogRef.close(true);
  }
}
