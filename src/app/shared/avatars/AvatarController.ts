import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import {Injectable} from "@angular/core";
import * as THREE from "three";
import {AvatarControllerInput} from "./AvatarControllerInput";
import {BehaviorSubject, Subject} from "rxjs";

@Injectable()
export class AvatarController {

  public loadingManager: any;
  public loader: any;
  public chars: any[] = [];
  public animations = new Map<string, Map<string, any>>();
  public mixers = new Map<string ,any>();
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
    this.chars = [];
    this.animations = new Map<string, Map<string, any>>();
    this.mixers = new Map<string, any>();
    charsList.forEach((charname) => {
      setTimeout(()=>{
        this.loader.load(`${charname}.fbx`, (fbx: { scale: { setScalar: (arg0: number) => void; }; traverse: (arg0: (c: any) => void) => void; name: string; }) => {
          fbx.scale.setScalar(1);
          fbx.traverse(c => {
            c.castShadow = true;
          });
          fbx.name = charname
          this.chars.push(fbx);
          this.loadAnims(fbx);
        });
      },0);
    });
  }

  loadAnims(fbx: any): void {
    this.loader.setPath(`assets/static/animations/`);
    const animsList = ['idle', 'walk'];
    this.animations.set(fbx.name, new Map<string, any>());
    this.mixers.set(fbx.name, new THREE.AnimationMixer(fbx));
    animsList.forEach((name) => {
      setTimeout(()=>{
        this.loader.load(`${name}.fbx`, (anim: { animations: any[]; }) => {
          const mixer = this.mixers.get(fbx.name);
          const clip = anim.animations[0];
          const action = mixer.clipAction(clip);
          action.name = name;
          this.animations.get(fbx.name)?.set(name, action);
        });
      },0);
    });
  }


}
