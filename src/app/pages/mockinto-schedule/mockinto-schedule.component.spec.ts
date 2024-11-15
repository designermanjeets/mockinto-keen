import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockintoScheduleComponent } from './mockinto-schedule.component';

describe('MockintoScheduleComponent', () => {
  let component: MockintoScheduleComponent;
  let fixture: ComponentFixture<MockintoScheduleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MockintoScheduleComponent]
    });
    fixture = TestBed.createComponent(MockintoScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
