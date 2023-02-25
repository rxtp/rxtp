import { Finalizer, HttpHeaders, HttpStatusCode, Injectable } from '@rxtp/core';
import { NodeMessage } from './message.js';
import { Observable, tap } from 'rxjs';

const RESPONSE = 'Not Found';

const RESPONSE_HEADERS: HttpHeaders = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Content-Length': Buffer.byteLength(RESPONSE).toString(),
};

@Injectable()
export class NodeFinalizer implements Finalizer {
  finalize(httpRequest$: Observable<NodeMessage>): Observable<NodeMessage> {
    return httpRequest$.pipe(
      tap((httpRequest) => {
        if (!httpRequest.response.writableEnded) {
          httpRequest.response.statusCode = HttpStatusCode.NotFound;
          for (const [key, value] of Object.entries(RESPONSE_HEADERS)) {
            httpRequest.response.setHeader(key, value);
          }
          const response =
            httpRequest.request.method === 'HEAD' ? '' : RESPONSE;
          httpRequest.response.write(response);
          httpRequest.response.end();
        }
      })
    );
  }
}
