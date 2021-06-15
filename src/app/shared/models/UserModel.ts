export class UserModel {
  username: string;
  password: string;
  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }
}

export interface Interface {
  username: string;
  password: string;
}
