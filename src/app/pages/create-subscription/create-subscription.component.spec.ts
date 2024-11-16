import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSubscriptionComponent } from './create-subscription.component';

describe('CreateSubscriptionComponent', () => {
  let component: CreateSubscriptionComponent;
  let fixture: ComponentFixture<CreateSubscriptionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateSubscriptionComponent]
    });
    fixture = TestBed.createComponent(CreateSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
