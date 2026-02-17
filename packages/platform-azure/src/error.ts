import { ErrorHandler, HttpStatusCode, Injectable } from "@rxtp/core";
import { Message } from "./message.js";
import { map, Observable } from "rxjs";

@Injectable()
export class AzureErrorHandler implements ErrorHandler {
  handleError(error$: Observable<[Message, Error]>): Observable<Message> {
    return error$.pipe(
      map(([message, error]) => {
        const ctxRes =
          (message as any).context?.res || (message as any).response;
        if (ctxRes) {
          ctxRes.status = HttpStatusCode.InternalServerError;
          ctxRes.headers = {
            ...(ctxRes.headers || {}),
            "Content-Type": "text/plain",
          } as any;
          ctxRes.body = error.message;
        }
        return message;
      }),
    );
  }
}
