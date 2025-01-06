import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelPaymentPageComponent } from './cancel-payment-page.component';

describe('CancelPaymentPageComponent', () => {
  let component: CancelPaymentPageComponent;
  let fixture: ComponentFixture<CancelPaymentPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CancelPaymentPageComponent]
    });
    fixture = TestBed.createComponent(CancelPaymentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
