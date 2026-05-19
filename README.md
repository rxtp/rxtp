# RXTP

> [!WARNING]
> Work in progress - not ready for production

```ocaml
Build With Nix
```

#### Example Application

```typescript
import "reflect-metadata";

import { Handler, ErrorHandler, Injectable, Platform, Providers, MessageAndError } from "./src";
import { tap, map, OperatorFunction } from "rxjs";
import * as http from "http";

const PORT = Number(process.env.PORT) || 3000;

type ApplicationMessage = { res: http.ServerResponse; req: http.IncomingMessage };

@Injectable()
class ApplicationErrorHandler extends ErrorHandler<ApplicationMessage> {
  readonly handleError: OperatorFunction<MessageAndError<ApplicationMessage>, ApplicationMessage> = (messageAndError$) =>
    messageAndError$.pipe(
      tap(({ message, error }) => {
        console.error("Error:", error);
        message.res.statusCode = 500;
        message.res.setHeader("Content-Type", "text/plain");
        message.res.end("Internal error");
      }),
      map(({ message }) => message),
    );
}

@Injectable()
class ApplicationHandler extends Handler<ApplicationMessage> {
  readonly handle: OperatorFunction<ApplicationMessage, ApplicationMessage> = (message$) =>
    message$.pipe(
      tap(({ res }) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/plain");
        res.end("hello");
      }),
    );
}

const providers: Providers = [
  { provide: Handler, useClass: ApplicationHandler },
  { provide: ErrorHandler, useClass: ApplicationErrorHandler },
];

const { platform } = Platform.createPlatform(providers);

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => platform.message.next({ req, res }));
const _ = server.listen(PORT, () => console.log(`Platform-backed server listening: http://localhost:${PORT}`));

```

```json
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  }
}
```
