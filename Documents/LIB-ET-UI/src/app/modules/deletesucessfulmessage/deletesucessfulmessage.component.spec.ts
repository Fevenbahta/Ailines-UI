import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletesucessfulmessageComponent } from './deletesucessfulmessage.component';

describe('DeletesucessfulmessageComponent', () => {
  let component: DeletesucessfulmessageComponent;
  let fixture: ComponentFixture<DeletesucessfulmessageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeletesucessfulmessageComponent]
    });
    fixture = TestBed.createComponent(DeletesucessfulmessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
