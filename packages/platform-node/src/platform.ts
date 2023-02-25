import {
  ErrorHandler,
  Finalizer,
  Injector,
  Platform,
  PLATFORM_ID,
  PlatformID,
  Provider,
  Redirector,
  Route,
  Router,
} from '@rxtp/core';
import { NodeMessage } from './message.js';
import { NodeRedirector } from './redirector.js';
import { NodeErrorHandler } from './error.js';
import { NodeFinalizer } from './finalizer.js';
import { IncomingMessage, RequestListener, ServerResponse } from 'http';

const NODE_PLATFORM_ID: PlatformID = 'node';

export function createRequestListener(
  routes: Route[],
  providers: Provider<unknown>[] = []
): RequestListener {
  const injector = new Injector([
    { provide: PLATFORM_ID, useValue: NODE_PLATFORM_ID },
    { provide: Redirector, useClass: NodeRedirector },
    { provide: Finalizer, useClass: NodeFinalizer },
    { provide: ErrorHandler, useClass: NodeErrorHandler },
    ...providers,
  ]);
  const router = new Router(routes, injector);
  const platform = new Platform(router, injector);
  platform.message$.subscribe();
  return (request: IncomingMessage, response: ServerResponse) => {
    const httpRequest = new NodeMessage(request, response);
    platform.message.next(httpRequest);
  };
}
