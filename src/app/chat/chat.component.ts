import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs";
import {MenuItem, MessageService} from "primeng/api";
import {WebsocketService} from "../shared/services/WebsocketService";
import {ServerMessage} from "../shared/models/server-message";
import {UserService} from "../shared/services/UserService";


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


  constructor(private route: ActivatedRoute,
              private webSocketService: WebsocketService,
              private userService: UserService,
              private messageService: MessageService) {
    this.subscriptions = new Subscription;
    this.textChatInput = "";
  }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    const username = routeParams.get('username');
    if(username) {
      //console.log(username);
      this.username = username;
      if (this.userService.isUserLoggedInBool && !this.webSocketService.isConnected) {
        this.webSocketService.connectService(this.username);
        this.subscriptions.add(this.webSocketService.serverMessageListener.subscribe((msg: any) => {
          if (msg)
            console.log(msg);
        }));
        this.subscriptions.add(this.webSocketService.textMessageListener.subscribe((msg:any) => {
          if(msg)
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
    //console.log(`chat component destroyed!!`);
    this.subscriptions.unsubscribe();
    this.userService.roomId = null;
  }

  startChat() {
    if(this.username)
      this.userService.joinChat(this.username).subscribe(res => {
        if(res) {
          if(res.message) {
            this.messageService.add({
              key: 'chat',
              severity: 'warn',
              summary: 'Warn',
              detail: res.message
            });
          } else {
            const roomId = res.roomId;
            //console.log(roomId);
            this.userService.roomId = roomId;
            if(roomId) {
              this.webSocketService.joinRoom(roomId);
            } else {
              this.messageService.add({
                key: 'chat',
                severity: 'error',
                summary: 'Error',
                detail: 'received roomId is null'
              });
            }
          }
        }
      });
  }

  onTextInputSubmit() {
    if(this.userService.roomId && this.username) this.webSocketService.emitTextMessage(this.textChatInput, this.username, this.userService.roomId);
    else console.log("roomId/username is missing");
  }

}
