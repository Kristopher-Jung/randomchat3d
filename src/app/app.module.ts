import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ChatComponent } from './chat/chat.component';
import { VoiceComponent } from './chat/voice/voice.component';
import { CanvasComponent } from './chat/canvas/canvas.component';
import { FooterComponent } from './home/footer/footer.component';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
import { HeaderComponent } from './home/header/header.component';
import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MenubarModule} from "primeng/menubar";
import {SharedModule} from "primeng/api";
import {InputTextModule} from "primeng/inputtext";
import {ToolbarModule} from "primeng/toolbar";
import {ButtonModule} from "primeng/button";
import {SplitButtonModule} from "primeng/splitbutton";
import {InputTextareaModule} from "primeng/inputtextarea";
import {FormsModule} from "@angular/forms";
import {WebsocketService} from "./shared/services/WebsocketService";
import {LoginComponent} from "./login/login.component";
import {UserService} from "./shared/services/UserService";
import { ProfileComponent } from './login/profile/profile.component';
import { PageNotAuthorizedComponent } from './shared/page-not-authorized/page-not-authorized.component';
import {DividerModule} from "primeng/divider";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ChatComponent,
    VoiceComponent,
    CanvasComponent,
    FooterComponent,
    PageNotFoundComponent,
    HeaderComponent,
    LoginComponent,
    ProfileComponent,
    PageNotAuthorizedComponent
  ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        MenubarModule,
        SharedModule,
        InputTextModule,
        ToolbarModule,
        ButtonModule,
        SplitButtonModule,
        InputTextareaModule,
        FormsModule,
        DividerModule
    ],
  providers: [
    WebsocketService,
    UserService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
