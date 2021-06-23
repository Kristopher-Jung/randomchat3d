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
  private characterObjs: any[] = [];
  private characterAnims: any;
  private currentCharacter: any;
  private mixers: any;
  // handler
  private stateHandler: StateHandler | null | undefined;
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
      if (msg)
        console.log(msg);
      this.showMessage(msg.textMessage);
    }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    const selectedChar = changes.selectedChar.currentValue;
    if (selectedChar) {
      const prevChar = this.currentCharacter;
      this.selectedChar = selectedChar;
      this.currentCharacter = this.characterObjs.filter(
        fbx => fbx.name == this.selectedChar
      )[0];
      if(this.currentCharacter) {
        this.addCharacterToScene(this.currentCharacter, prevChar);
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
        if (this.userService.userName) {
          this.characterObjs = this.avatarController.chars;
          if (this.characterObjs) {
            this.currentCharacter = this.characterObjs.filter(
              fbx => fbx.name == this.selectedChar
            )[0];
            if(this.currentCharacter) {
              this.addCharacterToScene(this.currentCharacter, null);
              this.animate();
            }
          }
        }
      }
    }));

    this.subscriptions.add(this.webSocketService.userMatched.subscribe(status => {
      console.log(status);
      if(status) { // another user is connected
        //TODO add another user character and a stateHandler for it
      } else { // another user is dced
        //TODO remove another user and another stateHandler for it
      }
    }));
  }

  addCharacterToScene(character: any, prevChar: any) {
    if(this.currentCharacter) {
      if (prevChar) {
        this.scene.remove(prevChar);
      }
      this.currentCharacter = character;
      this.currentCharacter.position.set(0,0,0);
      this.currentCharacter.receiveShadow = true;
      this.scene.add(this.currentCharacter);
      this.characterAnims = this.avatarController.animations;
      this.characterAnims.get(this.currentCharacter.name).forEach((action: any) => {
        action.enabled = false;
      });
      if (this.characterAnims) {
        this.mixers = this.avatarController.mixers;
        // this.characterAnims.get(this.currentCharacter.name).get('idle').play();
        this.stateHandler = new StateHandler(this.mixers.get(this.currentCharacter.name),
          this.characterAnims.get(this.currentCharacter.name),
          this.currentCharacter);
        this.avatarController.controllerInputInit(document);
      }
    }
  }

  animate() {
    if (this.pause) {
      return;
    } else {
      this.animationFrameId = window.requestAnimationFrame(() => this.animate());
      if (this.mixers && this.clock && this.selectedChar) {
        let mixerUpdateDelta = this.clock.getDelta();
        this.mixers.get(this.selectedChar).update(mixerUpdateDelta);
      }
      const keyInput = this.avatarController.avatarControllerInput.keys;
      this.stateHandler?.handleKeyInput(keyInput);
      this.renderer.render(this.scene, this.camera);
    }
  }

  showMessage(message: string) {
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
      mesh.name = `message-${this.messages.length}`
      this.messages.push(mesh.name);
      this.scene.add(mesh);
      this.clearMessage();
    }
  }

  clearMessage() {
    this.interval = setTimeout(() => {
      console.log("interval called!");
      console.log(this.messages);
      if (this.messages.length > 0) {
        var object = this.scene.getObjectByName(this.messages[0])
        console.log(object);
        if (object) {
          object.material.dispose();
          object.geometry.dispose();
          this.messages.shift();
          this.scene.remove(object);
        }
      }
    }, 5000);
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
