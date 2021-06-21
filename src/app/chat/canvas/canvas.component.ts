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

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements AfterViewInit, OnInit, OnDestroy, OnChanges {

  @ViewChild('rendererContainer') rendererContainer: any;
  @Input('selectedChar') selectedChar: string | null = 'Kaya';

  public renderer = new THREE.WebGLRenderer();
  public scene: any = null;
  public camera: any = null;
  public mesh: any = null;
  public loader = new THREE.FontLoader();
  public GLTFLoader = new GLTFLoader();
  private subscriptions = new Subscription();
  public font: any = null;
  public messages: string[] = [];
  private interval: any;
  private clock: any = new THREE.Clock();
  private characterObjs: any[] = [];
  private characterAnims: any;
  private currentCharacter: any;
  private currCharAction: any;
  private mixers: any;

  constructor(private userService: UserService, private webSocketService: WebsocketService, private avatarController: AvatarController) {
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
      //TODO
      console.log(selectedChar);
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
          new THREE.MeshPhongMaterial({color: 'white', depthWrite: false})
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
            this.scene.add(this.currentCharacter);
            this.characterAnims = this.avatarController.animations;
            this.characterAnims.get(this.currentCharacter.name).forEach((action: any)=>{
              action.enabled = false;
              action.play();
            });
            if(this.characterAnims) {
              this.mixers = this.avatarController.mixers;
              this.currCharAction = this.characterAnims.get(this.currentCharacter.name).get('idle');
              // this.currCharAction.play();
              this.avatarController.controllerInputInit(document);
              this.animate();
            }
          }
        }
      }
    }));
  }

  animate() {
    window.requestAnimationFrame(() => this.animate());
    if (this.mixers && this.clock && this.selectedChar) {
      let mixerUpdateDelta = this.clock.getDelta();
      this.mixers.get(this.selectedChar).update(mixerUpdateDelta);
    }
    const keyInput = this.avatarController.avatarControllerInput.keys;
    this.handleKeyInput(keyInput);
    this.renderer.render(this.scene, this.camera);
  }

  handleKeyInput(keyInput: any) {
    if(keyInput.forward){
      this.currCharAction.enabled = false;
      this.currCharAction = this.characterAnims.get(this.selectedChar).get('walk');
      this.currentCharacter.position.z +=3;
      this.currCharAction.enabled = true;
    } else if(!keyInput.forward) {
      this.currCharAction.enabled = false;
      this.currCharAction = this.characterAnims.get(this.selectedChar).get('idle');
      this.currCharAction.enabled = true;
    }
    if(keyInput.left){

    }
    if(keyInput.backward){

    }
    if(keyInput.right){
      this.currentCharacter.rotation.y +=1;
    }
    if(keyInput.space){

    }
    if(keyInput.shift){

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
    this.subscriptions.unsubscribe();
  }

}
