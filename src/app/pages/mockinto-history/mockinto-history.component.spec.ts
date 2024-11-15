import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockintoHistoryComponent } from './mockinto-history.component';

describe('MockintoHistoryComponent', () => {
  let component: MockintoHistoryComponent;
  let fixture: ComponentFixture<MockintoHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MockintoHistoryComponent]
    });
    fixture = TestBed.createComponent(MockintoHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
