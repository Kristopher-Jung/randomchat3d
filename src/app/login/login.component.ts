import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from "../shared/services/UserService";
import {Subscription} from "rxjs";
import {DialogService} from "primeng/dynamicdialog";
import {SignupComponent} from "./signup/signup.component";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [DialogService]
})
export class LoginComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription;
  public password: any = null;
  public username: any = null;

  constructor(private userService: UserService, public dialogService: DialogService) {
    this.subscriptions = new Subscription();
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  login(): void {
    this.userService.login(this.username, this.password);
  }

  signUp(): void {
    const ref = this.dialogService.open(SignupComponent, {
      header: 'Signup!',
      width: '50%',
      dismissableMask: true,
      styleClass: 'md:-mt-96'
    })

    this.subscriptions.add(ref.onClose.subscribe(data => {
      this.username = data.username;
    }));
  }
}
