import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockintoReportComponent } from './mockinto-report.component';

describe('MockintoReportComponent', () => {
  let component: MockintoReportComponent;
  let fixture: ComponentFixture<MockintoReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MockintoReportComponent]
    });
    fixture = TestBed.createComponent(MockintoReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
