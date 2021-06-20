import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {WebsocketService} from "../services/WebsocketService";
import {UserService} from "../services/UserService";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, OnDestroy{

  private subscriptions: Subscription = new Subscription();

  constructor(private userService: UserService, private router: Router) {

  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const status = this.userService.isUserLoggedInBool;
    if(status) {
      return true;
    } else {
      this.router.navigate(['']);
      return false;
    }
  }

}
