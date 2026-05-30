# RXTP

> [!WARNING]
> Work in progress - not ready for production

## Install

> [!NOTE]
> RXTP is distributed directly via this repository to emphasize transparency, autonomy, and source engagement over reliance on third-party registries. This approach allows users to review, audit, and tailor the library to their needs, while avoiding potential risks or restrictions imposed by centralized package platforms.

```bash
# Install the latest version from GitHub
npm install github:rxtp/rxtp
```

#### Example Application

```typescript
import "reflect-metadata";

import { Handler, ErrorHandler, Injectable, Platform, Providers, MessageAndError } from "@rxtp/core";
import { tap, map, OperatorFunction } from "rxjs";
import * as http from "http";

const PORT = Number(process.env.PORT) || 3000;

type ApplicationMessage = { res: http.ServerResponse; req: http.IncomingMessage };

@Injectable()
class LoggerService {
  log(message: string) {
    console.log(`[Log]: ${message}`);
  }
}

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
  constructor(private readonly logger: LoggerService) {
    super();
  }

  readonly handle: OperatorFunction<ApplicationMessage, ApplicationMessage> = (message$) =>
    message$.pipe(
      tap(({ res }) => {
        this.logger.log("Handling request...");
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/plain");
        res.end("hello");
      }),
    );
}

const providers: Providers = [
  LoggerService,
  { provide: Handler, useClass: ApplicationHandler },
  { provide: ErrorHandler, useClass: ApplicationErrorHandler },
];

const { platform } = Platform.createPlatform<ApplicationMessage>(providers);

const server = http.createServer((req, res) => platform.message.next({ req, res }));

server.listen(PORT, () => console.log(`Platform-backed server listening: http://localhost:${PORT}`));

```

```json
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  }
}
```
