# RXTP

> **Warning**
> Work in progress - not ready for production

Platform-agnostic, reactive HTTP framework, optimized for serverless and build with Typescript

## Example Application

```typescript
import 'reflect-metadata';

import { Handler, Injectable, Message, Route } from '@rxtp/core';
import { createRequestListener } from '@rxtp/platform-node';
import { Observable, tap } from 'rxjs';
import { Server } from 'http';

@Injectable()
class MyHandler implements Handler {
  handle(message$: Observable<Message>): Observable<Message> {
    return message$.pipe(
      tap((message) => {
        message.respond('Hello from MyHandler!');
      })
    );
  }
}

const ROUTES: Route[] = [{ path: 'my-path', handler: MyHandler }];

const requestListener = createRequestListener(ROUTES);
const server = new Server(requestListener);
server.listen(3000);
```

``` json
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  }
}
```

## Packages

- `@rxtp/core`: The core platform-agnostic framework with reactive HTTP request/response handling and routing capabilities.
- `@rxtp/platform-node`: Node.js platform adapter.
