import { Route, HandlerRoute, RedirectRoute } from '../types/router.js';
import { isDefined, isFunction, isObject, isString } from './check.js';

export function isHandlerRoute(route: Route): route is HandlerRoute {
  return (
    isObject(route) &&
    isDefined(route['handler']) &&
    isFunction(route['handler'])
  );
}

export function isRedirectRoute(route: Route): route is RedirectRoute {
  return (
    isObject(route) &&
    isDefined(route['redirectTo']) &&
    isString(route['redirectTo'])
  );
}
