import {
  HandlerRoute,
  MatchedRoutes,
  Params,
  ParentRoute,
  Path,
  RedirectRoute,
  ResolvedRoute,
  Route,
  Routes,
} from './types/router.js';
import { Lifecycle, Providers } from './types/injector.js';
import { Middlewares } from './types/middleware.js';
import { InjectionToken, Injector } from './injector.js';
import { Message } from './message.js';
import {
  isHandlerRoute,
  isParentRoute,
  isRedirectRoute,
} from './utilities/router.js';
import { combineLatest, map, of, OperatorFunction, switchMap } from 'rxjs';

function matchedRoutesFactory(
  routes: Routes,
  injector: Injector
): MatchedRoutes {
  const matchedRoutes: MatchedRoutes = new Map();
  function pathForRoute(route: Route, path: Path): Path {
    return !path.endsWith('/') &&
      route.path !== '' &&
      !route.path.startsWith('/')
      ? `${path}/${route.path}`
      : `${path}${route.path}`;
  }
  function matchParentRoute(
    route: ParentRoute,
    path: Path,
    middlewares: Middlewares,
    injector: Injector
  ) {
    for (const childRoute of route.children) {
      matchRoute(childRoute, path, middlewares, injector);
    }
  }
  function matchHandlerRoute(
    route: HandlerRoute,
    path: Path,
    middlewares: Middlewares,
    injector: Injector
  ) {
    const routePath = pathForRoute(route, path);
    const routeMiddlewares: Middlewares = [
      ...middlewares,
      ...(route.middlewares ?? []),
    ];
    const routeProviders: Providers = [
      { provide: route.handler, useClass: route.handler },
      ...(route.providers ?? []),
      ...routeMiddlewares,
    ];
    const routeInjector = Injector.createRouteInjector(
      routeProviders,
      injector
    );
    matchedRoutes.set(routePath, [route, routeMiddlewares, routeInjector]);
  }
  function matchRedirectRoute(
    route: RedirectRoute,
    path: Path,
    middlewares: Middlewares,
    injector: Injector
  ) {
    const routePath = pathForRoute(route, path);
    const routeMiddlewares: Middlewares = [
      ...middlewares,
      ...(route.middlewares ?? []),
    ];
    const routeProviders: Providers = [
      ...(route.providers ?? []),
      ...routeMiddlewares,
    ];
    const routeInjector = Injector.createRouteInjector(
      routeProviders,
      injector
    );
    matchedRoutes.set(routePath, [route, routeMiddlewares, routeInjector]);
  }
  function matchRoute(
    route: Route,
    path: Path,
    middlewares: Middlewares,
    injector: Injector
  ) {
    if (isParentRoute(route)) {
      matchParentRoute(route, path, middlewares, injector);
    }
    if (isHandlerRoute(route)) {
      matchHandlerRoute(route, path, middlewares, injector);
    }
    if (isRedirectRoute(route)) {
      matchRedirectRoute(route, path, middlewares, injector);
    }
  }
  for (const route of routes) {
    matchRoute(route, '', [], injector);
  }
  return matchedRoutes;
}

export const ROUTES = new InjectionToken<Routes>('ROUTES');

export const MATCHED_ROUTES = new InjectionToken<MatchedRoutes>(
  'MATCHED_ROUTES',
  {
    useFactory: matchedRoutesFactory,
    deps: [ROUTES, Injector],
    lifecycle: Lifecycle.Singleton,
  }
);

export function routeMessage(
  injector: Injector
): OperatorFunction<Message, ResolvedRoute> {
  return (message$) => {
    return message$.pipe(
      switchMap((message) =>
        combineLatest([of(message), injector.resolve(MATCHED_ROUTES)])
      ),
      map(([message, matchedRoutes]) => {
        const messageMethod = message.method;
        const messagePathname: Path = message.url.pathname;
        const messagePathnameSegments = messagePathname.split('/');
        messagePathnameSegments.shift();
        const messagePathnameSegmentsLength = messagePathnameSegments.length;
        for (const [routePathname, route] of matchedRoutes.entries()) {
          if (!route[0].methods.includes(messageMethod)) continue;
          const routePathnameSegments = routePathname.split('/');
          routePathnameSegments.shift();
          const routePathnameSegmentsLength = routePathnameSegments.length;
          if (
            (messagePathnameSegmentsLength === 1 &&
              messagePathnameSegments[0] === '' &&
              routePathnameSegmentsLength === 0) ||
            routePathnameSegments[0] === '**'
          ) {
            return [message, route];
          }
          if (routePathnameSegmentsLength !== messagePathnameSegmentsLength) {
            continue;
          }
          const params: Params = {};
          let isMatch = true;
          for (let i = 0; i < routePathnameSegmentsLength; i++) {
            const messagePathnameSegment = messagePathnameSegments[i];
            const routePathnameSegment = routePathnameSegments[i];
            if (routePathnameSegment === '**') {
              isMatch = true;
              break;
            }
            if (routePathnameSegment.startsWith(':')) {
              isMatch = true;
              const paramName = routePathnameSegment.slice(1);
              params[paramName] = messagePathnameSegment;
            } else if (routePathnameSegment !== messagePathnameSegment) {
              isMatch = false;
              break;
            }
          }
          if (isMatch) {
            message.params = params;
            return [message, route];
          }
        }
        return [message, [undefined, [], this.injector]];
      })
    );
  };
}
