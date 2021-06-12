import {Component, Input, OnInit} from '@angular/core';
import {UserService} from "../../shared/services/UserService";
import {Router} from "@angular/router";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  @Input('username') username : string | null | undefined;

  constructor(private userService: UserService, private router: Router) {

  }

  ngOnInit(): void {
  }

  logout(): void {
    this.userService.logout();
    this.userService.isUserLoggedIn.subscribe((status: boolean) => {
      if(!status) {
        this.router.navigate(['']);
      }
    });
  }

}
