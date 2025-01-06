import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConactSupportDialogueComponent } from './conact-support-dialogue.component';

describe('ConactSupportDialogueComponent', () => {
  let component: ConactSupportDialogueComponent;
  let fixture: ComponentFixture<ConactSupportDialogueComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConactSupportDialogueComponent]
    });
    fixture = TestBed.createComponent(ConactSupportDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
