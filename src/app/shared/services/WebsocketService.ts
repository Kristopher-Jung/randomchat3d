import { Injectable } from '@angular/core';
import { io, Socket} from 'socket.io-client';
import {environment} from '../../../environments/environment';
import {BehaviorSubject, Subject} from "rxjs";
import {Message} from "../models/message";
import {DefaultEventsMap} from 'socket.io-client/build/typed-events';

@Injectable()
export class WebsocketService {

  private socket: Socket<DefaultEventsMap, DefaultEventsMap> | null;
  public angularMessageListener: Subject<Message> = new Subject();
  public isConnected: boolean

  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  initService(username: string) {
    this.socket = io(environment.ws_url, {
      auth: {
        token: username
      }
    });
    this.angularMessageListener = new BehaviorSubject<any>(null);

    this.socket.on('message', (msg: Message) => {
      if(this.angularMessageListener) {
        this.isConnected = true;
        this.angularMessageListener.next(msg);
      }
    });
  }

  emitTextMessage(message: string) {
    if(this.socket)
      this.socket.emit('textChatMessage', message);
    else
      console.log("You should call initService first");
  }


}
