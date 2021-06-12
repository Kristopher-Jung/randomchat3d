import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {ChatComponent} from "./chat/chat.component";
import {PageNotFoundComponent} from "./shared/page-not-found/page-not-found.component";
import {AuthGuard} from "./shared/guards/auth.guard";
import {ApprovalGuard} from "./shared/guards/approval.guard";
import {LoginComponent} from "./login/login.component";

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children:[
      {
        path:'login',
        component: LoginComponent
      },
      {
        path: 'chat',
        component: ChatComponent,
        canActivate: [AuthGuard, ApprovalGuard],
        canDeactivate: [ApprovalGuard]
      }
    ]
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
