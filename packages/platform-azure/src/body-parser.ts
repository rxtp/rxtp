import { Injectable, Middleware } from "@rxtp/core";
import { Message } from "./message.js";
import { Observable, map } from "rxjs";

@Injectable()
export class AzureBodyParser implements Middleware {
  preHandle(message$: Observable<Message>): Observable<Message> {
    return message$.pipe(
      map((message) => {
        const req = (message as any).request;
        if (req) {
          message.body = req.body ?? req.rawBody ?? message.body;
        }
        return message;
      }),
    );
  }
}
