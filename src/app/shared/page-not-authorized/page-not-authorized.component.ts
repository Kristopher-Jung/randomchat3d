import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-page-not-authorized',
  templateUrl: './page-not-authorized.component.html',
  styleUrls: ['./page-not-authorized.component.css']
})
export class PageNotAuthorizedComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.router.navigate(['']);
    }, 3000);
  }

}
