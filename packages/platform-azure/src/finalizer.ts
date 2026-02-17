import { Finalizer, HttpHeaders, Injectable } from "@rxtp/core";
import { Message } from "./message.js";
import { Observable, tap } from "rxjs";

const RESPONSE = "Not Found";

const RESPONSE_HEADERS: HttpHeaders = {
  "Content-Type": "text/plain; charset=utf-8",
  "Content-Length": Buffer.byteLength(RESPONSE).toString(),
};

@Injectable()
export class AzureFinalizer implements Finalizer {
  finalize(httpRequest$: Observable<Message>): Observable<Message> {
    return httpRequest$.pipe(
      tap((httpRequest) => {
        const ctxRes =
          (httpRequest as any).context?.res || (httpRequest as any).response;
        if (ctxRes && (ctxRes.body === undefined || ctxRes.body === null)) {
          ctxRes.headers = {
            ...(ctxRes.headers || {}),
            ...RESPONSE_HEADERS,
          } as any;
          const response =
            (httpRequest as any).method === "HEAD" ? "" : RESPONSE;
          ctxRes.body = response;
        }
      }),
    );
  }
}
