import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockintoBillingComponent } from './mockinto-billing.component';

describe('MockintoBillingComponent', () => {
  let component: MockintoBillingComponent;
  let fixture: ComponentFixture<MockintoBillingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MockintoBillingComponent]
    });
    fixture = TestBed.createComponent(MockintoBillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
