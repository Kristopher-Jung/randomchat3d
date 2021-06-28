import {Injectable, isDevMode} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {WebsocketService} from "./WebsocketService";
import {environment} from "../../../environments/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {UserModel} from "../models/UserModel";
import {MessageService} from "primeng/api";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public isUserLoggedIn = new BehaviorSubject<boolean>(false);
  public isUserLoggedInBool: boolean = false;
  public userName: string | null;
  public selectedChar: any;
  private readonly connectionUrl;
  public roomId: string | null;

  constructor(private webSocketService: WebsocketService, private http: HttpClient, private messageService: MessageService) {
    this.userName = null;
    this.roomId = null;
    if(isDevMode()) {
      console.log("Angular is currently running in Dev Mode");
    } else {
      console.log("Angular is currently running in Prod Mode");
    }
    this.connectionUrl = environment.server_url;
    //console.log(this.connectionUrl);
  }

  cleanUp() {
    this.userName = null;
    this.selectedChar = null;
    this.roomId = null;
    this.isUserLoggedInBool = false;
  }

  signUp(username:string, password:string): Observable<any> {
    const full_String = `${this.connectionUrl}/user/signUp/${username}`;
    const headers = new HttpHeaders();
    const body = {
      password: password
    };
    const requestOptions = {
      headers: headers
    };
    headers.set('Access-Control-Allow-Origin', '*');
    return this.http.post<UserModel>(full_String, body, requestOptions);
  }

  login(username:string, password:string): Observable<any> {
    const full_String = `${this.connectionUrl}/user/auth/${username}`;
    const headers = new HttpHeaders();
    const body = {
      password: password
    };
    const requestOptions = {
      headers: headers
    };
    headers.set('Access-Control-Allow-Origin', '*');
    return this.http.post<any>(full_String, body, requestOptions);
  }

  logout(): void {
    console.log(`username: ${this.userName} just logged out!`);
    this.userName = null;
    this.roomId = null;
    this.isUserLoggedIn.next(false);
    this.isUserLoggedInBool = false;
    this.webSocketService.disconnectService();
  }

  signOut(username:string | null): Observable<any> {
    const full_String = `${this.connectionUrl}/user/signOut/${username}`;
    const headers = new HttpHeaders();
    const requestOptions = {
      headers: headers
    };
    headers.set('Access-Control-Allow-Origin', '*');
    return this.http.get<any>(full_String, requestOptions);
  }

  joinChat(username:string): Observable<any> {
    const full_String = `${this.connectionUrl}/user/joinChat/${username}`;
    const headers = new HttpHeaders();
    const requestOptions = {
      headers: headers
    };
    headers.set('Access-Control-Allow-Origin', '*');
    return this.http.get<any>(full_String, requestOptions);
  }

  updateChar(username:string, char:string): Observable<any> {
    const full_String = `${this.connectionUrl}/user/updateChar/${username}/${char}`;
    const headers = new HttpHeaders();
    const requestOptions = {
      headers: headers
    };
    headers.set('Access-Control-Allow-Origin', '*');
    return this.http.get<any>(full_String, requestOptions);
  }

}
