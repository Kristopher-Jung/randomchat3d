import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";

@Injectable()
export class UserService {

  public isUserLoggedIn = new BehaviorSubject<boolean>(false);
  public isUserLoggedInBool: boolean = false;
  public userName: string | null;

  constructor() {
    this.userName = null;
  }

  login(username:string, password:string): void {
    console.log(`username: ${username}, password: ${password} just logged in!`);
    this.userName = username;
    this.isUserLoggedIn.next(true);
    this.isUserLoggedInBool = true;
  }

  logout(): void {
    console.log(`username: ${this.userName} just logged out!`);
    this.userName = null;
    this.isUserLoggedIn.next(false);
    this.isUserLoggedInBool = false;
  }
}
