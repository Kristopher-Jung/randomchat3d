import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs";
import {MenuItem, MessageService} from "primeng/api";
import {WebsocketService} from "../shared/services/WebsocketService";
import {ServerMessage} from "../shared/models/server-message";
import {UserService} from "../shared/services/UserService";
import {DialogService} from "primeng/dynamicdialog";
import {LoadingComponent} from "../shared/components/loading/loading.component";


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
      label: 'Michelle',
      command: () => {
        this.avatarSelected('Michelle');
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
  public disableSearch: boolean = false;
  public loadingRef: any;
  public showTextBox: boolean = false;
  public selectedChar: string | null;


  constructor(private route: ActivatedRoute,
              private webSocketService: WebsocketService,
              private userService: UserService,
              private messageService: MessageService,
              private dialogService: DialogService) {
    this.subscriptions = new Subscription;
    this.textChatInput = "";
    this.selectedChar = 'Kaya';
  }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    const username = routeParams.get('username');
    if(username) {
      //console.log(username);
      this.username = username;
      if (this.userService.isUserLoggedInBool && !this.webSocketService.isConnected) {
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
                  detail:`${msg.text}[${msg.time}]`
                });
                break;
              case 1: // await
                this.disableSearch = true;
                this.loadingRef = this.dialogService.open(LoadingComponent, {
                  data: 'Waiting someone to join....',
                  width: '50%',
                  height: '50%',
                  closable: true
                });
                this.showTextBox = false;
                break;
              case 2: // complete
                this.disableSearch = false;
                if(this.loadingRef) {
                  this.loadingRef.close();
                  this.loadingRef = null;
                }
                this.messageService.add({
                  key:'chat',
                  severity:'info',
                  summary:'Info',
                  detail:'Matching completed!'
                });
                this.showTextBox = true;
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
  }

  ngOnDestroy() {
    //console.log(`chat component destroyed!!`);
    this.subscriptions.unsubscribe();
    this.userService.roomId = null;
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
    if(this.userService.roomId && this.username) {
      this.webSocketService.emitTextMessage(this.textChatInput, this.username, this.userService.roomId);
      this.textChatInput = null;
    }
    else console.log("roomId/username is missing");
  }

}
