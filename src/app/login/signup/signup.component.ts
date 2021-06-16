import {Component, OnDestroy, OnInit} from '@angular/core';
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {Subscription} from "rxjs";
import {UserService} from "../../shared/services/UserService";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {

  public username: any = null;
  public password: any = null;
  public isSubmitting = false;
  private subscriptions = new Subscription();

  constructor(private ref: DynamicDialogRef,
              private userService: UserService,
              private messageService: MessageService) { }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  submit(): void {
    this.isSubmitting = true;
    if(!this.username || !this.password) {
      this.messageService.add({
        key:'home',
        severity:'Warn',
        summary:'Warn',
        detail:'username or password is needed'
      });
    } else {
      this.subscriptions.add(this.userService.signUp(this.username, this.password).subscribe(data => {
        if(data) {
          this.isSubmitting = false;
          this.messageService.add({
            key:'home',
            severity:'warn',
            summary:'Warn',
            detail: data.message
          });
        } else {
          setTimeout(() => {
            this.isSubmitting = false;
            this.ref.close({
              'username': this.username
            });
          }, 1000);
        }
      }));
    }
  }

}
