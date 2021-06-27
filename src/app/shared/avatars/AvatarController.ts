import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import {Injectable} from "@angular/core";
import * as THREE from "three";
import {AvatarControllerInput} from "./AvatarControllerInput";
import {BehaviorSubject, Subject} from "rxjs";

@Injectable()
export class AvatarController {

  public loadingManager: any;
  public loader: any;
  public chars = new Map<number, any>();
  public animations = new Map<number, any>();
  public mixers = new Map<number ,any>();
  public avatarControllerInput: any;
  public loadingProgressListener = new Subject<{message:string; progress:number}>();
  public assetLoadCompleted = new BehaviorSubject(false);

  constructor() {
    this.loadingManager = new THREE.LoadingManager();
    this.loader = new FBXLoader(this.loadingManager);
    this.addLoadingManagerListener();
  }

  addLoadingManagerListener() {
    this.loadingManager.onStart = (url: string, itemsLoaded: string, itemsTotal: string) => {
      const message = 'Started loading file: ' + url;
      const progress = +itemsLoaded/+itemsTotal*100;
      this.loadingProgressListener.next({message, progress});
    };
    this.loadingManager.onLoad = () => {
      const message = 'Loading Complete!';
      const progress = 100;
      this.loadingProgressListener.next({message, progress});
      this.assetLoadCompleted.next(true);
    };
    this.loadingManager.onProgress = (url: string, itemsLoaded: string, itemsTotal: string) => {
      const message = 'Started loading file: ' + url;
      const progress = +itemsLoaded/+itemsTotal*100;
      this.loadingProgressListener.next({message, progress});
    };
    this.loadingManager.onError = (url: string) => {
      const message = 'There was an error loading ' + url;
      const progress = 100;
      this.loadingProgressListener.next({message, progress});
    };
  }

  controllerInputInit(document: any) {
    this.avatarControllerInput = new AvatarControllerInput(document);
  };

  load(): void {
    this.loader.setPath(`assets/static/characters/`);
    const charsList = ['Kaya', 'Claire'];
    this.loadHelper(charsList, 0);
    this.loadHelper(charsList, 1);
  }

  loadHelper(charsList:any, number: any) {
    this.animations.set(number, new Map());
    this.mixers.set(number, new Map());
    this.chars.set(number, new Map());
    charsList.forEach((charname:any) => {
      setTimeout(()=>{
        this.loader.load(`${charname}.fbx`, (fbx: any) => {
          fbx.scale.setScalar(1);
          fbx.traverse((c:any) => {
            c.castShadow = true;
          });
          fbx.name = charname
          this.chars.get(number)?.set(fbx.name, fbx);
          this.loadAnims(number, fbx);
        });
      },0);
    });
  }

  loadAnims(number:any, fbx: any): void {
    this.loader.setPath(`assets/static/animations/`);
    const animsList = ['idle', 'walk'];
    this.animations.get(number).set(fbx.name, new Map<string, any>());
    this.mixers.get(number).set(fbx.name, new THREE.AnimationMixer(fbx));
    animsList.forEach((name) => {
      setTimeout(()=>{
        this.loader.load(`${name}.fbx`, (anim: { animations: any[]; }) => {
          const mixer = this.mixers.get(number).get(fbx.name);
          const clip = anim.animations[0];
          const action = mixer.clipAction(clip);
          action.name = name;
          this.animations.get(number).get(fbx.name).set(name, action);
        });
      },0);
    });
  }


}
