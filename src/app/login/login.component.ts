import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from "../shared/services/UserService";
import {Subscription} from "rxjs";
import {DialogService} from "primeng/dynamicdialog";
import {SignupComponent} from "./signup/signup.component";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [DialogService, DialogService]
})
export class LoginComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription;
  public password: any = null;
  public username: any = null;

  constructor(private userService: UserService,
              public dialogService: DialogService,
              public messageService: MessageService) {
    this.subscriptions = new Subscription();
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  login(): void {
    //, this.password
    this.userService.login(this.username).subscribe(res => {
      if(res && !res.message) {
        this.userService.userName = this.username;
        this.userService.selectedChar = res.character;
        this.userService.isUserLoggedIn.next(true);
        this.userService.isUserLoggedInBool = true;
      } else {
        if(res) {
          this.messageService.add({
            key: 'home',
            severity: 'warn',
            summary: 'Warn',
            detail: res.message
          });
        }
      }
    });
  }

  signUp(): void {
    const ref = this.dialogService.open(SignupComponent, {
      header: 'Signup!',
      width: '50%',
      dismissableMask: true,
      styleClass: 'md:-mt-96'
    })

    this.subscriptions.add(ref.onClose.subscribe(data => {
      if(data)
        this.username = data.username;
    }));
  }
}
