import { Type } from './injector.js';
import { Middleware } from '../middleware.js';

export type Middlewares = Type<Middleware>[];

export type MiddlewareLifecycle = keyof Middleware;
