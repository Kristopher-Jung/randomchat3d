import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent implements OnInit {

  public message: string = "";

  constructor(public config: DynamicDialogConfig) {
    this.message = this.config.data;
  }

  ngOnInit(): void {
  }

}
