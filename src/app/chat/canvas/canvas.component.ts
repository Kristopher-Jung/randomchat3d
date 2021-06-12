import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from 'dat.gui';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
