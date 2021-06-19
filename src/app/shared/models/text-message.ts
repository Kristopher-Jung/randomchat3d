export interface textMessage{
  textMessage: string,
  username: string,
  roomId: string
}

export class textMessage {
  constructor(textMessage:string, username:string, roomId:string) {
    this.textMessage = textMessage;
    this.username = username;
    this.roomId = roomId;
  }
}
