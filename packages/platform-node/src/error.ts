import { ErrorHandler, HttpStatusCode, Injectable } from '@rxtp/core';
import { Message } from './message.js';
import { map, Observable } from 'rxjs';

@Injectable()
export class NodeErrorHandler implements ErrorHandler {
  handleError(error$: Observable<[Message, Error]>): Observable<Message> {
    return error$.pipe(
      map(([message, error]) => {
        if (!message.response.writableEnded) {
          message.respond(error.message, HttpStatusCode.InternalServerError);
        }
        return message;
      })
    );
  }
}
