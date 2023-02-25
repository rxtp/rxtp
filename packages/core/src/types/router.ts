import { HttpMethods } from './http.js';
import { Providers, Type } from './injector.js';
import { Middlewares } from './middleware.js';
import { Handler } from '../handler.js';
import { Injector } from '../injector.js';
import { Message } from '../message.js';

/**
 * A `Path` is a string that represents a route.
 *
 * @public
 */
export type Path = string;

/**
 * Defines the base properties of a route.
 *
 * @internal
 */
interface RouteBase {
  /**
   * The path of the route.
   */
  path: Path;

  /**
   * The `Providers` that will be registered to the route's injector.
   */
  providers?: Providers;

  /**
   * The `Middleware`s that will be executed before and after the route's
   * handler.
   */
  middlewares?: Middlewares;
}

/**
 * A `ParentRoute` is a route that has children. It is used to group routes
 * together. It can also be used to provide providers and middlewares to all
 * its children.
 *
 * @public
 */
export interface ParentRoute extends RouteBase {
  /**
   * The children of the route. The children will inherit the route's providers
   * and middlewares. If a child has the same provider as its parent, the
   * child's provider will override the parent's provider.
   */
  children: Route[];
}

/**
 * A `HandlerRoute` is a route that has a handler. It is used to handle requests
 * to a specific path.
 *
 * @public
 */
export interface HandlerRoute extends RouteBase {
  /**
   * The `Handler` that will handle requests to the route.
   */
  handler: Type<Handler>;

  /**
   * The `HttpMethods` that the route will handle.
   */
  methods: HttpMethods;
}

/**
 * A `RedirectRoute` is a route that redirects requests to another path.
 *
 * @public
 */
export interface RedirectRoute extends RouteBase {
  /**
   * The `Path` to redirect to.
   */
  redirectTo: Path;

  /**
   * The `HttpMethods` that the route will handle.
   */
  methods: HttpMethods;
}

/**
 * A `Route` is a `ParentRoute`, `HandlerRoute`, or `RedirectRoute`.
 */
export type Route = ParentRoute | HandlerRoute | RedirectRoute;

/**
 * An array of `Route`s.
 *
 * @public
 */
export type Routes = Route[];

/**
 * A `RegisteredRoute` is a `HandlerRoute` or `RedirectRoute` that has been
 * registered.
 *
 * @internal
 */
export type RegisteredRoute = [
  HandlerRoute | RedirectRoute | undefined,
  Middlewares,
  Injector
];

/**
 * A `MatchedRoutes` is a `Map` of `Path`s to `RegisteredRoute`s.
 *
 * @internal
 */
export type MatchedRoutes = Map<Path, RegisteredRoute>;

/**
 * A `ResolvedRoute` is a `Message` and a `RegisteredRoute`.
 *
 * @internal
 */
export type ResolvedRoute = [Message, RegisteredRoute];

/**
 * The `Params` of a `Route`.
 *
 * @public
 */
export type Params = Record<string, string>;
