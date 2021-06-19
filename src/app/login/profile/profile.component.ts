import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {UserService} from "../../shared/services/UserService";
import {Router} from "@angular/router";
import {Subscription} from "rxjs";
import {WebsocketService} from "../../shared/services/WebsocketService";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  @Input('username') username : any;

  constructor(private userService: UserService, private websocketService: WebsocketService, private router: Router) {
    this.subscription = new Subscription();
  }

  ngOnInit(): void {
  }

  logout(): void {
    if(this.userService.roomId) {
      //console.log("logout!" + this.userService.roomId);
      this.userService.leaveChat(this.username).subscribe((res)=> {
        //console.log(res);
        if(!res.roomId) {
          this.websocketService.leaveRoom(this.userService.roomId);
          this.userService.roomId = null;
          this.userService.logout();
          this.userService.isUserLoggedIn.subscribe((status: boolean) => {
            if(!status) {
              this.router.navigate(['']);
            }
          });
        }
      });
    } else {
      this.userService.logout();
      this.subscription.add(this.userService.isUserLoggedIn.subscribe((status: boolean) => {
        if (!status) {
          this.router.navigate(['']);
        }
      }));
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
