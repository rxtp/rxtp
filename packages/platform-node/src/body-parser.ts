import { Injectable, Middleware } from '@rxtp/core';
import { Message } from './message.js';
import { Observable, from, map, switchMap } from 'rxjs';

@Injectable()
export class NodeBodyParser implements Middleware {
  preHandle(message$: Observable<Message>): Observable<Message> {
    return message$.pipe(
      switchMap((message) =>
        from(
          new Promise((resolve, reject) => {
            const data: Uint8Array[] = [];
            message.request.on('data', (chunk: Uint8Array) => data.push(chunk));
            message.request.on('end', () => {
              message.body = Buffer.concat(data).toString();
              resolve(message);
            });
            message.request.on('error', (error) => reject(error));
          })
        ).pipe(map(() => message))
      )
    );
  }
}
