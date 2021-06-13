import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {UserService} from "../../shared/services/UserService";
import {Router} from "@angular/router";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  @Input('username') username : any;

  constructor(private userService: UserService, private router: Router) {
    this.subscription = new Subscription();
  }

  ngOnInit(): void {
  }

  logout(): void {
    this.userService.logout();
    this.subscription.add(this.userService.isUserLoggedIn.subscribe((status: boolean) => {
      if(!status) {
        this.router.navigate(['']);
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
