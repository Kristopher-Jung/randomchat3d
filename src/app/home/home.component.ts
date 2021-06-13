import { Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {UserService} from "../shared/services/UserService";
import {Subscription} from "rxjs";
import * as THREE from "three";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  public enableBackground = true;
  private subscriptions = new Subscription();
  @ViewChild('backgroundRendererContainer') rendererContainer: any;

  renderer = new THREE.WebGLRenderer();
  scene: any = null;
  camera: any = null;
  mesh:any = null;

  constructor(private userService: UserService) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera.position.z = 1000;
    const geometry = new THREE.BoxGeometry(200, 200, 200);
    const material = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true});
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
  }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.isUserLoggedIn.subscribe((status: boolean) => {
      this.enableBackground = !status;
      console.log("enableBackground:" + this.enableBackground);
      setTimeout(() => {
        if (this.enableBackground && this.rendererContainer) {
          this.run();
        }
      },0);
    }));
  }

  run() {
    console.log("run called!");
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
    this.animate();
  }

  animate() {
    if(this.enableBackground) {
      window.requestAnimationFrame(() => this.animate());
      this.mesh.rotation.x += 0.01;
      this.mesh.rotation.y += 0.02;
      this.renderer.render(this.scene, this.camera);
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
