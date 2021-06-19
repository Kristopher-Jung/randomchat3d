export interface TextMessage {
  textMessage: string,
  username: string,
  roomId: string
}

export class TextMessage {
  constructor(textMessage:string, username:string, roomId:string) {
    this.textMessage = textMessage;
    this.username = username;
    this.roomId = roomId;
  }
}
