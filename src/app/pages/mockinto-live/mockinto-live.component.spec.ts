import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockintoLiveComponent } from './mockinto-live.component';

describe('MockintoLiveComponent', () => {
  let component: MockintoLiveComponent;
  let fixture: ComponentFixture<MockintoLiveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MockintoLiveComponent]
    });
    fixture = TestBed.createComponent(MockintoLiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
