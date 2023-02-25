import {
  HttpHeaders,
  HttpStatusCode,
  Injectable,
  Path,
  Redirector,
} from '@rxtp/core';
import { NodeMessage } from './message.js';
import { map, Observable } from 'rxjs';

const RESPONSE_STATUS_CODE: HttpStatusCode = HttpStatusCode.MovedPermanently;
const RESPONSE_HEADERS: HttpHeaders = {
  Location: '',
};

@Injectable()
export class NodeRedirector implements Redirector {
  redirect(message$: Observable<[NodeMessage, Path]>): Observable<NodeMessage> {
    return message$.pipe(
      map(([message, path]) => {
        if (!message.response.writableEnded) {
          const url = new URL(path, message.url);
          message.response.statusCode = RESPONSE_STATUS_CODE;
          RESPONSE_HEADERS['Location'] = url.toString();
          for (const [key, value] of Object.entries(RESPONSE_HEADERS)) {
            message.response.setHeader(key, value);
          }
          message.response.end();
        }
        return message;
      })
    );
  }
}
