import { Finalizer, HttpStatusCode, Injectable } from '@rxtp/core';
import { Observable, tap } from 'rxjs';
import { NodeMessage } from './message';

@Injectable()
export class NodeFinalizer implements Finalizer {
  finalize(
    httpRequest$: Observable<NodeMessage>
  ): Observable<NodeMessage> {
    return httpRequest$.pipe(
      tap((httpRequest) => {
        if (!httpRequest.response.writableEnded) {
          httpRequest.respond('no response from app', HttpStatusCode.NotFound);
        }
      })
    );
  }
}
