import "reflect-metadata";

import { Handler, ErrorHandler, Injectable, Platform, Inject, Lifecycle } from "./src";
import { map, Observable, tap } from "rxjs";
import * as http from "http";

const PORT = Number(process.env.PORT) || 3000;

type M = { res: http.ServerResponse, req: http.IncomingMessage }

@Injectable()
class MyErrorHandler implements ErrorHandler<M> {
  handleError(message$: Observable<[M, Error]>): Observable<M> {
    return message$.pipe(
      tap(([message, error]) => {
        console.error("Error:", error);
        message.res.statusCode = 500;
        message.res.setHeader("Content-Type", "text/plain");
        message.res.setHeader("x-error", String(error?.message ?? ""));
        message.res.end("An error occurred");
      }),
      map(([message, error]) => message)
    );
  }
}

@Injectable()
class MyHandler implements Handler<M> {
  handle(message$: Observable<M>): Observable<M> {
    return message$.pipe(
      tap((message) => {
        message.res.statusCode = 200;
        message.res.setHeader("Content-Type", "application/json");
        message.res.end(JSON.stringify({ message: this.service.foo() }));
      }),

    );
  }
}

@Injectable()
class Service {
  foo() {
    return 'asd';
  }
}


const { platform } = Platform.createPlatform([{ provide: Handler, useClass: MyHandler }, { provide: ErrorHandler, useClass: MyErrorHandler }, { provide: Service, useClass: Service }]);

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
  platform.message.next({ req, res });
});

server.listen(PORT, () => {
  console.log(`Platform-backed server listening: http://localhost:${PORT}`);
});
