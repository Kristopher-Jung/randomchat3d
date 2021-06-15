import {Injectable, isDevMode} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {WebsocketService} from "./WebsocketService";
import * as bcrypt from 'bcrypt';
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public isUserLoggedIn = new BehaviorSubject<boolean>(false);
  public isUserLoggedInBool: boolean = false;
  public userName: string | null;
  private connectionUrl;

  constructor(private webSocketService: WebsocketService) {
    this.userName = null;
    if(isDevMode()) {
      console.log("Angular is currently running in Dev Mode");
    } else {
      console.log("Angular is currently running in Prod Mode");
    }
    this.connectionUrl = environment.m_url;
    console.log(this.connectionUrl);
  }

  signUp(username:string, password:string): void{

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
    this.webSocketService.disconnectService();
  }
}
