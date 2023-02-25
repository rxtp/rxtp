import { Providers, Type } from './injector.js';
import { Middleware } from '../middleware.js';
import { Handler } from '../handler.js';
import { Injector } from '../injector.js';

export type Path = string;

export type MatchedRoute = [
  HandlerRoute | RedirectRoute | undefined,
  Type<Middleware>[],
  Injector
];

interface RouteConfiguration {
  path: Path;
  providers?: Providers;
  middlewares?: Type<Middleware>[];
}

export interface ParentRoute extends RouteConfiguration {
  children: Route[];
}

export interface HandlerRoute extends RouteConfiguration {
  handler: Type<Handler>;
}

export interface RedirectRoute extends RouteConfiguration {
  redirectTo: Path;
}

export type Route = ParentRoute | HandlerRoute | RedirectRoute;
