import { Component, OnInit } from '@angular/core';
import {DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  public username: any = null;
  public password: any = null;
  public isSubmitting = false;

  constructor(private ref: DynamicDialogRef) { }

  ngOnInit(): void {
  }

  submit(): void {
    console.log("signup clicked");
    this.isSubmitting = true;
    setTimeout(()=> {
      this.isSubmitting = false;
      this.ref.close({
        'username': this.username
      });
    }, 2000);
  }

}
