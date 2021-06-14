import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {UserService} from "../shared/services/UserService";
import {Subscription} from "rxjs";
import * as THREE from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  @ViewChild('backgroundRendererContainer') rendererContainer: any;
  public enableBackground = true;
  public renderer: any = null;
  public scene: any = null;
  public camera: any = null;
  public mesh: any = null;
  public textureLoader = new THREE.TextureLoader();
  private subscriptions = new Subscription();
  public clock = new THREE.Clock();
  public GLTFLoader = new GLTFLoader();

  constructor(private userService: UserService) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera.position.z = 40;
    this.camera.position.y = 10;
    this.GLTFLoader.load(
      'assets/static/totoro.glb',
      (gltf => {
        console.log(gltf);
        this.mesh = gltf.scene.children[0];
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);
      }))

    const directionalLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(directionalLight);

    const fontLoader = new THREE.FontLoader()
    fontLoader.load(
      'assets/static/font/helvetiker_regular.typeface.json', (helvetiker) => {
        const textGeometry = new THREE.TextBufferGeometry(
          'RandChat4',
          {
            font: helvetiker,
            size: 6,
            height: 1,
            curveSegments: 2,
            bevelEnabled: false,
            bevelThickness: 0.01,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 2
          });
        textGeometry.center();
        const textMaterial = new THREE.MeshBasicMaterial({color: 'black'});
        textMaterial.wireframe = true;
        const text = new THREE.Mesh(textGeometry, textMaterial);
        text.position.y = 35;
        this.scene.add(text);
      });
  }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.isUserLoggedIn.subscribe((status: boolean) => {
      this.enableBackground = !status;
      console.log("enableBackground:" + this.enableBackground);
      setTimeout(() => {
        if (this.enableBackground && this.rendererContainer) {
          this.renderer = new THREE.WebGLRenderer({
            alpha: true
          });
          this.renderer.setClearColor (0xFAE5D3, 0.1);
          this.run();
        }
      }, 0);
    }));
  }

  run() {
    console.log("run called!");
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
    this.animate();
  }

  animate() {
    if (this.enableBackground) {
      const elapsedTime = this.clock.getElapsedTime();
      if (this.mesh) {
        this.mesh.rotation.y = elapsedTime;
        this.mesh.position.y = Math.max(Math.sin(elapsedTime * 2) * 5, 0);
        // this.mesh.rotation.z += 0.02;
      }
      this.renderer.render(this.scene, this.camera);
      window.requestAnimationFrame(() => this.animate());
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: { target: { innerWidth: number; innerHeight: number; }; }) {
    this.renderer.setSize(event.target.innerWidth, event.target.innerHeight)
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
