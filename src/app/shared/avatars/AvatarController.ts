import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import {Injectable} from "@angular/core";
import * as THREE from "three";
import {AvatarControllerInput} from "./AvatarControllerInput";
import {Subject} from "rxjs";

@Injectable()
export class AvatarController {

  public FBXLoader = new FBXLoader();
  public animLoader = new FBXLoader();
  public loadingManager = new THREE.LoadingManager();
  public mixer: any;
  public chars = new Map<string, any>();
  public animations = new Map();
  public avatarControllerInput: any;
  public loadListener = new Subject<boolean>();

  constructor() {
    this.loadingManager.onLoad = () => {
      console.log("animation loaded");
    };
  }

  controllerInputInit(document: any) {
    this.avatarControllerInput = new AvatarControllerInput(document);
  };

  loadChar(username: string, char: string): void {
    this.chars.delete(username);
    console.log(username, char);
    this.FBXLoader.setPath(`assets/static/characters/`);
    this.FBXLoader.load(`${char}.fbx`, fbx => {
      fbx.scale.setScalar(1);
      fbx.traverse(c => {
        c.castShadow = true;
      });
      // console.log(fbx);
      fbx.name = username;
      this.chars.set(username, fbx);
      this.animLoader.setPath(`assets/static/animations/`);
      this.animLoader.load('walk.fbx', (anim) => {
        this.mixer = new THREE.AnimationMixer(fbx);
        const clip = anim.animations[0];
        const action = this.mixer.clipAction(clip);
        this.animations.set('walk', {
          clip: clip,
          action: action
        });
        console.log("load char/anim completed!");
        // console.log(this.chars);
        // console.log(this.animations);
        this.loadListener.next(true);
      });
    });
  }


}
