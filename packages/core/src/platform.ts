import { PlatformID } from './types/platform.js';
import { Message } from './message.js';
import { Injector, InjectionToken } from './injector.js';
import { handleError } from './error.js';
import { finalize } from './finalizer.js';
import { Router } from './router.js';
import { runMiddleware } from './middleware.js';
import { redirect } from './redirector.js';
import { handleMessage } from './handler.js';
import { isDefined } from './utilities/check';
import { isHandlerRoute, isRedirectRoute } from './utilities/router.js';
import { map, mergeMap, of, Subject, switchMap } from 'rxjs';

export const PLATFORM_ID = new InjectionToken<PlatformID>('PLATFORM_ID');

export class Platform {
  readonly message = new Subject<Message>();

  readonly message$ = this.message.asObservable().pipe(
    mergeMap((message) => {
      return of(message).pipe(
        this._router.route$(),
        switchMap(([message, [route, middlewares, injector]]) => {
          if (isDefined(route)) {
            return of(message).pipe(
              runMiddleware('preHandle', middlewares, injector),
              isHandlerRoute(route)
                ? handleMessage(route.handler, injector)
                : isRedirectRoute(route)
                ? redirect(route.redirectTo, injector)
                : map(() => message),
              runMiddleware('postHandle', middlewares, injector)
            );
          }
          return of(message);
        }),
        finalize(this._injector),
        handleError(message, this._injector)
      );
    })
  );

  constructor(
    private readonly _router: Router,
    private readonly _injector: Injector
  ) {}
}
