import {
  HttpHeaders,
  HttpStatusCode,
  Injectable,
  Path,
  Redirector,
} from "@rxtp/core";
import { Message } from "./message.js";
import { map, Observable } from "rxjs";

const RESPONSE_STATUS_CODE: HttpStatusCode = HttpStatusCode.MovedPermanently;
const RESPONSE_HEADERS: HttpHeaders = {
  Location: "",
};

@Injectable()
export class AzureRedirector implements Redirector {
  redirect(message$: Observable<[Message, Path]>): Observable<Message> {
    return message$.pipe(
      map(([message, path]) => {
        const ctxRes =
          (message as any).context?.res || (message as any).response;
        if (ctxRes) {
          const url = new URL(path, (message as any).url);
          ctxRes.status = RESPONSE_STATUS_CODE;
          RESPONSE_HEADERS["Location"] = url.toString();
          ctxRes.headers = {
            ...(ctxRes.headers || {}),
            ...RESPONSE_HEADERS,
          } as any;
          ctxRes.body = "";
        }
        return message;
      }),
    );
  }
}
