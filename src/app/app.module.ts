import {NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HomeComponent} from './home/home.component';
import {ChatComponent} from './chat/chat.component';
import {VoiceComponent} from './chat/voice/voice.component';
import {CanvasComponent} from './chat/canvas/canvas.component';
import {FooterComponent} from './home/footer/footer.component';
import {PageNotFoundComponent} from './shared/components/page-not-found/page-not-found.component';
import {HeaderComponent} from './home/header/header.component';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MenubarModule} from "primeng/menubar";
import {MessageService, SharedModule} from "primeng/api";
import {InputTextModule} from "primeng/inputtext";
import {ToolbarModule} from "primeng/toolbar";
import {ButtonModule} from "primeng/button";
import {SplitButtonModule} from "primeng/splitbutton";
import {InputTextareaModule} from "primeng/inputtextarea";
import {FormsModule} from "@angular/forms";
import {WebsocketService} from "./shared/services/WebsocketService";
import {LoginComponent} from "./login/login.component";
import {UserService} from "./shared/services/UserService";
import {ProfileComponent} from './login/profile/profile.component';
import {PageNotAuthorizedComponent} from './shared/components/page-not-authorized/page-not-authorized.component';
import {DividerModule} from "primeng/divider";
import {CardModule} from "primeng/card";
import {PasswordModule} from "primeng/password";
import { SignupComponent } from './login/signup/signup.component';
import {DynamicDialogModule} from "primeng/dynamicdialog";
import {BlockUIModule} from "primeng/blockui";
import {ProgressBarModule} from "primeng/progressbar";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {HttpInterceptor} from "./shared/interceptors/http-interceptor";
import {ToastModule} from "primeng/toast";
import { LoadingComponent } from './shared/components/loading/loading.component';
import {AvatarController} from "./shared/avatars/AvatarController";

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
    PageNotAuthorizedComponent,
    SignupComponent,
    LoadingComponent
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
    DividerModule,
    CardModule,
    PasswordModule,
    DynamicDialogModule,
    BlockUIModule,
    ProgressBarModule,
    ProgressSpinnerModule,
    HttpClientModule,
    ToastModule
  ],
  providers: [
    WebsocketService,
    UserService,
    MessageService,
    AvatarController,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
