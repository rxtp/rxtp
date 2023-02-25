import { HttpStatusCode, Injectable, Redirector } from '@rxtp/core';
import { NodeMessage } from './message';
import { map, Observable } from 'rxjs';

@Injectable()
export class NodeRedirector implements Redirector {
  redirect(message$: Observable<NodeMessage>): Observable<NodeMessage> {
    return message$.pipe(
      map((message) => {
        if (!message.response.writableEnded) {
          message.respond(undefined, HttpStatusCode.MovedPermanently);
        }
        return message;
      })
    );
  }
}
