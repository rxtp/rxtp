import { ErrorHandler, HttpStatusCode, Injectable } from '@rxtp/core';
import { NodeMessage } from './message.js';
import { map, Observable } from 'rxjs';

@Injectable()
export class NodeErrorHandler implements ErrorHandler {
  handleError(
    error$: Observable<[NodeMessage, Error]>
  ): Observable<NodeMessage> {
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
