import { HttpMethods } from './http.js';
import { Providers, Type } from './injector.js';
import { Middlewares } from './middleware.js';
import { Handler } from '../handler.js';
import { Injector } from '../injector.js';
import { Message } from '../message.js';

export type Path = string;

interface RouteBase {
  path: Path;
  methods: HttpMethods;
  providers?: Providers;
  middlewares?: Middlewares;
}

export interface HandlerRoute extends RouteBase {
  handler: Type<Handler>;
}

export interface RedirectRoute extends RouteBase {
  redirectTo: Path;
}

export type Route = HandlerRoute | RedirectRoute;

export type Routes = Route[];

export type RegisteredRoute = [
  HandlerRoute | RedirectRoute | undefined,
  Middlewares,
  Injector
];

export type MatchedRoutes = Map<Path, RegisteredRoute>;

export type ResolvedRoute = [Message, RegisteredRoute];

export type Params = Record<string, string>;
