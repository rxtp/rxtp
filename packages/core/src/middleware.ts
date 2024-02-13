import { MiddlewareLifecycle, Middlewares } from './types/middleware.js';
import { isDefined } from './utilities/check.js';
import { Message } from './message.js';
import { Injector } from './injector.js';
import { concat, iif, mergeMap, of, OperatorFunction } from 'rxjs';

export abstract class Middleware {
  abstract preHandle?: OperatorFunction<Message, Message>;
  abstract postHandle?: OperatorFunction<Message, Message>;
}

export function runMiddlewares(
  lifecycle: MiddlewareLifecycle,
  middlewares: Middlewares,
  injector: Injector
): OperatorFunction<Message, Message> {
  return (message$) =>
    message$.pipe(
      mergeMap((message) =>
        iif(
          () => middlewares.length > 0,
          concat(
            ...(lifecycle === 'postHandle'
              ? middlewares.reverse()
              : middlewares
            ).map((middleware) =>
              injector
                .resolve(middleware)
                .pipe(
                  mergeMap((middleware) =>
                    iif(
                      () => isDefined(middleware[lifecycle]),
                      middleware[lifecycle](of(message)),
                      of(message)
                    )
                  )
                )
            )
          ),
          of(message)
        )
      )
    );
}
