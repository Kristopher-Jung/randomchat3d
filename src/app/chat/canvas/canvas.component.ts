import {
  AfterViewInit,
  Component,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import * as THREE from 'three';
import {WebsocketService} from "../../shared/services/WebsocketService";
import {Subscription} from "rxjs";
import {TextMessage} from "../../shared/models/text-message";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {AvatarController} from "../../shared/avatars/AvatarController";
import {UserService} from "../../shared/services/UserService";
import {StateHandler} from "../../shared/avatars/Statehandler";

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements AfterViewInit, OnInit, OnDestroy, OnChanges {

  @ViewChild('rendererContainer') rendererContainer: any;
  @Input('selectedChar') selectedChar: any;
  public anotherChar: any;

  // three.js components
  public renderer = new THREE.WebGLRenderer();
  public scene: any = null;
  public camera: any = null;
  public mesh: any = null;
  // loaders
  public loader = new THREE.FontLoader();
  public GLTFLoader = new GLTFLoader();
  //variables
  private subscriptions = new Subscription();
  public font: any = null;
  public messages: string[] = [];
  private interval: any;
  private clock: any = new THREE.Clock();
  private characterObjs: any;
  private characterAnims: any;
  private mixers: any;
  private stateHandlers = new Map<number, StateHandler>();
  // animation frame
  private animationFrameId: any;
  private pause: boolean = false;

  constructor(private userService: UserService,
              private webSocketService: WebsocketService,
              private avatarController: AvatarController) {
    this.loader.load('assets/static/font/helvetiker_regular.typeface.json', font => {
      this.font = font;
    });
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('black');
  }

  ngOnInit() {
    if (this.userService.userName) {
      this.avatarController.load();
    }
    this.subscriptions.add(this.webSocketService.textMessageListener.subscribe((msg: TextMessage) => {
      if (msg) {
        // console.log(msg);
        this.showMessage(msg.textMessage, msg.username);
      }
    }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.selectedChar.firstChange && changes.selectedChar) {
      if (changes.selectedChar.previousValue !== changes.selectedChar.currentValue) {
        const selectedChar = changes.selectedChar.currentValue;
        const prevChar = changes.selectedChar.previousValue;
        if (selectedChar != prevChar && this.characterObjs) {
          const prev = this.characterObjs.get(0).get(prevChar);
          this.selectedChar = selectedChar;
          const currentCharacter = this.characterObjs.get(0).get(this.selectedChar);
          if (currentCharacter) {
            this.addCharacterToScene(currentCharacter, prev, 0);
            this.userService.selectedChar = this.selectedChar;
          }
        }
      }
    }
  }

  ngAfterViewInit() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
    this.subscriptions.add(this.avatarController.assetLoadCompleted.subscribe(status => {
      if (status) {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
        const light = new THREE.AmbientLight(new THREE.Color('white'), 1);
        // ground
        const ground = new THREE.Mesh(
          new THREE.PlaneGeometry(1000, 1000),
          new THREE.MeshPhongMaterial({color: 0x999999, depthWrite: false})
        );
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        this.scene.add(light);
        const axesHelper = new THREE.AxesHelper(200);
        this.scene.add(axesHelper);
        this.camera.position.z = 500;
        this.camera.position.y = 100;
        // init avatar assets only once
        this.mixers = this.avatarController.mixers;
        this.characterAnims = this.avatarController.animations;
        this.characterObjs = this.avatarController.chars;
        if (this.characterObjs && this.selectedChar) {
          const currentCharacter = this.characterObjs.get(0).get(this.selectedChar);
          if (currentCharacter) {
            this.addCharacterToScene(currentCharacter, null, 0);
            this.animate();
          }
        }
      }
    }));

    this.subscriptions.add(this.webSocketService.userMatched.subscribe(anotherChar => {
      // console.log(anotherChar);
      if (anotherChar) { // another user is connected
        if (this.characterObjs) {
          this.anotherChar = anotherChar;
          this.characterObjs.get(0).get(this.selectedChar).position.set(0,0,0);
          this.characterObjs.get(0).get(this.selectedChar).rotation.set(0,0,0);
          this.characterObjs.get(0).get(this.selectedChar).updateMatrix();

          const aChar = this.characterObjs.get(1).get(this.anotherChar);
          aChar.position.set(0,0,0);
          aChar.rotation.set(0,0,0);
          aChar.updateMatrix();
          this.addCharacterToScene(aChar, null, 1);
        }
      } else { // another user is dced
        if (this.anotherChar) {
          const aChar = this.characterObjs.get(1).get(this.anotherChar);
          this.characterObjs.get(0).get(this.selectedChar).position.set(0,0,0);
          this.characterObjs.get(0).get(this.selectedChar).rotation.set(0,0,0);
          this.characterObjs.get(0).get(this.selectedChar).updateMatrix();
          this.addCharacterToScene(null, aChar, 1);
          // this.anotherChar = null;
        }
      }
    }));

    this.subscriptions.add(this.webSocketService.moveMessageListener.subscribe(move => {
      if(move && move.username != this.userService.userName) {
        this.stateHandlers.get(1)?.handleKeyInput(move.keyInput, move.username);
      }
    }));
  }

  addCharacterToScene(character: any, prevChar: any, number: any) {
    if (prevChar) {
      this.scene.remove(prevChar);
    }
    if (character) {
      character.position.set(0, 0, 0);
      character.receiveShadow = true;
      this.scene.add(character);
      if (this.characterAnims.get(number)) {
        this.characterAnims.get(number).get(character.name).forEach((action: any) => {
          action.enabled = false;
        });
        this.stateHandlers.set(number,
          new StateHandler(this.mixers.get(number).get(character.name),
            this.characterAnims.get(number).get(character.name),
            character,
            this.webSocketService,
            this.userService));
        this.avatarController.controllerInputInit(document);
      }
    }
  }

  animate() {
    if (this.pause) {
      return;
    } else {
      this.animationFrameId = window.requestAnimationFrame(() => this.animate());
      if (this.clock) {
        let mixerUpdateDelta = this.clock.getDelta();
        if (this.mixers.get(0) && this.selectedChar) {
          this.mixers.get(0).get(this.selectedChar).update(mixerUpdateDelta);
        }
        if (this.mixers.get(1) && this.anotherChar) {
          this.mixers.get(1).get(this.anotherChar).update(mixerUpdateDelta);
        }
      }
      this.updateMessagePositions();
      const keyInput = this.avatarController.avatarControllerInput.keys;
      this.stateHandlers.get(0)?.handleKeyInput(keyInput, this.userService.userName);
      this.renderer.render(this.scene, this.camera);
    }
  }

  showMessage(message: string, username: string) {
    if (this.font && this.scene) {
      const textGeometry = new THREE.TextGeometry(message, {
        font: this.font,
        size: 80,
        height: 5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 10,
        bevelSize: 8,
        bevelOffset: 0,
        bevelSegments: 5
      });
      const textMaterial = new THREE.MeshBasicMaterial();
      const mesh = new THREE.Mesh(textGeometry, textMaterial);
      if(this.userService.userName == username) {
        mesh.position.x = this.characterObjs.get(0).get(this.selectedChar).position.x;
        mesh.position.y = this.characterObjs.get(0).get(this.selectedChar).position.y + 200;
        mesh.position.z = this.characterObjs.get(0).get(this.selectedChar).position.z;
        mesh.name = `message-${this.messages.length}-0`
      } else {
        mesh.position.x = this.characterObjs.get(1).get(this.anotherChar).position.x;
        mesh.position.y = this.characterObjs.get(1).get(this.anotherChar).position.y + 200;
        mesh.position.z = this.characterObjs.get(1).get(this.anotherChar).position.z;
        mesh.name = `message-${this.messages.length}-1`
      }
      this.messages.push(mesh.name);
      this.scene.add(mesh);
      this.clearMessage();
    }
  }

  updateMessagePositions() {
    if(this.messages) {
      this.messages.forEach(meshName => {
        const number = meshName.split('-')[2];
        if(+number == 0) {
          this.scene.getObjectByName(meshName).position.x = this.characterObjs.get(0).get(this.selectedChar).position.x;
          this.scene.getObjectByName(meshName).position.y += 1;
          this.scene.getObjectByName(meshName).position.z = this.characterObjs.get(0).get(this.selectedChar).position.z;
        } else {
          this.scene.getObjectByName(meshName).position.x = this.characterObjs.get(1).get(this.anotherChar).position.x;
          this.scene.getObjectByName(meshName).position.y += 1;
          this.scene.getObjectByName(meshName).position.z = this.characterObjs.get(1).get(this.anotherChar).position.z;
        }
      });
    }
  }

  clearMessage() {
    this.interval = setTimeout(() => {
      if (this.messages.length > 0) {
        var object = this.scene.getObjectByName(this.messages[0])
        if (object) {
          object.material.dispose();
          object.geometry.dispose();
          this.messages.shift();
          this.scene.remove(object);
        }
      }
    }, 3000);
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: { target: { innerWidth: number; innerHeight: number; }; }) {
    this.renderer.setSize(event.target.innerWidth, event.target.innerHeight)
  }

  ngOnDestroy() {
    this.pause = true;
    window.cancelAnimationFrame(this.animationFrameId);
    this.subscriptions.unsubscribe();
    this.avatarController.assetLoadCompleted.next(false);
  }

}
