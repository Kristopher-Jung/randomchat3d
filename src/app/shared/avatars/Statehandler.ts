import * as THREE from "three";
import {WebsocketService} from "../services/WebsocketService";
import {UserService} from "../services/UserService";

export class StateHandler {
  private decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
  private acceleration = new THREE.Vector3(1, 0.25, 50.0);
  private velocity = new THREE.Vector3(0, 0, 0);
  private idleAction: any;
  private walkAction: any;
  private actions: any[];
  private currentAction: any;
  private signal = false;

  constructor(public mixer: any,
              public animations: any,
              public character: any,
              private socketService: WebsocketService,
              private userService: UserService) {
    this.mixer = mixer;
    this.character = character;
    this.idleAction = animations.get('idle');
    this.walkAction = animations.get('walk');
    this.actions = [this.idleAction, this.walkAction]
    this.currentAction = this.idleAction;
    this.mixer.setTime(0);
    this.setWeight(this.idleAction, 1);
    this.idleAction.play();
    this.socketService.userMatched.subscribe(anotherChar => {
      this.signal = !!anotherChar;
    });
  }

  unPauseAllActions() {
    this.actions.forEach(action => {
      action.paused = false;
    })
  }

  prepareCrossFade( startAction:any, endAction:any ) {
    const duration = 0.5;
    this.unPauseAllActions();
    if (startAction.name === this.idleAction.name) {
      this.executeCrossFade( startAction, endAction, duration );
    } else {
      this.synchronizeCrossFade( startAction, endAction, duration );
    }
  }

  synchronizeCrossFade( startAction:any, endAction:any, duration:any ) {
    if(startAction.name != endAction.name) {
      const onLoopFinished = (event: { action: any; }) => {
        if (event.action === startAction) {
          this.mixer.removeEventListener('loop', onLoopFinished);
          this.executeCrossFade(startAction, endAction, duration);
        }
      }
      this.mixer.addEventListener('loop', onLoopFinished);
      this.currentAction = endAction;
    } else {
      const ratio = endAction.getClip().duration / startAction.getClip().duration;
      endAction.time = startAction.time * ratio;
      endAction.play();
      this.currentAction = endAction;
    }
  }

  executeCrossFade( startAction:any, endAction: any, duration: any) {
    if(startAction.name != endAction.name) {
      this.setWeight(endAction, 1);
      startAction.time = 0.0;
      startAction.crossFadeTo(endAction, duration, true);
      this.currentAction = endAction;
    } else {
      const ratio = endAction.getClip().duration / startAction.getClip().duration;
      endAction.time = startAction.time * ratio;
      endAction.play();
      this.currentAction = endAction;
    }
  }

  setWeight(action: any, weight: any) {
    action.enabled = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(weight);
  }

  handleKeyInput(keyInput: any, username: any) {
    if(username === this.userService.userName && this.userService.roomId && this.signal) {
      this.socketService.signalMove(keyInput, username, this.userService.roomId);
    }
    if(keyInput.forward) {
      this.prepareCrossFade(this.currentAction, this.walkAction);
      this.character.translateZ(2);
    } else {
      this.prepareCrossFade(this.currentAction, this.idleAction);
    }
    if(keyInput.right) {
      this.character.rotateY(-0.1);
    }
    if(keyInput.left) {
      this.character.rotateY(0.1);
    }
  }

}
