import {Injectable} from "@angular/core";
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpRequest} from "@angular/common/http";
import {Observable, throwError } from "rxjs";
import { catchError } from 'rxjs/operators';
import {MessageService} from "primeng/api";

@Injectable({
  providedIn: 'root'
})
export class HttpInterceptor implements HttpInterceptor {

  constructor(private messageService: MessageService) {
  }

  intercept (req: HttpRequest<any>, next: HttpHandler) : Observable<HttpEvent<any>> {
    return next.handle(req)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          let errorMsg = '';
          //client side error
          if (error.error instanceof ErrorEvent) {
            errorMsg = `Error: ${error.error.message}`;
          } else { // server side error
            errorMsg = `Error Code: ${error.status}, Message: ${error.message}`;
            const msg = {
              key:'',
              severity:'',
              summary:'',
              detail:errorMsg
            };
            switch (error.status) {
              case 500: //error
                msg.key = 'fatal';
                msg.severity = 'error';
                msg.summary = 'Error';
                this.messageService.add(msg);
                break;
              default:
                break;
            }
          }
          return throwError(errorMsg);
        })
      )
  }
}

