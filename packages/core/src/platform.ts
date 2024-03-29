import { PlatformID } from './types/platform.js';
import { Message } from './message.js';
import { InjectionToken, Injector } from './injector.js';
import { handleError } from './error.js';
import { finalizeMessage } from './finalizer.js';
import { Routes } from './types/router.js';
import { Router } from './router.js';
import { runMiddlewares } from './middleware.js';
import { redirectMessage } from './redirector.js';
import { handleMessage } from './handler.js';
import { isDefined } from './utilities/check.js';
import { isHandlerRoute, isRedirectRoute } from './utilities/router.js';
import { iif, map, mergeMap, of, Subject } from 'rxjs';
import { Providers } from './types/injector';

export const PLATFORM_ID = new InjectionToken<PlatformID>('PLATFORM_ID');

export class Platform {
  readonly message = new Subject<Message>();

  readonly message$ = this.message.asObservable().pipe(
    mergeMap((message) =>
      of(message).pipe(
        this._router.routeMessage(),
        mergeMap(([message, [route, middlewares, injector]]) =>
          iif(
            () => isDefined(route),
            of(message).pipe(
              runMiddlewares('preHandle', middlewares, injector),
              isHandlerRoute(route)
                ? handleMessage(route.handler, injector)
                : isRedirectRoute(route)
                ? redirectMessage(route.redirectTo, injector)
                : map(() => message),
              runMiddlewares('postHandle', middlewares, injector)
            ),
            of(message)
          )
        ),
        finalizeMessage(this._injector),
        handleError(message, this._injector)
      )
    )
  );

  constructor(
    private readonly _injector: Injector,
    private readonly _router: Router
  ) {}

  public static createPlatform(routes: Routes, providers: Providers) {
    const injector = Injector.createPlatformInjector(providers);
    const router = Router.createPlatformRouter(routes, injector);
    return new Platform(injector, router);
  }
}
