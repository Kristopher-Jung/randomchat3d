import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from "../shared/services/UserService";
import {Subscription} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription;

  constructor(private userService: UserService, private router: Router) {
    this.subscriptions = new Subscription();
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  login(): void {
    this.userService.login("dude1", "strongman123");
  }
}
