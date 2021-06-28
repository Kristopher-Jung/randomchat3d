import { Injectable } from '@angular/core';
import { io, Socket} from 'socket.io-client';
import {environment} from '../../../environments/environment';
import {BehaviorSubject, Subject} from "rxjs";
import {ServerMessage} from "../models/server-message";
import {DefaultEventsMap} from 'socket.io-client/build/typed-events';
import {TextMessage} from "../models/text-message";

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private socket: Socket<DefaultEventsMap, DefaultEventsMap> | null;
  public serverMessageListener: Subject<ServerMessage> = new Subject();
  public textMessageListener: Subject<TextMessage> = new Subject<TextMessage>();
  public moveMessageListener: Subject<any> = new Subject();
  public isConnected: boolean
  public userMatched = new BehaviorSubject<string | null>(null);
  public isMatched: boolean;

  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.isMatched = false;
  }

  connectService(username: string) {
    if(!this.isConnected) {
      this.socket = io(environment.server_url, {
        auth: {
          token: username
        }
      });
      this.serverMessageListener = new BehaviorSubject<any>(null);
      this.isConnected = true;
      this.listenServerMessage();
      this.listenTextChat();
      this.listenMoveMessage();
    } else {
      console.log(`${username} is already connected to socket`);
    }
  }

  listenServerMessage() {
    if(this.socket) {
      this.socket.on('ServerMessage', (msg: ServerMessage) => {
        if (this.serverMessageListener) {
          this.serverMessageListener.next(msg);
        }
      });
    }
  }

  listenMoveMessage() {
    if(this.socket) {
      this.socket.on('move', (move: any) => {
        if(this.moveMessageListener) {
          this.moveMessageListener.next(move);
        }
      });
    }
  }

  listenTextChat() {
    if(this.socket) {
      this.socket.on('textChat', (msg: TextMessage) => {
        if (this.textMessageListener) {
          this.textMessageListener.next(msg);
        }
      });
    }
  }

  disconnectService() {
    if(this.isConnected || this.socket){
      console.log("requested socket to disconnect");
      if(this.socket)
        this.socket.disconnect();
        this.socket = null;
      this.isConnected = false;
    }
  }

  joinRoom(roomId: string, character: string) {
    if(this.isConnected && this.socket) {
      this.socket.emit('joinRoom', {roomId, character});
    } else {
      console.log("You should connect to the service first");
    }
  }

  completeJoinRoom(roomId: string, character: string) {
    if(this.isConnected && this.socket) {
      this.socket.emit('completeJoinRoom', {roomId, character});
    } else {
      console.log("You should connect to the service first");
    }
  }

  leaveRoom(roomId: string | null) {
    if(this.isConnected && this.socket) {
      this.socket.emit('leaveRoom', roomId);
    } else {
      console.log("You should connect to the service first");
    }
  }

  emitTextMessage(message: string | null, username: string, roomId: string) {
    if(this.isConnected && this.socket)
      if(roomId && message) {
        // console.log(message, roomId);
        this.socket.emit('textChat', new TextMessage(message, username, roomId));
      } else {
        console.log("roomId is missing!");
      }
    else
      console.log("You should call initService first");
  }

  signalMove(keyInput: any, username: string, roomId: string) {
    if(this.isConnected && this.socket)
      if(roomId && keyInput) {
        // console.log(message, roomId);
        this.socket.emit('move', {keyInput, username, roomId});
      } else {
        console.log("roomId is missing!");
      }
    else
      console.log("You should call initService first");
  }


}
