import { ResolvedRoute, Routes } from './types/router.js';
import { Injectable, Injector } from './injector.js';
import { Message } from './message.js';
import { map, OperatorFunction } from 'rxjs';
import { isHandlerRoute } from './utilities/router.js';

@Injectable()
export class Router {
  constructor(
    private readonly routes: Routes,
    private readonly injector: Injector
  ) {}

  public routeMessage(): OperatorFunction<Message, ResolvedRoute> {
    return (message$) =>
      message$.pipe(
        map((message) => {
          const url = message.url;
          const method = message.method;
          const route = this.routes.find(
            (r) => r.path === url.pathname && r.methods.includes(method)
          );
          if (route === undefined)
            return [message, [undefined, [], this.injector]];
          const providers = [
            ...(route.middlewares ?? []),
            ...(route.providers ?? []),
          ];
          if (isHandlerRoute(route)) providers.push(route.handler);
          const routeInjector = Injector.createRouteInjector(
            providers,
            this.injector
          );
          return [message, [route, route.middlewares ?? [], routeInjector]];
        })
      );
  }

  public static createPlatformRouter(
    routes: Routes,
    injector: Injector
  ): Router {
    return new Router(routes, injector);
  }
}
