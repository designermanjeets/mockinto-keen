import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockintoQuestionsComponent } from './mockinto-questions.component';

describe('MockintoQuestionsComponent', () => {
  let component: MockintoQuestionsComponent;
  let fixture: ComponentFixture<MockintoQuestionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MockintoQuestionsComponent]
    });
    fixture = TestBed.createComponent(MockintoQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
