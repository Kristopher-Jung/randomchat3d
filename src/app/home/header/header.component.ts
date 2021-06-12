import {Component, OnDestroy, OnInit, Output} from '@angular/core';
import {UserService} from "../../shared/services/UserService";
import {Subscription} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  public isLoggedIn: boolean;
  public subscriptions: Subscription;
  public username: string | null | undefined;

  constructor(private router: Router, public loginService:UserService) {
    this.isLoggedIn = false;
    this.subscriptions = new Subscription();
  }

  ngOnInit(): void {
    this.subscriptions.add(this.loginService.isUserLoggedIn.subscribe((loginStatus: boolean) => {
        this.isLoggedIn = loginStatus;
        if(this.isLoggedIn) {
          this.username = this.loginService.userName;
          this.router.navigate(['chat', this.username]);
        }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
