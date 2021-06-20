export class AvatarControllerInput {
  public keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    space: false,
    shift: false
  };
  constructor(document: any) {
    this.init(document);
  }

  init(document: any) {
    document.addEventListener('keydown', (e: any) => this.onKeyDown(e), false);
    document.addEventListener('keyup', (e: any) => this.onKeyUp(e), false);
  }

  onKeyDown(event: any) {
    console.log("avatar control!");
    switch(event.keyCode) {
      case 87: //w
        this.keys.forward = true;
        break;
      case 65: //a
        this.keys.left = true;
        break;
      case 83: //s
        this.keys.backward = true;
        break;
      case 68: //d
        this.keys.right = true;
        break;
      case 32: //SPACE
        this.keys.space = true;
        break;
      case 16: //SHIFT
        this.keys.shift = true;
        break;
    }
  }

  onKeyUp(event: any) {
    switch(event.keyCode) {
      case 87: //w
        this.keys.forward = false;
        break;
      case 65: //a
        this.keys.left = false;
        break;
      case 83: //s
        this.keys.backward = false;
        break;
      case 68: //d
        this.keys.right = false;
        break;
      case 32: //SPACE
        this.keys.space = false;
        break;
      case 16: //SHIFT
        this.keys.shift = false;
        break;
    }
  }

}
