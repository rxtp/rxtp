import { Message } from './message.js';
import { Injector } from './injector.js';
import { isDefined } from './utilities/check.js';
import { Type } from './types/injector.js';
import { concat, map, of, OperatorFunction, switchMap } from 'rxjs';

export abstract class Middleware {
  abstract preHandle?: OperatorFunction<Message, Message>;
  abstract postHandle?: OperatorFunction<Message, Message>;
}

export function runMiddleware(
  lifecycle: keyof Middleware,
  middlewares: Type<Middleware>[],
  injector: Injector
): OperatorFunction<Message, Message> {
  if (lifecycle === 'postHandle') {
    middlewares = middlewares.reverse();
  }
  return (message$) =>
    message$.pipe(
      switchMap((message) =>
        concat(
          ...middlewares.map((middleware) =>
            injector
              .resolve$(middleware)
              .pipe(
                switchMap((middleware) =>
                  isDefined(middleware[lifecycle])
                    ? middleware[lifecycle](of(message))
                    : of(message)
                )
              )
          )
        ).pipe(map(() => message))
      )
    );
}
