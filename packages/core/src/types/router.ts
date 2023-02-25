import { Providers, Type } from './injector.js';
import { Middleware } from '../middleware.js';
import { Handler } from '../handler.js';
import { Injector } from '../injector.js';

export type Path = URL['pathname'];

export type MatchedRoute = [
  HandlerRoute | RedirectRoute | undefined,
  Type<Middleware>[],
  Injector
];

interface SingleConfiguration {
  providers?: Providers;
  middlewares?: Type<Middleware>[];
}

export interface HandlerConfiguration extends SingleConfiguration {
  handler: Type<Handler>;
}

export interface RedirectConfiguration extends SingleConfiguration {
  redirectTo: Path;
}

interface RouteConfiguration extends SingleConfiguration {
  path: Path;
}

export interface ParentRoute extends RouteConfiguration {
  children: Route[];
}

export type HandlerRoute = RouteConfiguration & HandlerConfiguration;

export type RedirectRoute = RouteConfiguration & RedirectConfiguration;

export type Route = ParentRoute | HandlerRoute | RedirectRoute;
