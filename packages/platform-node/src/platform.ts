import {
  ErrorHandler,
  Finalizer,
  HttpStatusCode,
  Injectable,
  Injector,
  Platform,
  PLATFORM_ID,
  PlatformID,
  Provider,
  Redirector,
  Route,
  Router,
} from '@rxtp/core';
import { HttpRequestNode } from './message';
import { map, Observable, tap } from 'rxjs';
import { IncomingMessage, RequestListener, ServerResponse } from 'http';

const NODE_PLATFORM_ID: PlatformID = 'node';

@Injectable()
class NodeFinalizer implements Finalizer {
  finalize(
    httpRequest$: Observable<HttpRequestNode>
  ): Observable<HttpRequestNode> {
    return httpRequest$.pipe(
      tap((httpRequest) => {
        if (!httpRequest.response.writableEnded) {
          httpRequest.respond('no response from app', HttpStatusCode.NotFound);
        }
      })
    );
  }
}

@Injectable()
class NodeErrorHandler implements ErrorHandler {
  handleError(
    error$: Observable<[HttpRequestNode, Error]>
  ): Observable<HttpRequestNode> {
    return error$.pipe(
      map(([httpRequest, error]) => {
        if (httpRequest.response.writableEnded) {
          return httpRequest;
        }
        httpRequest.respond(error.message, HttpStatusCode.InternalServerError);
        return httpRequest;
      })
    );
  }
}

@Injectable()
class NodeRedirector implements Redirector {
  redirect(message$: Observable<HttpRequestNode>): Observable<HttpRequestNode> {
    return message$.pipe(
      map((message) => {
        message.respond(undefined, HttpStatusCode.MovedPermanently);
        return message;
      })
    );
  }
}

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
    const httpRequest = new HttpRequestNode(request, response);
    platform.message.next(httpRequest);
  };
}
