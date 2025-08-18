import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferApprovalComponent } from './transfer-approval.component';

describe('TransferApprovalComponent', () => {
  let component: TransferApprovalComponent;
  let fixture: ComponentFixture<TransferApprovalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransferApprovalComponent]
    });
    fixture = TestBed.createComponent(TransferApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
