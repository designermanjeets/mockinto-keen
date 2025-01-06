import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-conact-support-dialogue',
  templateUrl: './conact-support-dialogue.component.html',
  styleUrls: ['./conact-support-dialogue.component.scss']
})
export class ConactSupportDialogueComponent implements OnInit {
  constructor(private dialog: MatDialog,
  ){

  }
  ngOnInit(){
    
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

}
