import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {BehaviorSubject, Subscription} from "rxjs";
import {MenuItem, MessageService} from "primeng/api";
import {WebsocketService} from "../shared/services/WebsocketService";
import {ServerMessage} from "../shared/models/server-message";
import {UserService} from "../shared/services/UserService";
import {DialogService} from "primeng/dynamicdialog";
import {AvatarController} from "../shared/avatars/AvatarController";


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  providers: [DialogService]
})
export class ChatComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription;
  public items: MenuItem[] = [
    {
      label: 'Kaya',
      command: () => {
        this.avatarSelected('Kaya');
      }
    },
    {
      label: 'Claire',
      command: () => {
        this.avatarSelected('Claire');
      }
    },
    {
      label: 'Upload',
      icon: 'pi pi-upload',
      command: () => {
        this.avatarSelected('Upload');
      }
    }
  ];
  public menuItemsLabel: string = "Avatars";
  public textChatInput: string | null;
  public username: any;
  public selectedChar: string | null = null;
  public loadingMessage: string = "Searching...";
  public currProgress: number = 0;

  // booleans
  public disableSearch: boolean = false;
  public showTextBox: boolean = false;
  public isAssetsLoadCompleted: boolean = true;
  public alreadyCompleted: boolean = false;
  public userSearchingBegin: boolean = false;
  public clientLeaveRoom = new BehaviorSubject(false);

  constructor(private route: ActivatedRoute,
              private webSocketService: WebsocketService,
              private userService: UserService,
              private messageService: MessageService,
              public avatarController: AvatarController) {
    this.subscriptions = new Subscription;
    this.textChatInput = null;
  }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    const username = routeParams.get('username');
    if(username) {
      //console.log(username);
      this.username = username;
      if (this.userService.isUserLoggedInBool && !this.webSocketService.isConnected) {
        this.selectedChar = this.userService.selectedChar;
        this.webSocketService.connectService(this.username);
        this.subscriptions.add(this.webSocketService.serverMessageListener.subscribe((msg: ServerMessage) => {
          if (msg){
            // console.log(msg);
            switch (msg.controllerEnum) {
              case 0: // display
                this.messageService.add({
                  key:'chat',
                  severity:'info',
                  summary:'Info',
                  detail:`${msg.text}[${msg.time}]`,
                  life: 1000
                });
                break;
              case 1: // await
                this.disableSearch = true;
                this.loadingMessage = "Searching...";
                this.showTextBox = false;
                this.webSocketService.userMatched.next(null);
                this.alreadyCompleted = false;
                this.userSearchingBegin = true;
                break;
              case 2: // complete
                this.disableSearch = true;
                this.messageService.add({
                  key:'chat',
                  severity:'info',
                  summary:'Info',
                  detail:'Matching completed!',
                  life: 1000
                });
                this.userSearchingBegin = false;
                this.showTextBox = true;
                break;
              case 5: // AVATAR_CONTROL
                if(msg.username != this.username && !this.alreadyCompleted) {
                  if (this.userService.roomId && this.selectedChar) {
                    this.webSocketService.completeJoinRoom(this.userService.roomId, this.selectedChar);
                    this.alreadyCompleted = true;
                    this.webSocketService.userMatched.next(msg.text);
                  }
                }
                break;
              default:
                break;
            }
          }
        }));
      } else if (!this.userService.isUserLoggedInBool && this.webSocketService.isConnected) {
        this.webSocketService.disconnectService();
      }
    }
    this.subscriptions.add(this.avatarController.loadingProgressListener.subscribe((progress:{message:string, progress:number})=> {
      setTimeout(() => {
        if(progress) {
          if(progress.progress < 100) {
            this.loadingMessage = progress.message;
            this.currProgress = progress.progress;
          } else {
          }
        }
      },0);
    }));
    this.subscriptions.add(this.avatarController.assetLoadCompleted.subscribe(status => {
      this.isAssetsLoadCompleted = status;
    }));
  }

  ngOnDestroy() {
    //console.log(`chat component destroyed!!`);
    this.subscriptions.unsubscribe();
    this.userService.cleanUp();
  }

  avatarSelected(char: string) {
    if(char === 'Upload') {
      this.messageService.add({
        key: 'chat',
        severity: 'info',
        summary: 'info',
        detail: 'Not supported yet :)'
      });
    } else {
      this.selectedChar = char;
      if(this.username && char) {
        this.userService.updateChar(this.username, char).subscribe(res => {
          if(res) {
            if(res.message) {
              this.messageService.add({
                key: 'chat',
                severity: 'error',
                summary: 'Error',
                detail: res.message
              });
            } else {
              // console.log(res);
              this.messageService.add({
                key: 'chat',
                severity: 'info',
                summary: 'info',
                detail: "User\'s character has been updated",
                life: 500
              });
            }
          }
        });
      }
    }
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
              this.webSocketService.joinRoom(roomId, this.userService.selectedChar);
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

  cancelSearch() {
    this.webSocketService.leaveRoom(this.userService.roomId);
    this.webSocketService.userMatched.next(null);
    this.userService.roomId = null;
    this.disableSearch = false;
    this.userSearchingBegin = false;
    this.showTextBox = false;
    this.alreadyCompleted = false;
  }

  onTextInputSubmit() {
    if(this.userService.roomId && this.username) {
      this.webSocketService.emitTextMessage(this.textChatInput, this.username, this.userService.roomId);
      this.textChatInput = null;
    }
    else console.log("roomId/username is missing");
  }

}
