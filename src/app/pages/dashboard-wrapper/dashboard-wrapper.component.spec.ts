import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardWrapperComponent } from './dashboard-wrapper.component';

describe('DashboardWrapperComponent', () => {
  let component: DashboardWrapperComponent;
  let fixture: ComponentFixture<DashboardWrapperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardWrapperComponent]
    });
    fixture = TestBed.createComponent(DashboardWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
