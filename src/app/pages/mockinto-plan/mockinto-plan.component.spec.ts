import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockintoPlanComponent } from './mockinto-plan.component';

describe('MockintoPlanComponent', () => {
  let component: MockintoPlanComponent;
  let fixture: ComponentFixture<MockintoPlanComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MockintoPlanComponent]
    });
    fixture = TestBed.createComponent(MockintoPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
