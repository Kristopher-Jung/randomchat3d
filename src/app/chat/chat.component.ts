import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs";
import {MenuItem} from "primeng/api";
import {WebsocketService} from "../shared/services/WebsocketService";
import {Message} from "../shared/models/message";
import {randInt} from "three/src/math/MathUtils";
import {UserService} from "../shared/services/UserService";
// import { uuid } from 'uuidv4';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription;
  public items: MenuItem[] = [];
  public textChatInput: string;
  public username: any;


  constructor(private route: ActivatedRoute, private webSocketService: WebsocketService, private userService: UserService) {
    this.subscriptions = new Subscription;
    this.textChatInput = "";
  }

  ngOnInit(): void {
    console.log("chat init!!!");
    const routeParams = this.route.snapshot.paramMap;
    const username = routeParams.get('username');
    if(username) {
      console.log(username);
      this.username = username;
      if (this.userService.isUserLoggedInBool && !this.webSocketService.isConnected) {
        this.webSocketService.connectService(this.username);
        this.subscriptions.add(this.webSocketService.angularMessageListener.subscribe((msg: Message) => {
          if (msg)
            console.log(msg);
        }));
      } else if (!this.userService.isUserLoggedInBool && this.webSocketService.isConnected) {
        this.webSocketService.disconnectService();
      }
    }

    this.items = [
      {
        label: 'Update',
        icon: 'pi pi-refresh'
      },
      {
        label: 'Delete',
        icon: 'pi pi-times'
      },
      {
        label: 'Angular',
        icon: 'pi pi-external-link',
        url: 'http://angular.io'
      },
      {
        label: 'Router',
        icon: 'pi pi-upload',
        routerLink: '/chat/1'
      }
    ];
  }

  ngOnDestroy() {
    console.log(`chat component destroyed!!`);
    this.subscriptions.unsubscribe();
    this.webSocketService.disconnectService();
  }

  onTextInputSubmit() {
    this.webSocketService.emitTextMessage(this.textChatInput);
  }

}
