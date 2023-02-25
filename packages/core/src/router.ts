import {
  HandlerRoute,
  ParentRoute,
  RedirectRoute,
  Route,
  MatchedRoute,
  Path,
} from './types/router.js';
import { Provider, Type } from './types/injector.js';
import { Middleware } from './middleware.js';
import { Injector } from './injector.js';
import { Message } from './message.js';
import { isDefined } from './utilities/check.js';
import {
  isHandlerRoute,
  isParentRoute,
  isRedirectRoute,
} from './utilities/router.js';
import { map, OperatorFunction } from 'rxjs';

export class Router {
  private readonly _routes = new Map<string, MatchedRoute>();

  constructor(readonly routes: Route[], readonly injector: Injector) {
    for (const route of routes) {
      this.registerRoute(route);
    }
  }

  registerRoute(
    route: Route,
    path: Path = '/',
    middlewares: Type<Middleware>[] = [],
    injector: Injector = this.injector
  ) {
    if (isParentRoute(route)) {
      this._registerParentRoute(route, path, middlewares, injector);
    }
    if (isHandlerRoute(route)) {
      this._registerHandlerRoute(route, path, middlewares, injector);
    }
    if (isRedirectRoute(route)) {
      this._registerRedirectRoute(route, path, middlewares, injector);
    }
  }

  private _pathForRoute(route: Route, path: string): string {
    let routePath = path;
    if (
      !routePath.endsWith('/') &&
      route.path !== '' &&
      !route.path.startsWith('/')
    ) {
      routePath += '/';
    }
    return `${routePath}${route.path}`;
  }

  private _registerHandlerRoute(
    route: HandlerRoute,
    path: string,
    middlewares: Type<Middleware>[],
    injector: Injector
  ) {
    const routePath = this._pathForRoute(route, path);
    const routeMiddlewares: Type<Middleware>[] = [
      ...middlewares,
      ...(route.middlewares ?? []),
    ];
    const routeProviders: Provider<unknown>[] = [
      { provide: route.handler, useClass: route.handler },
      ...(route.providers ?? []),
      ...routeMiddlewares,
    ];
    const routeInjector = new Injector(routeProviders, injector);
    this._routes.set(routePath, [route, routeMiddlewares, routeInjector]);
  }

  private _registerRedirectRoute(
    route: RedirectRoute,
    path: string,
    middlewares: Type<Middleware>[],
    injector: Injector
  ) {
    const routePath = this._pathForRoute(route, path);
    const routeMiddlewares: Type<Middleware>[] = [
      ...middlewares,
      ...(route.middlewares ?? []),
    ];
    const routeProviders: Provider<unknown>[] = [
      ...(route.providers ?? []),
      ...routeMiddlewares,
    ];
    const routeInjector = new Injector(routeProviders, injector);
    this._routes.set(routePath, [route, routeMiddlewares, routeInjector]);
  }

  private _registerParentRoute(
    route: ParentRoute,
    path: string,
    middlewares: Type<Middleware>[],
    injector: Injector
  ) {
    const parentPath = this._pathForRoute(route, path);
    const parentMiddlewares: Type<Middleware>[] = [
      ...middlewares,
      ...(route.middlewares ?? []),
    ];
    const parentProviders: Provider<unknown>[] = [
      ...(route.providers ?? []),
      ...parentMiddlewares,
    ];
    const parentInjector = new Injector(parentProviders, injector);
    for (const childRoute of route.children) {
      this.registerRoute(
        childRoute,
        parentPath,
        parentMiddlewares,
        parentInjector
      );
    }
  }

  route$(): OperatorFunction<Message, [Message, MatchedRoute]> {
    return (message$) => {
      return message$.pipe(
        map((message) => {
          const messagePathname: Path = message.url.pathname.replace(/\/$/, '');
          const route = this._routes.get(messagePathname);
          if (isDefined(route)) {
            return [message, route];
          } else {
            const messagePathnameSegments = messagePathname.split('/');
            for (let i = messagePathnameSegments.length - 1; i >= 0; i--) {
              const messagePathnameSegment = messagePathnameSegments[i];
              const isLastSegment = i === messagePathnameSegments.length - 1;
              if (isLastSegment) {
                messagePathnameSegments[i] = '*';
              } else {
                messagePathnameSegments[i] = '*';
                messagePathnameSegments.splice(
                  i + 1,
                  messagePathnameSegments.length - i - 1
                );
              }
              const messageWildcardPathname = messagePathnameSegments.join('/');
              const wildcardRoute = this._routes.get(messageWildcardPathname);
              if (isDefined(wildcardRoute)) {
                return [message, wildcardRoute];
              }
              messagePathnameSegments[i] = messagePathnameSegment;
            }
            return [message, [undefined, [], this.injector]];
          }
        })
      );
    };
  }
}
