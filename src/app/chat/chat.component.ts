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


  constructor(private route: ActivatedRoute, private webSocketService: WebsocketService, private userService: UserService) {
    this.subscriptions = new Subscription;
    this.textChatInput = "";
  }

  ngOnInit(): void {
    console.log("chat init!!!");
    const randomName = "Dude" + randInt(1,10);
    this.userService.isUserLoggedIn.subscribe((status: boolean) => {
      if(status) {
        this.webSocketService.connectService(randomName);
        this.subscriptions.add(this.webSocketService.angularMessageListener.subscribe((msg: Message) => {
          if (msg)
            console.log(msg);
        }));
      } else {
        this.webSocketService.disconnectService();
      }
    });

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
    this.subscriptions.unsubscribe();
  }

  onTextInputSubmit() {
    this.webSocketService.emitTextMessage(this.textChatInput);
  }

}
