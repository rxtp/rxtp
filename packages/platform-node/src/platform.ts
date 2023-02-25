import {
  ErrorHandler,
  Finalizer,
  Injectable,
  Middleware,
  Platform,
  PLATFORM_ID,
  PlatformID,
  Providers,
  Redirector,
  Route,
  ROUTES,
} from '@rxtp/core';
import { Message } from './message.js';
import { NodeRedirector } from './redirector.js';
import { NodeErrorHandler } from './error.js';
import { NodeFinalizer } from './finalizer.js';
import { IncomingMessage, RequestListener, ServerResponse } from 'http';

const PLATFORM_NODE_ID: PlatformID = 'node';

const PLATFORM_NODE_PROVIDERS: Providers = [
  { provide: Redirector, useClass: NodeRedirector },
  { provide: Finalizer, useClass: NodeFinalizer },
  { provide: ErrorHandler, useClass: NodeErrorHandler },
  { provide: PLATFORM_ID, useValue: PLATFORM_NODE_ID },
];

export function createRequestListener(
  routes: Route[],
  providers: Providers = []
): RequestListener {
  const platformNode = Platform.createPlatform([
    ...PLATFORM_NODE_PROVIDERS,
    { provide: ROUTES, useValue: routes },
    ...providers,
  ]);
  platformNode.message$.subscribe();
  return (request: IncomingMessage, response: ServerResponse) => {
    const httpRequest = Message.createNodeMessage(request, response);
    platformNode.message.next(httpRequest);
  };
}
