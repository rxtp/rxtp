import { HttpStatusCode } from './types/http.js';
import { MatchedRoute } from './types/router.js';
import { isDefined } from './utilities/check.js';
import { isHandlerRoute, isRedirectRoute } from './utilities/router.js';
import { forkJoin, map, of, OperatorFunction, switchMap } from 'rxjs';
import { Redirector } from './redirector';

export abstract class Message<Request = unknown, Response = unknown> {
  abstract readonly request: Request;
  abstract readonly response: Response;

  abstract get url(): URL;

  abstract get statusCode(): HttpStatusCode;
  abstract set statusCode(statusCode: HttpStatusCode);

  abstract respond(data?: unknown, statusCode?: HttpStatusCode): void;
}

export function handleMessage$(): OperatorFunction<
  [Message, MatchedRoute],
  Message
> {
  return (message$) =>
    message$.pipe(
      switchMap(([message, [route, middlewares, injector]]) => {
        if (isDefined(route)) {
          if (isHandlerRoute(route)) {
            return forkJoin(
              middlewares.map((m) =>
                injector
                  .resolve$(m)
                  .pipe(
                    switchMap((middleware) =>
                      middleware.preHandle
                        ? middleware.preHandle(of(message))
                        : of(message)
                    )
                  )
              )
            ).pipe(
              switchMap(() =>
                injector
                  .resolve$(route.handler, injector)
                  .pipe(switchMap((handler) => handler.handle(of(message))))
              ),
              switchMap(() =>
                forkJoin(
                  middlewares
                    .reverse()
                    .map((m) =>
                      injector
                        .resolve$(m)
                        .pipe(
                          switchMap((middleware) =>
                            middleware.postHandle
                              ? middleware.postHandle(of(message))
                              : of(message)
                          )
                        )
                    )
                )
              ),
              map(() => message)
            );
          }
          if (isRedirectRoute(route)) {
            return injector
              .resolve$(Redirector, injector)
              .pipe(
                switchMap((redirector) => redirector.redirect(of(message)))
              );
          }
        }
        // No route found
        return of(message);
      })
    );
}
